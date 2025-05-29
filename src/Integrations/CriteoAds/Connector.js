/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var CriteoAdsConnector = class CriteoAdsConnector extends AbstractConnector {

  constructor(configRange) {

    super(configRange.mergeParameters({
      StandardSource: {
        isRequired: true,
        requiredType: "string",
      },
      StandardMedium: {
        isRequired: true,
        requiredType: "string",
      },
      StartDate: {
        isRequired: true,
        requiredType: "date",
      },
      EndDate: {
        isRequired: false,
        requiredType: "date",
      },
      AccountIDs: {
        isRequired: true,
      },
      AccessToken: {
        requiredType: "string"
      },
      ReimportLookbackWindow: {
        requiredType: "number",
        isRequired: true,
        default: 5
      },
      CleanUpToKeepWindow: {
        requiredType: "number"
      },
      ClientId: {
        isRequired: true,
        requiredType: "string"
      },
      ClientSecret: {
        isRequired: true,
        requiredType: "string"
      },
      MaxFetchingDays: {
        requiredType: "number",
        value: 30
      }
    }));

    this.fieldsSchema = CriteoAdsFieldsSchema;
  }

  /**
   * Return the credential fields needed for this connector
   * @returns {Object} Object with credential field names and their config objects
   */
  getCredentialFields() {
    return {
      ClientId: this.config.ClientId,
      ClientSecret: this.config.ClientSecret
    };
  }

  /**
   * Single entry point for *all* fetches.
   * @param {Object} opts
   * @param {string} opts.nodeName
   * @param {string} opts.accountId
   * @param {Array<string>} opts.fields
   * @param {Date} opts.date
   * @returns {Array<Object>}
   */
  fetchData({ nodeName, accountId, fields = [], date }) {
    switch (nodeName) {
      case 'statistics':
        return this._fetchStatistics({ accountId, fields, date });

      default:
        throw new Error(`Unknown node: ${nodeName}`);
    }
  }

  /**
   * Fetching statistics data
   * @param {Object} options - Fetching options
   * @param {string} options.accountId - Account ID
   * @param {Array<string>} options.fields - Fields to fetch
   * @param {Date} options.date - Date to fetch data for
   * @returns {Array<Object>} - Parsed and enriched data
   * @private
   */
  _fetchStatistics({ accountId, fields, date }) {
    const nodeName = 'statistics';
    const uniqueKeys = this.fieldsSchema[nodeName].uniqueKeys || [];
    const missingKeys = uniqueKeys.filter(key => !fields.includes(key));
    
    if (missingKeys.length > 0) {
      throw new Error(`Missing required unique fields for endpoint '${nodeName}'. Missing fields: ${missingKeys.join(', ')}`);
    }

    this.getAccessToken();
    
    const requestBody = this._buildStatisticsRequestBody(accountId, fields, date, nodeName);
    const response = this._makeApiRequest(requestBody);
    const jsonObject = JSON.parse(response.getContentText());
    
    return this.parseApiResponse(jsonObject, date);
  }

  /**
   * Build request body for statistics API
   * @param {string} accountId - Account ID
   * @param {Array<string>} fields - Fields to fetch
   * @param {Date} date - Date to fetch data for
   * @param {string} nodeName - Node name to get dimensions from schema
   * @returns {Object} - Request body
   * @private
   */
  _buildStatisticsRequestBody(accountId, fields, date, nodeName) {
    const fieldsSchema = this.fieldsSchema[nodeName].fields;
    
    // Filter fields into dimensions and metrics based on fieldType
    const dimensions = fields.filter(field => 
      fieldsSchema[field] && fieldsSchema[field].fieldType === 'dimension'
    );
    const metrics = fields.filter(field => 
      fieldsSchema[field] && fieldsSchema[field].fieldType === 'metric'
    );
    
    return {
      advertiserIds: accountId.toString(),
      timezone: "UTC",
      dimensions: dimensions,
      currency: "USD", //@TODO currency in interface
      format: "json",
      startDate: date,
      endDate: date,
      metrics: metrics
    };
  }

  /**
   * Make API request to statistics endpoint
   * @param {Object} requestBody - Request body
   * @returns {Object} - HTTP response
   * @private
   */
  _makeApiRequest(requestBody) {
    const apiUrl = 'https://api.criteo.com/2024-10/statistics/report';
    const options = {
      method: 'post',
      headers: {
        accept: '*/*',
        'content-type': 'application/json',
        authorization: "Bearer " + this.config.AccessToken.value
      },
      payload: JSON.stringify(requestBody)
    };

    const response = urlFetchWithRetry.fetch(apiUrl, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      return response;
    } else {
      throw new Error(`API Error (${responseCode}): ${response.getContentText()}`);
    }
  }

  /**
   * Get access token from API
   * Docs: https://developers.criteo.com/marketing-solutions/docs/authorization-code-setup
   */
  getAccessToken() {
    if (this.config.AccessToken?.value) {
      return;
    }

    const tokenUrl = 'https://api.criteo.com/oauth2/token';
    const options = {
      method: 'post',
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded'
      },
      payload: {
        grant_type: 'client_credentials',
        client_id: this.config.ClientId.value,
        client_secret: this.config.ClientSecret.value
      },
      muteHttpExceptions: true
    };
    
    try {
      const response = urlFetchWithRetry.fetch(tokenUrl, options);
      const responseData = JSON.parse(response.getContentText());
      const accessToken = responseData["access_token"];
      
      this.config.AccessToken = {
        value: accessToken
      };
    } catch (err) {
      console.log(`Error getting access token: ${err}`);
      throw new Error(`Failed to get access token: ${err}`);
    }
  }

  /**
   * Keep only requestedFields plus any schema-required keys.
   * @param {Array<Object>} items
   * @param {string} nodeName
   * @param {Array<string>} requestedFields
   * @returns {Array<Object>}
   */
  _filterBySchema(items, nodeName, requestedFields = []) {
    const schema = this.fieldsSchema[nodeName];
    const requiredFields = new Set(schema.uniqueKeys || []);
    const keepFields = new Set([ ...requiredFields, ...requestedFields ]);

    return items.map(item => {
      const result = {};
      for (const key of Object.keys(item)) {
        if (keepFields.has(key)) {
          result[key] = item[key];
        }
      }
      return result;
    });
  }

  /**
   * Parse API response and add date field
   * @param {Object} apiResponse - API response
   * @param {Date} date - Date to add to each row
   * @returns {Array<Object>} - Parsed and enriched data
   */
  parseApiResponse(apiResponse, date) {
    if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
      return [];
    }

    const formattedDate = EnvironmentAdapter.formatDate(date, "UTC", "yyyy-MM-dd");
    const processedData = apiResponse.data.map(rowData => ({
      ...rowData,
      Day: formattedDate
    }));

    return this._filterBySchema(processedData, 'statistics', Object.keys(processedData[0] || {}));
  }
}
