/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var LinkedInConnector = class LinkedInConnector extends AbstractConnector {
  constructor(config) {
    super(config.mergeParameters({
      AccessToken: {
        isRequired: true,
        requiredType: "string"
      },
      ApiType: {
        requiredType: "string",
        default: "Ads"
      },
      Version: {
        requiredType: "string",
        default: "202504"
      },
      ReimportLookbackWindow: {
        requiredType: "number",
        isRequired: true,
        default: 2
      },
      CleanUpToKeepWindow: {
        requiredType: "number"
      },
      MaxFetchingDays: {
        requiredType: "number",
        isRequired: true,
        default: 31
      },
      BaseUrl: {
        requiredType: "string",
        default: "https://api.linkedin.com/rest/"
      }
    }));
    
    // Determine which API type to use based on configuration
    if (this.config.ApiType && this.config.ApiType.value) {
      this.apiType = this.config.ApiType.value;
    } else if (this.config.AccountURNs && this.config.AccountURNs.value) {
      this.apiType = "Ads";
    } else {
      throw new Error("Configuration must include either ApiType, AccountURNs for LinkedIn Ads or organizationalEntity for LinkedIn Pages");
    }
    
    this._setupConnectorByApiType();
  }
  
  _setupConnectorByApiType() {
    if (this.apiType === "Ads") {
      this.fieldsSchema = LinkedInAdsFieldsSchema;
      
      // Add LinkedIn Ads specific parameters
      this.config = this.config.mergeParameters({
        AccountURNs: {
          isRequired: true
        },
        Fields: {
          isRequired: true
        }
      });
    } else if (this.apiType === "Pages") {
      throw new Error("LinkedIn Pages API is not implemented yet");
    } else {
      throw new Error(`Unknown API type: ${this.apiType}`);
    }
  }
  
  /**
   * Main entry point for fetching data from LinkedIn API
   */
  fetchData(nodeName, urn, params = {}) {
    switch (this.apiType) {
      case "Ads":
        return this.fetchAdsData(nodeName, urn, params);
      default:
        throw new Error(`API type ${this.apiType} is not supported`);
    }
  }
  
  /**
   * LinkedIn Ads API implementation of fetchData
   */
  fetchAdsData(nodeName, urn, params = {}) {
    switch (nodeName) {
      case "adAccounts":
        return this.fetchSingleResource(urn, 'adAccounts', params);
      case "adCampaignGroups":
        return this.fetchAdResource(urn, 'adCampaignGroups', params);
      case "adCampaigns":
        return this.fetchAdResource(urn, 'adCampaigns', params);
      case "creatives":
        return this.fetchAdResource(urn, 'creatives', params, 'criteria');
      case "adAnalytics":
        return this.fetchAdAnalytics(urn, params);
      default:
        throw new Error(`Unknown node: ${nodeName}`);
    }
  }

  /**
   * Make a request to LinkedIn API with proper headers and auth
   */
  makeRequest(url, headers = {}) {
    console.log(`LinkedIn ${this.apiType} API Request URL:`, url);
    
    const defaultHeaders = {
      "LinkedIn-Version": this.config.Version.value,
      "X-RestLi-Protocol-Version": "2.0.0",
    };
    
    const mergedHeaders = { ...defaultHeaders, ...headers };
    const authUrl = `${url}${url.includes('?') ? '&' : '?'}oauth2_access_token=${this.config.AccessToken.value}`;
    
    const response = UrlFetchApp.fetch(authUrl, { headers: mergedHeaders });
    const result = JSON.parse(response.getContentText());
    
    console.log(`LinkedIn ${this.apiType} API Response:`, JSON.stringify(result, null, 2));
    return result;
  }
  
  /**
   * Fetch resources with pagination support
   */
  fetchWithPagination(baseUrl, headers = {}) {
    let allResults = [];
    let pageToken = null;
    
    do {
      let pageUrl = baseUrl;
      if (pageToken) {
        pageUrl += `${pageUrl.includes('?') ? '&' : '?'}pageToken=${encodeURIComponent(pageToken)}`;
      }
      
      const res = this.makeRequest(pageUrl, headers);
      const elements = res.elements || [];
      allResults = allResults.concat(elements);
      
      const metadata = res.metadata || {};
      pageToken = metadata.nextPageToken || null;
    } while (pageToken !== null);
    
    return allResults;
  }
  
  /**
   * Fetch a single resource by ID
   */
  fetchSingleResource(urn, resourceType, params) {
    let url = `${this.config.BaseUrl.value}${resourceType}/${encodeURIComponent(urn)}`;
    url += `?fields=${LinkedInHelper.formatFields(params.fields)}`;
    
    const result = this.makeRequest(url);
    return [result]; // Return as array to match other endpoints
  }
  
  /**
   * Fetch a collection of resources for an account
   */
  fetchAdResource(urn, resourceType, params, queryType = 'search') {
    let url = `${this.config.BaseUrl.value}adAccounts/${encodeURIComponent(urn)}/${resourceType}?q=${queryType}&pageSize=100`;
    url += `&fields=${LinkedInHelper.formatFields(params.fields)}`;
    
    return this.fetchWithPagination(url);
  }
  
  /**
   * Fetch analytics data, handling field limits and data merging
   */
  fetchAdAnalytics(urn, params) {
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);
    const accountUrn = `urn:li:sponsoredAccount:${urn}`;
    const encodedUrn = encodeURIComponent(accountUrn);
    const allResults = [];
    
    // LinkedIn API has a limitation - it allows a maximum of 15 fields per request
    // To overcome this, we split fields into chunks and make multiple requests
    const fieldChunks = this.prepareAnalyticsFieldChunks(params.fields || []);
    
    // Process each chunk of fields in separate API requests
    for (const fieldChunk of fieldChunks) {
      const url = this.buildAdAnalyticsUrl(startDate, endDate, encodedUrn, fieldChunk);
      const res = this.makeRequest(url);
      const elements = res.elements || [];
      
      // Merge results from different chunks into a single dataset
      // Each chunk contains the same rows but different fields
      this.mergeAnalyticsResults(allResults, elements);
    }
    
    // Group and deduplicate the data by dateRange and pivotValues
    return this.groupAnalyticsData(allResults);
  }
  
  /**
   * Build URL for analytics API request
   */
  buildAdAnalyticsUrl(startDate, endDate, encodedUrn, fields) {
    // Construct the URL for the LinkedIn Analytics API
    return `${this.config.BaseUrl.value}adAnalytics?q=statistics` +
      `&dateRange=(start:${LinkedInHelper.formatDateForUrl(startDate)},` +
      `end:${LinkedInHelper.formatDateForUrl(endDate)})` +
      `&pivots=List(CREATIVE,CAMPAIGN)` +
      `&timeGranularity=DAILY` +
      `&accounts=List(${encodedUrn})` +
      `&fields=${LinkedInHelper.formatFields(fields)}`;
  }
  
  /**
   * Prepare field chunks for analytics API requests
   */
  prepareAnalyticsFieldChunks(fields) {
    // These fields are required in all requests for proper merging
    const requiredFields = ['dateRange', 'pivotValues'];
    
    // Combine user-specified fields with required fields, removing duplicates
    const allFields = [...new Set([...requiredFields, ...fields])];
    
    // LinkedIn API limitation: maximum 15 fields per request
    const MAX_FIELDS_PER_REQUEST = 15;
    const fieldChunks = [];
    
    // Split fields into chunks of maximum MAX_FIELDS_PER_REQUEST each
    for (let i = 0; i < allFields.length; i += MAX_FIELDS_PER_REQUEST) {
      const chunk = allFields.slice(i, i + MAX_FIELDS_PER_REQUEST);
      
      // Ensure each chunk has the required fields for data identification and merging
      // These are necessary to identify and match rows across different requests
      if (!chunk.includes('dateRange')) chunk.push('dateRange');
      if (!chunk.includes('pivotValues')) chunk.push('pivotValues');
      
      fieldChunks.push(chunk);
    }
    
    return fieldChunks;
  }
  
  /**
   * Merge results from multiple analytics API requests
   */
  mergeAnalyticsResults(allResults, newElements) {
    // If this is the first batch of results, simply add all elements
    if (allResults.length === 0) {
      allResults.push(...newElements);
      return;
    }
    
    // For each new element, check if it already exists in the results
    // The uniqueness of a row is determined by dateRange and pivotValues
    newElements.forEach(newElem => {
      // Find existing element with the same dateRange and pivotValues
      // These two fields uniquely identify each data point in the analytics data
      const existingIndex = allResults.findIndex(existing =>
        JSON.stringify(existing.dateRange) === JSON.stringify(newElem.dateRange) &&
        JSON.stringify(existing.pivotValues) === JSON.stringify(newElem.pivotValues)
      );
      
      if (existingIndex >= 0) {
        // If element with the same key exists, merge its fields with the new element's fields
        // This combines metrics from different requests into a single comprehensive record
        allResults[existingIndex] = { ...allResults[existingIndex], ...newElem };
      } else {
        // If no matching element exists, add the new element to the results
        allResults.push(newElem);
      }
    });
  }
  
  /**
   * Group and deduplicate analytics data
   */
  groupAnalyticsData(data) {
    // This method performs additional grouping and deduplication of data
    // It's necessary because sometimes LinkedIn API returns multiple records
    // for the same combination of date and campaign/creative
    
    // Group data by dateRange and pivotValues (creative and campaign)
    const groupedData = data.reduce((acc, item) => {
      // Extract creative and campaign IDs from pivotValues
      const creative = item.pivotValues.find(pv => pv.startsWith('urn:li:sponsoredCreative:'));
      const campaign = item.pivotValues.find(pv => pv.startsWith('urn:li:sponsoredCampaign:'));
      
      // Create a unique key from dateRange, creative, and campaign
      const key = `${JSON.stringify(item.dateRange)}|${creative}|${campaign}`;
      
      // If no record exists for this key, initialize a new one with identifier fields
      if (!acc[key]) {
        acc[key] = {
          dateRange: item.dateRange,
          pivotValues: item.pivotValues
        };
      }
      
      // Copy all metric fields (non-identifier fields) to the grouped record
      // This ensures we don't lose any metrics when combining records
      Object.entries(item).forEach(([field, value]) => {
        if (field !== 'dateRange' && field !== 'pivotValues') {
          acc[key][field] = value;
        }
      });
      
      return acc;
    }, {});
    
    // Convert the grouped data object back to an array for further processing
    return Object.values(groupedData);
  }
};
