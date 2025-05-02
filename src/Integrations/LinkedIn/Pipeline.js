/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var LinkedInPipeline = class LinkedInPipeline extends AbstractPipeline {
  constructor(config, connector, storageName = "GoogleSheetsStorage") {
    super(config.mergeParameters({
      DestinationTableNamePrefix: {
        default: ""
      }
    }), connector);

    this.storageName = storageName;
  }

  // Main method - entry point
  startImportProcess() {
    const apiType = this.connector.apiType;
    const fields = LinkedInHelper.parseFields(this.config.Fields.value);
    console.log('Fields:', fields);
    
    if (apiType === "Ads") {
      this.startAdsImportProcess(fields);
    } else {
      throw new Error("Unknown API type: " + apiType);
    }
  }
  
  // LinkedIn Ads API import process
  startAdsImportProcess(fields) {
    const accountUrns = LinkedInHelper.parseAccountUrns(this.config.AccountURNs.value);
    
    for (const nodeName in fields) {
      this.processNode({
        nodeName,
        accountUrns,
        fields: fields[nodeName]
      });
    }
  }

  // Core business logic methods
  processNode({ nodeName, accountUrns, fields }) {
    const isTimeSeriesNode = this.isTimeSeriesNode(nodeName);
    const dateInfo = this.prepareDateRangeIfNeeded(nodeName, isTimeSeriesNode);
    
    if (isTimeSeriesNode && !dateInfo) {
      return; // Skip processing if date range preparation failed
    }
    
    this.fetchAndSaveData({
      nodeName, 
      accountUrns, 
      fields, 
      isTimeSeriesNode,
      ...dateInfo
    });
    
    // Update LastRequestedDate only for time series data
    if (isTimeSeriesNode) {
      this.config.updateLastRequstedDate(dateInfo.endDate);
    }
  }
  
  fetchAndSaveData({ nodeName, accountUrns, fields, isTimeSeriesNode, startDate, endDate }) {
    for (const accountUrn of accountUrns) {
      console.log(`Processing ${nodeName} for account ${accountUrn}${isTimeSeriesNode ? ` from ${startDate} to ${endDate}` : ''}`);
      
      const params = this.prepareRequestParams(fields, isTimeSeriesNode, startDate, endDate);
      const data = this.fetchData(nodeName, accountUrn, params);
      
      this.saveDataToStorage({ 
        nodeName, 
        accountUrn, 
        data, 
        ...(isTimeSeriesNode && { startDate, endDate })
      });
    }
  }

  // Data fetching and storage methods
  fetchData(nodeName, accountUrn, params) {
    console.log(`Fetching data for ${nodeName} with params:`, params);
    const data = this.connector.fetchData(nodeName, accountUrn, params);
    console.log(`Fetched ${data.length} rows for ${nodeName}`);
    return data;
  }

  saveDataToStorage({ nodeName, accountUrn, data, startDate, endDate }) {
    if (data.length) {
      const message = endDate 
        ? `${data.length} rows of ${nodeName} were fetched for account ${accountUrn} from ${startDate} to ${endDate}`
        : `${data.length} rows of ${nodeName} were fetched for account ${accountUrn}`;
      
      this.config.logMessage(message);
      const storage = this.getStorageByNode(nodeName);
      storage.saveData(data);
    } else {
      console.log(`No data fetched for ${nodeName} and account ${accountUrn}${endDate ? ` from ${startDate} to ${endDate}` : ''}`);
    }
  }

  getStorageByNode(nodeName) {
    // initiate blank object for storages
    if (!("storages" in this)) {
      this.storages = {};
    }

    if (!(nodeName in this.storages)) {
      if (!("uniqueKeys" in this.connector.fieldsSchema[nodeName])) {
        throw new Error(`Unique keys for '${nodeName}' are not defined in the fields schema`);
      }

      let uniqueFields = this.connector.fieldsSchema[nodeName]["uniqueKeys"];

      this.storages[nodeName] = new globalThis[this.storageName](
        this.config.mergeParameters({
          DestinationSheetName: { value: nodeName },
          DestinationTableName: { value: this.config.DestinationTableNamePrefix.value + nodeName.replace(/[^a-zA-Z0-9_]/g, "_") }
        }),
        uniqueFields,
        this.connector.fieldsSchema[nodeName]["fields"],
        `${this.connector.fieldsSchema[nodeName]["description"]} ${this.connector.fieldsSchema[nodeName]["documentation"]}`
      );
    }

    return this.storages[nodeName];
  }

  // Parameter preparation methods
  prepareRequestParams(fields, isTimeSeriesNode, startDate, endDate) {
    const params = { fields };
    
    if (isTimeSeriesNode) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    
    return params;
  }
  
  prepareDateRangeIfNeeded(nodeName, isTimeSeriesNode) {
    if (!isTimeSeriesNode) {
      return null;
    }
    
    const [startDate, daysToFetch] = this.getStartDateAndDaysToFetch();
    if (daysToFetch <= 0) {
      console.log(`Skipping ${nodeName} as daysToFetch is ${daysToFetch}`);
      return null;
    }
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysToFetch - 1);
    console.log(`Processing time series data from ${startDate} to ${endDate}`);
    
    return { startDate, endDate };
  }

  isTimeSeriesNode(nodeName) {
    return this.connector.fieldsSchema[nodeName] && 
           this.connector.fieldsSchema[nodeName].isTimeSeries === true;
  }
};
