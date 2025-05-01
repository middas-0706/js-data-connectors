/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var LinkedAdsPipeline = class LinkedAdsPipeline extends AbstractPipeline {
  constructor(config, connector, storageName = "GoogleSheetsStorage") {
    super(config.mergeParameters({
      StartDate: { isRequired: true, requiredType: "date" },
      EndDate: { requiredType: "date" },
      AccountURNs: { isRequired: true },
      Fields: { isRequired: true },
      MaxFetchingDays: { default: 30, requiredType: "number" },
      ReimportLookbackWindow: { default: 2, requiredType: "number" },
      CleanUpToKeepWindow: { default: 4, requiredType: "number" },
      DestinationTableNamePrefix: { default: "" }
    }), connector);

    this.storageName = storageName;
    this.storages = {};
  }

  formatAccountUrn(accountId) {
    // If it's already a number, return it
    if (!isNaN(accountId)) {
      return parseInt(accountId);
    }
    
    // If it's a URN, extract the numeric ID
    if (accountId.startsWith('urn:li:sponsoredAccount:')) {
      return parseInt(accountId.replace('urn:li:sponsoredAccount:', ''));
    }
    
    // If it's just a number as string, parse it
    return parseInt(accountId);
  }

  process() {
    const accountUrns = String(this.config.AccountURNs.value)
      .split(/[,;]\s*/)
      .map(id => this.formatAccountUrn(id.trim()));

    const fields = this.config.Fields.value.split(", ").reduce((acc, pair) => {
      let [key, value] = pair.split(" ");
      (acc[key] = acc[key] || []).push(value.trim());
      return acc;
    }, {});

    console.log('Fields:', fields);

    for (const nodeName in fields) {
      console.log(`Starting processing for node: ${nodeName}`);
      
      for (const accountUrn of accountUrns) {
        console.log(`Processing ${nodeName} for account ${accountUrn}`);
        
        let params = {
          fields: fields[nodeName]
        };

        // Add date range for adAnalytics
        if (nodeName === 'adAnalytics') {
          const endDate = this.config.EndDate.value || new Date();
          params.startDate = this.config.StartDate.value;
          params.endDate = endDate;
        }
        
        console.log(`Fetching data for ${nodeName} with params:`, params);
        const data = this.connector.fetchData(nodeName, accountUrn, params);
        console.log(`Fetched ${data.length} rows for ${nodeName}`);
        
        if (data.length) {
          this.config.logMessage(`${data.length} rows of ${nodeName} were fetched for account ${accountUrn}`);
          
          console.log(`Getting storage for ${nodeName}`);
          const storage = this.getStorageByNode(nodeName);
          console.log(`Storage obtained for ${nodeName}`);
          
          console.log(`Saving data to storage for ${nodeName}`);
          storage.saveData(data);
          console.log(`Data saved successfully for ${nodeName}`);
        } else {
          console.log(`No data fetched for ${nodeName} and account ${accountUrn}`);
        }
      }
    }
  }

  getStorageByNode(nodeName) {
    if (!this.storages[nodeName]) {
      if (!this.connector.fieldsSchema[nodeName].uniqueKeys) {
        throw new Error(`Unique keys for '${nodeName}' are not defined in the fields schema`);
      }

      const uniqueFields = this.connector.fieldsSchema[nodeName].uniqueKeys;
      const fields = this.connector.fieldsSchema[nodeName].fields;
      const description = `${this.connector.fieldsSchema[nodeName].description} ${this.connector.fieldsSchema[nodeName].documentation}`;

      console.log(`Creating storage with params:`, {
        nodeName,
        uniqueFields,
        fields,
        description
      });

      if (typeof globalThis[this.storageName] === 'undefined') {
        throw new Error(`Storage class '${this.storageName}' is not defined`);
      }

      this.storages[nodeName] = new globalThis[this.storageName](
        this.config.mergeParameters({
          DestinationSheetName: { value: nodeName },
          DestinationTableName: { value: this.config.DestinationTableNamePrefix.value + nodeName.replace(/[^a-zA-Z0-9_]/g, "_") }
        }),
        uniqueFields,
        fields,
        description
      );

      console.log(`Storage for ${nodeName} created successfully`);
    }

    return this.storages[nodeName];
  }
}; 