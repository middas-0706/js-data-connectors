/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var LinkedInHelper = {
  /**
   * Format LinkedIn account URN to a numeric ID
   * @param {string|number} accountId - Account ID or URN
   * @return {number} Numeric account ID
   */
  formatAccountUrn: function(accountId) {
    if (!isNaN(accountId)) {
      return parseInt(accountId);
    }
    
    if (accountId.startsWith('urn:li:sponsoredAccount:')) {
      return parseInt(accountId.replace('urn:li:sponsoredAccount:', ''));
    }
    
    return parseInt(accountId);
  },

  /**
   * Parse multiple account URNs from a comma or semicolon separated string
   * @param {string} accountUrnsString - Comma/semicolon separated list of account IDs/URNs
   * @return {Array<number>} Array of numeric account IDs
   */
  parseAccountUrns: function(accountUrnsString) {
    return String(accountUrnsString)
      .split(/[,;]\s*/)
      .map(id => this.formatAccountUrn(id.trim()));
  },

  /**
   * Parse fields string into a structured object
   * @param {string} fieldsString - Fields string in format "nodeName fieldName, nodeName fieldName"
   * @return {Object} Object with node names as keys and arrays of field names as values
   */
  parseFields: function(fieldsString) {
    return fieldsString.split(", ").reduce((acc, pair) => {
      let [key, value] = pair.split(" ");
      (acc[key] = acc[key] || []).push(value.trim());
      return acc;
    }, {});
  },
  
  /**
   * Format an array of field names for use in API URLs
   * @param {Array<string>} fields - Array of field names
   * @return {string} Comma-separated string of URL-encoded field names
   */
  formatFields: function(fields) {
    return fields.map(field => encodeURIComponent(field)).join(",");
  },
  
  /**
   * Format date for LinkedIn API URL parameters
   * @param {Date} date - Date object
   * @return {string} Formatted date string for LinkedIn API
   */
  formatDateForUrl: function(date) {
    return `(year:${date.getFullYear()},month:${date.getMonth() + 1},day:${date.getDate()})`;
  }
};
