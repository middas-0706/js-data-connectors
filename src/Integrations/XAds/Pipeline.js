/**
 * X Ads Pipeline implementation
 */

class XAdsPipeline extends AbstractPipeline {
  /**
   * Create a new X Ads Pipeline
   * @param {OWOX.GoogleSheetsConfig} config - Configuration
   * @param {XAdsConnector} connector - X Ads connector
   * @param {string} storageType - Storage type (GoogleSheetsStorage or GoogleBigQueryStorage)
   */
  constructor(config, connector, storageType) {
    super();
    this.config = config;
    this.connector = connector;
    
    // Initialize storage based on type
    switch (storageType) {
      case 'GoogleSheetsStorage':
        this.storage = new GoogleSheetsStorage();
        break;
      case 'GoogleBigQueryStorage':
        this.storage = new GoogleBigQueryStorage();
        break;
      default:
        throw new ConfigurationError(`Unknown storage type: ${storageType}`);
    }
  }

  /**
   * Main method - entry point for the import process
   * Processes all nodes defined in the fields configuration
   */
  startImportProcess() {
    const fields = this.parseFields(this.config.Fields.value);
    console.log('Fields:', fields);
    
    const accountIds = this.parseAccountIds(this.config.AccountId.value);
    
    for (const nodeName in fields) {
      this.processNode({
        nodeName,
        accountIds,
        fields: fields[nodeName]
      });
    }
  }

  /**
   * Parse account IDs from configuration
   * @param {string} accountIdsString - Comma/semicolon separated list of account IDs
   * @returns {Array<string>} Array of account IDs
   */
  parseAccountIds(accountIdsString) {
    return String(accountIdsString)
      .split(/[,;]\s*/)
      .map(id => id.trim());
  }

  /**
   * Parse fields string into a structured object
   * @param {string} fieldsString - Fields string in format "nodeName fieldName, nodeName fieldName"
   * @returns {Object} Object with node names as keys and arrays of field names as values
   */
  parseFields(fieldsString) {
    return fieldsString.split(", ").reduce((acc, pair) => {
      let [key, value] = pair.split(" ");
      (acc[key] = acc[key] || []).push(value.trim());
      return acc;
    }, {});
  }

  /**
   * Process a single node for all accounts
   * @param {Object} options - Processing options
   * @param {string} options.nodeName - Name of the node to process
   * @param {Array<string>} options.accountIds - Array of account IDs
   * @param {Array<string>} options.fields - Array of fields to fetch
   */
  async processNode({ nodeName, accountIds, fields }) {
    const storage = this.getStorageByNode(nodeName);
    
    // Check if this is a time series node
    if (this.connector.fieldsSchema[nodeName].isTimeSeries) {
      await this.processTimeSeriesNode(nodeName, accountIds, fields, storage);
    } else {
      await this.processCatalogNode(nodeName, accountIds, fields, storage);
    }
  }

  /**
   * Process a time series node (e.g., analytics)
   * @param {string} nodeName - Name of the node
   * @param {Array<string>} accountIds - Array of account IDs
   * @param {Array<string>} fields - Array of fields to fetch
   * @param {Object} storage - Storage instance
   */
  async processTimeSeriesNode(nodeName, accountIds, fields, storage) {
    const [startDate, daysToFetch] = this.getStartDateAndDaysToFetch();
    
    if (daysToFetch <= 0) {
      console.log('No days to fetch for time series data');
      return;
    }

    for (let i = 0; i < daysToFetch; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const formattedDate = this.formatDate(currentDate);
      
      for (const accountId of accountIds) {
        try {
          // For analytics data, we need to construct a proper params object
          // with start_time and end_time matching the date format expected by the API
          const params = {
            start_time: formattedDate,
            end_time: formattedDate,
            fields: fields
          };

          const data = await this.connector.fetchData(nodeName, accountId, params);
          if (data && data.length > 0) {
            await storage.save(data);
          }
        } catch (error) {
          console.error(`Error fetching ${nodeName} data for account ${accountId} on ${formattedDate}:`, error);
        }
      }
    }
  }

  /**
   * Get start date and number of days to fetch
   * @returns {Array} [startDate, daysToFetch]
   */
  getStartDateAndDaysToFetch() {
    const maxFetchingDays = this.config.MaxFetchingDays.value;
    const reimportLookbackWindow = this.config.ReimportLookbackWindow.value;
    
    // Calculate start date based on reimport window (default to 2 days back)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - reimportLookbackWindow);
    
    // Limit to max fetching days (default to 31)
    let daysToFetch = Math.min(maxFetchingDays, reimportLookbackWindow);
    
    return [startDate, daysToFetch];
  }

  /**
   * Process a catalog node (e.g., campaigns, line items)
   * @param {string} nodeName - Name of the node
   * @param {Array<string>} accountIds - Array of account IDs
   * @param {Array<string>} fields - Array of fields to fetch
   * @param {Object} storage - Storage instance
   */
  async processCatalogNode(nodeName, accountIds, fields, storage) {
    for (const accountId of accountIds) {
      try {
        const data = await this.connector.fetchData(nodeName, accountId, { fields });
        if (data && data.length > 0) {
          await storage.save(data);
        }
      } catch (error) {
        console.error(`Error fetching ${nodeName} data for account ${accountId}:`, error);
      }
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

  /**
   * Format date for API request
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate(date) {
    return Utilities.formatDate(date, "UTC", "yyyy-MM-dd");
  }
} 