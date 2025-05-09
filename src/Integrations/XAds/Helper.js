/**
 * Helper functions for X Ads integration
 */

const XAdsHelper = {
  /**
   * Format date for X Ads API
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string in ISO format
   */
  formatDate(date) {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd\'T\'00:00:00\'Z\'');
  },

  /**
   * Format the next day for X Ads API
   * @param {Date} date - Current date
   * @returns {string} Formatted next day string in ISO format
   */
  formatNextDay(date) {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return this.formatDate(nextDay);
  },

  /**
   * Validate X Ads credentials
   * @param {Object} credentials - X Ads API credentials
   * @returns {boolean} True if credentials are valid
   */
  validateCredentials(credentials) {
    return !!(credentials.apiKey && 
              credentials.apiSecret && 
              credentials.accessToken && 
              credentials.accessTokenSecret);
  },

  /**
   * Generate a random nonce for OAuth 1.0a
   * @returns {string} Random nonce
   */
  generateNonce() {
    return Utilities.getUuid().replace(/-/g, '');
  },

  /**
   * Create a clean table name from a data source
   * @param {string} dataSource - Data source name
   * @returns {string} Clean table name
   */
  createTableName(dataSource) {
    return `XAds_${dataSource.replace(/\s+/g, '_')}`;
  },

  /**
   * Parse data sources from config
   * @param {OWOX.GoogleSheetsConfig} config - Configuration
   * @returns {Array<string>} Array of data sources
   */
  parseDataSources(config) {
    const sources = [];
    
    // Parse the Fields parameter for data sources
    if (config.Fields && config.Fields.value) {
      const fields = config.Fields.value.split(',');
      for (const field of fields) {
        sources.push(field.trim());
      }
    }
    
    // Parse the DataSources parameter if present
    if (config.DataSources && config.DataSources.value) {
      const dataSources = config.DataSources.value.split(',');
      for (const dataSource of dataSources) {
        sources.push(dataSource.trim());
      }
    }
    
    return sources;
  },

  /**
   * Split entity IDs into batches for API calls
   * @param {Array<string>} entityIds - Entity IDs
   * @param {number} batchSize - Batch size (default: 20)
   * @returns {Array<string>} Batched entity IDs
   */
  batchEntityIds(entityIds, batchSize = 20) {
    const batches = [];
    for (let i = 0; i < entityIds.length; i += batchSize) {
      batches.push(entityIds.slice(i, i + batchSize).join(','));
    }
    return batches;
  }
}; 