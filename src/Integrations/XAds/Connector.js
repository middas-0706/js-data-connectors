/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var XAdsConnector = class XAdsConnector extends AbstractConnector {
  constructor(config) {
    super(config.mergeParameters({
      ConsumerKey: {
        isRequired: true,
        requiredType: "string",
        displayName: "Consumer Key (API Key)",
        description: "Your X Ads API Consumer Key"
      },
      ConsumerSecret: {
        isRequired: true,
        requiredType: "string",
        displayName: "Consumer Secret (API Secret)",
        description: "Your X Ads API Consumer Secret"
      },
      AccessToken: {
        isRequired: true,
        requiredType: "string",
        displayName: "Access Token",
        description: "Your X Ads API Access Token"
      },
      AccessTokenSecret: {
        isRequired: true,
        requiredType: "string",
        displayName: "Access Token Secret",
        description: "Your X Ads API Access Token Secret"
      },
      AccountIDs: {
        isRequired: true,
        requiredType: "string",
        displayName: "Account ID",
        description: "Your X Ads Account ID"
      },
      ReimportLookbackWindow: {
        requiredType: "number",
        isRequired: true,
        default: 2,
        displayName: "Reimport Lookback Window",
        description: "Number of days to look back when reimporting data"
      },
      CleanUpToKeepWindow: {
        requiredType: "number",
        displayName: "Clean Up To Keep Window",
        description: "Number of days to keep data before cleaning up"
      },
      MaxFetchingDays: {
        requiredType: "number",
        isRequired: true,
        default: 31,
        displayName: "Max Fetching Days",
        description: "Maximum number of days to fetch data for"
      },
      BaseUrl: {
        requiredType: "string",
        default: "https://ads-api.x.com/",
        displayName: "Base URL",
        description: "X Ads API base URL"
      },
      Version: {
        requiredType: "string",
        default: "12",
        displayName: "API Version",
        description: "X Ads API version"
      }
    }));

    this.fieldsSchema = XAdsFieldsSchema;

    this.DATA_MAX_COUNT = 1000;
    this.CARDS_MAX_COUNT_PER_REQUEST = 20;
    this.ADS_API_DELAY = 3.65; // seconds
    this.STATS_MAX_ENTITY_IDS = 20; // Maximum number of entity_ids allowed per request for stats endpoint

    this._tweetsCache = new Map(); // Cache for tweets data per account
    this._promotedTweetsCache = new Map(); // Cache for promoted tweets data per account
  }

  /**
   * Returns an object with credential fields used by this connector
   * @returns {Object} Object with credential field configurations
   */
  getCredentialFields() {
    return {
      ConsumerKey: this.config.ConsumerKey,
      ConsumerSecret: this.config.ConsumerSecret,
      AccessToken: this.config.AccessToken,
      AccessTokenSecret: this.config.AccessTokenSecret
    };
  }

  /**
   * Get data from X Ads API based on the specified data source
   * @param {string} nodeName - The node to fetch (e.g., accounts, campaigns)
   * @param {string} accountId - Account ID
   * @param {Object} params - Additional parameters for the request
   * @returns {Array} API response
   */
  fetchData(nodeName, accountId, params = {}) {
    // Add rate limiting delay
    Utilities.sleep(this.ADS_API_DELAY * 1000);

    switch (nodeName) {
      case 'accounts':
        return this.fetchAccount(accountId);
      case 'campaigns':
        return this.fetchAllPages({
          accountId,
          endpoint: 'campaigns',
          params: { ...params, count: this.DATA_MAX_COUNT }
        });
      case 'line_items':
        return this.fetchAllPages({
          accountId,
          endpoint: 'line_items',
          params: { ...params, count: this.DATA_MAX_COUNT }
        });
      case 'promoted_tweets':
        // If we have cached promoted tweets for this account, return them
        if (this._promotedTweetsCache.has(accountId)) {
          console.log('returning cached promoted tweets')
          return this._promotedTweetsCache.get(accountId);
        }
        // Otherwise fetch and cache them
        const promotedTweets = this.fetchAllPages({
          accountId,
          endpoint: 'promoted_tweets',
          params: { count: this.DATA_MAX_COUNT }
        });
        console.log('setting promoted tweets cache')
        this._promotedTweetsCache.set(accountId, promotedTweets);
        return promotedTweets;
      case 'stats':
        return this.fetchStats(accountId, params);
      case 'tweets':
        // If we have cached tweets for this account, return them
        if (this._tweetsCache.has(accountId)) {
          return this._tweetsCache.get(accountId);
        }
        // Otherwise fetch and cache them
        const tweets = this.fetchAllPages({
          accountId,
          endpoint: 'tweets',
          params: {
            tweet_type: 'PUBLISHED',
            timeline_type: 'NULLCAST',
            trim_user: true
          }
        });
        this._tweetsCache.set(accountId, tweets);
        return tweets;
      case 'cards':
        return this.fetchAllPages({
          accountId,
          endpoint: 'cards',
          params: { count: 200 }
        });
      case 'cards_all':
        return this.fetchAllCards(accountId);
      default:
        throw new ConfigurationError(`Unknown node: ${nodeName}`);
    }
  }

  /**
   * Fetch a specific account by ID
   * @param {string} accountId - Account ID to fetch
   * @returns {Array} Array containing the account object
   */
  fetchAccount(accountId) {
    const response = this.makeRequest(`accounts/${accountId}`);
    return [response.data];
  }

  /**
   * Fetch all cards data by first getting card URIs from tweets
   * @param {string} accountId - Account ID
   * @returns {Array} Array of raw card objects from the API
   */
  fetchAllCards(accountId) {
    try {
      // Get tweets data (fetchData handles caching)
      const tweetsInfo = this.fetchData('tweets', accountId);
      
      // Extract card_uris from tweets, filtering out empty ones
      const cardUris = tweetsInfo
        .filter(tweet => tweet.card_uri && tweet.card_uri !== '')
        .map(tweet => tweet.card_uri);
        
      if (!cardUris.length) {
        return [];
      }

      const allCards = [];

      // Split card URIs into chunks of CARDS_MAX_COUNT_PER_REQUEST (now 20)
      for (let i = 0; i < cardUris.length; i += this.CARDS_MAX_COUNT_PER_REQUEST) {
        const chunk = cardUris.slice(i, i + this.CARDS_MAX_COUNT_PER_REQUEST);
        
        // Skip empty chunks
        if (!chunk.length) continue;
        
        try {
          // Fetch from cards/all endpoint
          const responseAll = this.makeRequest(`accounts/${accountId}/cards/all`, {
            params: {
              card_uris: chunk.join(','),
              with_deleted: true
            }
          });
          
          // Add cards from cards/all endpoint
          if (responseAll && responseAll.data && Array.isArray(responseAll.data)) {
            allCards.push(...responseAll.data);
          }
        } catch (err) {
          console.error(`Error fetching cards/all for chunk: ${err.message}`);
        }
        
        // Add rate limiting delay between chunks
        Utilities.sleep(this.ADS_API_DELAY * 1000);
      }

      return allCards;
    } catch (error) {
      console.error(`Error fetching cards_all data for account ${accountId}: [${error}]`);
      return [];
    }
  }

  /**
   * Fetch stats from X Ads API for a specific date range
   * @param {string} accountId - Account ID
   * @param {Object} params - Request parameters including start_time and end_time
   * @returns {Array} Array of stats objects from the API
   */
  fetchStats(accountId, params = {}) {
    if (!params.start_time || !params.end_time) {
      throw new ConfigurationError('Missing required parameters: start_time and end_time for stats');
    }

    // Get promoted tweets (fetchData handles caching)
    const promotedTweets = this.fetchData('promoted_tweets', accountId);

    const entityIds = promotedTweets.map(tweet => tweet.id);
    
    if (entityIds.length === 0) {
      return [];
    }

    // Add one day to end_time to match PHP implementation
    const endDate = new Date(params.end_time);
    endDate.setDate(endDate.getDate() + 1);
    
    const allResults = [];
    
    // Process in batches of 20 (API limit)
    for (let i = 0; i < entityIds.length; i += this.STATS_MAX_ENTITY_IDS) {
      const batch = entityIds.slice(i, i + this.STATS_MAX_ENTITY_IDS);
      
      // Common params for both placements
      const commonParams = {
        entity: 'PROMOTED_TWEET',
        entity_ids: batch.join(','),
        granularity: 'DAY',
        metric_groups: ['ENGAGEMENT', 'BILLING'].join(','),
        start_time: params.start_time,
        end_time: Utilities.formatDate(endDate, "UTC", "yyyy-MM-dd")
      };
      
      // First, get stats for ALL_ON_TWITTER placement
      const twitterStats = this.makeRequest(`stats/accounts/${accountId}`, {
        params: {
          ...commonParams,
          placement: 'ALL_ON_TWITTER'
        }
      });
      
      // Then get stats for PUBLISHER_NETWORK placement
      const publisherStats = this.makeRequest(`stats/accounts/${accountId}`, {
        params: {
          ...commonParams,
          placement: 'PUBLISHER_NETWORK'
        }
      });
      
      // Add results from both placements
      if (twitterStats && twitterStats.data && Array.isArray(twitterStats.data)) {
        const enrichedTwitterStats = twitterStats.data.map(stat => ({
          ...stat,
          date: params.start_time,
          placement: 'ALL_ON_TWITTER'
        }));
        allResults.push(...enrichedTwitterStats);
      }
      
      if (publisherStats && publisherStats.data && Array.isArray(publisherStats.data)) {
        const enrichedPublisherStats = publisherStats.data.map(stat => ({
          ...stat,
          date: params.start_time,
          placement: 'PUBLISHER_NETWORK'
        }));
        allResults.push(...enrichedPublisherStats);
      }
      
      // Add rate limiting delay between batches
      Utilities.sleep(this.ADS_API_DELAY * 1000);
    }
    
    return allResults;
  }

  /**
   * Make an authenticated request to X Ads API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Object|Array} API response with pagination info when available
   */
  makeRequest(endpoint, options = {}) {
    const url = `${this.config.BaseUrl.value}${this.config.Version.value}/${endpoint}`;
    const method = options.method || 'GET';
    const params = options.params || {};
    
    // Prepare URL with query parameters for GET requests
    let finalUrl = url;
    if (method === 'GET' && Object.keys(params).length > 0) {
      const queryParams = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      finalUrl = `${url}?${queryParams}`;
    }
    
    // Generate OAuth 1.0a header
    const oauthHeader = this._generateOAuthHeader({
      method: method,
      url: url,
      params: params
    });
    
    const requestOptions = {
      method: method,
      headers: {
        'Authorization': oauthHeader,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && Object.keys(params).length > 0) {
      requestOptions.payload = JSON.stringify(params);
    }

    try {
      const response = UrlFetchApp.fetch(finalUrl, requestOptions);
      const responseCode = response.getResponseCode();
      const responseBody = response.getContentText();
      
      // Handle response based on status code
      if (responseCode >= 200 && responseCode < 300) {
        const result = JSON.parse(responseBody);        
        return result;
      } else {
        throw new Error(`X Ads API request failed with status ${responseCode}: ${responseBody}`);
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(`X Ads API request failed: ${error.message}`);
    }
  }

  /**
   * Generate OAuth 1.0a authorization header
   * @private
   * @param {Object} options - Options object
   * @param {string} options.method - HTTP method
   * @param {string} options.url - Request URL
   * @param {Object} options.params - Request parameters
   * @returns {string} Authorization header
   */
  _generateOAuthHeader({ method, url, params = {} }) {
    // Get credentials from config
    const consumerKey = this.config.ConsumerKey.value;
    const consumerSecret = this.config.ConsumerSecret.value;
    const accessToken = this.config.AccessToken.value;
    const accessTokenSecret = this.config.AccessTokenSecret.value;

    // Create OAuth parameters
    const oauthParams = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: Utilities.getUuid().replace(/-/g, ''),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_token: accessToken,
      oauth_version: '1.0'
    };
    
    // For GET requests, include query parameters in the signature
    const signatureParams = { ...oauthParams };
    
    // Add request params to signature parameters for GET requests
    if (method === 'GET') {
      Object.keys(params).forEach(key => {
        signatureParams[key] = params[key];
      });
    }
    
    // Create signature base string
    const baseStringParams = Object.keys(signatureParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(signatureParams[key])}`)
      .join('&');
    
    const signatureBaseString = [
      method.toUpperCase(),
      encodeURIComponent(url),
      encodeURIComponent(baseStringParams)
    ].join('&');
    
    // Create signing key
    const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(accessTokenSecret)}`;
    
    // Generate signature
    const signature = Utilities.base64Encode(
      Utilities.computeHmacSignature(
        Utilities.MacAlgorithm.HMAC_SHA_1,
        signatureBaseString,
        signingKey
      )
    );
    
    // Add signature to OAuth parameters
    oauthParams.oauth_signature = signature;
    
    // Build authorization header
    return 'OAuth ' + Object.keys(oauthParams)
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');
  }
  
  /**
   * Fetch data from an endpoint with pagination support
   * @param {Object} options - Options for fetching data
   * @param {string} options.accountId - Account ID
   * @param {string} options.endpoint - API endpoint (without account prefix)
   * @param {Object} options.params - Request parameters
   * @returns {Array} Combined results from all pages
   * @private
   */
  fetchAllPages({ accountId, endpoint, params = {} }) {
    const allResults = [];
    let cursor = null;
    let page = 1;
    const MAX_PAGES = 100; // Safety limit
    
    do {
      console.log(`Fetching page ${page} for endpoint ${endpoint}`);
      
      // Add cursor to params if we have one
      const pageParams = { ...params };
      if (cursor) {
        pageParams.cursor = cursor;
      }
      
      // Make the request
      const response = this.makeRequest(`accounts/${accountId}/${endpoint}`, { params: pageParams });
      
      // Add results to our collection
      if (Array.isArray(response)) {
        allResults.push(...response);
        break; // No pagination for array responses
      } else if (response.data) {
        // Handle object response with data field (standard pagination format)
        if (Array.isArray(response.data)) {
          allResults.push(...response.data);
        } else {
          // Single object in data field (like account endpoint)
          allResults.push(response.data);
          break; // Account endpoint doesn't have pagination
        }
        
        // Get next cursor if available
        cursor = response.next_cursor || null;
      } else {
        // Unexpected response format
        console.warn('Unexpected response format:', response);
        break;
      }
      
      page++;
      
      // Safety check to prevent infinite loops
      if (page > MAX_PAGES) {
        console.warn(`Reached maximum page limit (${MAX_PAGES}) for endpoint ${endpoint}`);
        break;
      }
    } while (cursor);
    
    return allResults;
  }

  /**
   * Clear tweets and promoted tweets cache for specific account
   * @param {string} accountId - Account ID
   */
  clearTweetsCache(accountId) {
    if (this._tweetsCache.has(accountId)) {
      this._tweetsCache.delete(accountId);
      console.log(`Cleared tweets cache for account ${accountId}`);
    }
    if (this._promotedTweetsCache.has(accountId)) {
      this._promotedTweetsCache.delete(accountId);
      console.log(`Cleared promoted tweets cache for account ${accountId}`);
    }
  }
}
