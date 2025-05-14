/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var XAdsPipeline = class XAdsPipeline extends AbstractPipeline {
  constructor(config, connector, storageName = "GoogleSheetsStorage") {
    super(config.mergeParameters({
      DestinationTableNamePrefix: {
        default: ""
      }
    }), connector);

    this.storageName = storageName;
  }

  /**
   * Main method - entry point for the import process
   * Processes all nodes defined in the fields configuration
   */
  startImportProcess() {
    const dataSources = XAdsHelper.parseDataSources(this.config.DataSources.value);    
    const accountIds = XAdsHelper.parseAccountIds(this.config.AccountIDs.value);

    // Process each account
    for (const accountId of accountIds) {
      try {
        // Process all nodes for this account
        for (const nodeName in dataSources) {
          this.processNode({
            nodeName,
            accountId,
            fields: dataSources[nodeName] || []
          });
        }
      } catch (error) {
        console.error(`Error processing account ${accountId}:`, error);
      } finally {
        // Clear tweets cache after processing all nodes for this account
        this.connector.clearTweetsCache(accountId);
      }
    }
  }

  /**
   * Process a single node for a specific account
   * @param {Object} options - Processing options
   * @param {string} options.nodeName - Name of the node to process
   * @param {string} options.accountId - Account ID
   * @param {Array<string>} options.fields - Array of fields to fetch
   */
  processNode({ nodeName, accountId, fields }) {
    const storage = this.getStorageByNode(nodeName);
    if (this.connector.fieldsSchema[nodeName].isTimeSeries) {
      this.processTimeSeriesNode({
        nodeName,
        accountId,
        fields,
        storage
      });
    } else {
      this.processCatalogNode({
        nodeName,
        accountId,
        fields,
        storage
      });
    }
  }

  /**
   * Process a time series node (e.g., analytics)
   * @param {Object} options - Processing options
   * @param {string} options.nodeName - Name of the node
   * @param {string} options.accountId - Account ID
   * @param {Array<string>} options.fields - Array of fields to fetch
   * @param {Object} options.storage - Storage instance
   */
  processTimeSeriesNode({ nodeName, accountId, fields, storage }) {
    const [startDate, daysToFetch] = this.getStartDateAndDaysToFetch();
  
    if (daysToFetch <= 0) {
      console.log('No days to fetch for time series data');
      return;
    }
  
    for (let i = 0; i < daysToFetch; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      const formattedDate = Utilities.formatDate(currentDate, "UTC", "yyyy-MM-dd");
      
      try {
        const params = {
          start_time: formattedDate,
          end_time: formattedDate,
          fields: fields
        };
  
        const rawData = this.connector.fetchData(nodeName, accountId, params);
  
        this.config.logMessage(
          `${rawData.length} rows of ${nodeName} were fetched for ${accountId} on ${formattedDate}`
        );
  
        if (rawData.length > 0) {
          const schemaFields = Object.keys(this.connector.fieldsSchema[nodeName].fields);
          const filtered = rawData.map(record =>
            Object.fromEntries(
              Object.entries(record)
                .filter(([key]) => schemaFields.includes(key))
            )
          );
          storage.saveData(filtered);
        }
      } catch (error) {
        console.error(
          `Error fetching ${nodeName} data for account ${accountId} on ${formattedDate}:`,
          error
        );
      }
  
      this.config.updateLastRequstedDate(currentDate);
    }
  }
  
  /**
   * Process a catalog node (e.g., campaigns, line items)
   * @param {Object} options - Processing options
   * @param {string} options.nodeName - Name of the node
   * @param {string} options.accountId - Account ID
   * @param {Array<string>} options.fields - Array of fields to fetch
   * @param {Object} options.storage - Storage instance
   */
  processCatalogNode({ nodeName, accountId, fields, storage }) {
    try {
      const rawData = this.connector.fetchData(nodeName, accountId, { fields });
      this.config.logMessage(`${rawData.length} rows of ${nodeName} were fetched for ${accountId}`);

      if (rawData && rawData.length) {
        const schemaFields = Object.keys(this.connector.fieldsSchema[nodeName].fields);
        const filtered = rawData.map(record =>
          Object.fromEntries(
            Object.entries(record)
              .filter(([key]) => schemaFields.includes(key))
          )
        );
        storage.saveData(filtered);
      }
    } catch (error) {
      console.error(`Error fetching ${nodeName} data for account ${accountId}:`, error);
    }
  }

  /**
   * Get storage instance for a node
   * @param {string} nodeName - Name of the node
   * @returns {Object} Storage instance
   */
  getStorageByNode(nodeName) {
    if (!("storages" in this)) {
      this.storages = {};
    }

    if (!(nodeName in this.storages)) {
      if (!("uniqueKeys" in this.connector.fieldsSchema[nodeName])) {
        throw new Error(`Unique keys for '${nodeName}' are not defined in the fields schema`);
      }

      const uniqueFields = this.connector.fieldsSchema[nodeName].uniqueKeys;

      this.storages[nodeName] = new globalThis[this.storageName](
        this.config.mergeParameters({
          DestinationSheetName: { value: nodeName },
          DestinationTableName: { value: this.config.DestinationTableNamePrefix.value + nodeName.replace(/[^a-zA-Z0-9_]/g, "_") }
        }),
        uniqueFields,
        this.connector.fieldsSchema[nodeName].fields,
        `${this.connector.fieldsSchema[nodeName].description} ${this.connector.fieldsSchema[nodeName].documentation}`
      );
    }

    return this.storages[nodeName];
  }
} 