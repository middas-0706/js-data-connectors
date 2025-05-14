/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const XAdsHelper = {
  /**
   * Parse data sources string into an object with source names as keys
   * @param {string} sourcesString - Comma/semicolon separated list of data source names
   * @return {Object} Object with data source names as keys and empty arrays as values
   */
  parseDataSources(sourcesString) {
    return String(sourcesString)
      .split(/[,;]\s*/)
      .reduce((obj, name) => {
        obj[name.trim()] = [];
        return obj;
      }, {});
  },

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
};
