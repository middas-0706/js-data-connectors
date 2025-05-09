/**
 * X Ads Connector implementation
 */

class XAdsConnector extends AbstractConnector {
  constructor(config) {
    super(config.mergeParameters({
      ApiKey: {
        isRequired: true,
        requiredType: "string"
      },
      ApiSecret: {
        isRequired: true,
        requiredType: "string"
      },
      AccessToken: {
        isRequired: true,
        requiredType: "string"
      },
      AccessTokenSecret: {
        isRequired: true,
        requiredType: "string"
      },
      AccountId: {
        isRequired: true,
        requiredType: "string"
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
        default: "https://ads-api.twitter.com/"
      },
      Version: {
        requiredType: "string",
        default: "11"
      }
    }));

    this.fieldsSchema = XAdsFieldsSchema;
    this.initialized = false;

    // Constants from analytics-master
    this.DATA_MAX_COUNT = 1000;
    this.CARDS_MAX_COUNT_PER_REQUEST = 200;
    this.ADS_API_DELAY = 3.65; // seconds

    // Endpoints mapping
    this.ENDPOINTS = {
      accounts: 'accounts',
      campaigns: 'accounts/{accountId}/campaigns',
      line_items: 'accounts/{accountId}/line_items',
      promoted_tweets: 'accounts/{accountId}/promoted_tweets',
      stats: 'stats/accounts/{accountId}',
      tweets: 'accounts/{accountId}/tweets',
      cards: 'accounts/{accountId}/cards',
      cards_all: 'accounts/{accountId}/cards/all'
    };

    // Error codes from analytics-master
    this.ERROR_CODES = {
      INVALID_ACCOUNT_SERVICE_LEVEL: 'INVALID_ACCOUNT_SERVICE_LEVEL',
      INSUFFICIENT_USER_AUTHORIZED_PERMISSION: 'INSUFFICIENT_USER_AUTHORIZED_PERMISSION',
      ACTION_NOT_ALLOWED: 'ACTION_NOT_ALLOWED'
    };
  }

  /**
   * Initialize the connector with required credentials
   * @returns {void}
   */
  initialize() {
    if (!this.config.ApiKey.value) {
      throw new ConfigurationError('Missing required X Ads API Key');
    }
    if (!this.config.ApiSecret.value) {
      throw new ConfigurationError('Missing required X Ads API Secret');
    }
    if (!this.config.AccessToken.value) {
      throw new ConfigurationError('Missing required X Ads Access Token');
    }
    if (!this.config.AccessTokenSecret.value) {
      throw new ConfigurationError('Missing required X Ads Access Token Secret');
    }
    if (!this.config.AccountId.value) {
      throw new ConfigurationError('Missing required X Ads Account ID');
    }

    this.credentials = {
      apiKey: this.config.ApiKey.value,
      apiSecret: this.config.ApiSecret.value,
      accessToken: this.config.AccessToken.value,
      accessTokenSecret: this.config.AccessTokenSecret.value
    };
    
    this.accountId = this.config.AccountId.value;
    this.initialized = true;
  }

  /**
   * Get data from X Ads API based on the specified data source
   * @param {string} nodeName - The node to fetch (e.g., accounts, campaigns)
   * @param {string} accountId - Account ID
   * @param {Object} params - Additional parameters for the request
   * @returns {Array} API response
   */
  async fetchData(nodeName, accountId, params = {}) {
    if (!this.initialized) {
      this.initialize();
    }

    // Use provided accountId or fallback to the one from config
    accountId = accountId || this.accountId;

    // Add rate limiting delay
    Utilities.sleep(this.ADS_API_DELAY * 1000);

    switch (nodeName) {
      case 'accounts':
        return await this.fetchAccounts();
      case 'campaigns':
        return await this.fetchCampaigns(accountId, params);
      case 'line_items':
        return await this.fetchLineItems(accountId, params);
      case 'promoted_tweets':
        const lineItemIds = params.line_item_ids || null;
        return await this.fetchPromotedTweets(accountId, lineItemIds);
      case 'analytics':
        return await this.fetchAnalytics(accountId, params);
      case 'tweets':
        return await this.fetchTweets(accountId);
      case 'cards':
        const cardUris = params.card_uris || null;
        return await this.fetchCards(accountId, cardUris);
      case 'cards_all':
        const allCardUris = params.card_uris || null;
        return await this.fetchAllCards(accountId, allCardUris);
      default:
        throw new ConfigurationError(`Unknown node: ${nodeName}`);
    }
  }

  /**
   * Fetch accounts data
   * @returns {Array} Array of account objects
   */
  async fetchAccounts() {
    const endpoint = this.ENDPOINTS.accounts;
    return await this.makeRequest(endpoint);
  }

  /**
   * Fetch campaigns data
   * @param {string} accountId - Account ID
   * @param {Object} params - Request parameters
   * @returns {Array} Array of campaign objects
   */
  async fetchCampaigns(accountId, params = {}) {
    const endpoint = this.ENDPOINTS.campaigns.replace('{accountId}', accountId);
    return await this.makeRequest(endpoint, { 
      params: { ...params, count: this.DATA_MAX_COUNT }
    });
  }

  /**
   * Fetch line items data
   * @param {string} accountId - Account ID
   * @param {Object} params - Request parameters
   * @returns {Array} Array of line item objects
   */
  async fetchLineItems(accountId, params = {}) {
    const endpoint = this.ENDPOINTS.line_items.replace('{accountId}', accountId);
    return await this.makeRequest(endpoint, { 
      params: { ...params, count: this.DATA_MAX_COUNT }
    });
  }

  /**
   * Fetch promoted tweets data
   * @param {string} accountId - Account ID
   * @param {Object} params - Request parameters
   * @returns {Array} Array of promoted tweet objects
   */
  async fetchPromotedTweets(accountId, lineItemIds = null) {
    const endpoint = this.ENDPOINTS.promoted_tweets.replace('{accountId}', accountId);
    const params = {};
    
    if (lineItemIds) {
      params.line_item_ids = Array.isArray(lineItemIds) 
        ? lineItemIds.join(',') 
        : lineItemIds;
    }
    
    const response = await this.makeRequest(endpoint, { 
      params: { ...params, count: this.DATA_MAX_COUNT }
    });
    
    return response.map(item => ({
      id: item.id,
      tweet_id: item.tweet_id,
      line_item_id: item.line_item_id
    }));
  }

  /**
   * Fetch tweets data
   * @param {string} accountId - Account ID
   * @returns {Array} Array of tweet objects
   */
  async fetchTweets(accountId) {
    const tweetParams = {
      tweet_type: 'PUBLISHED',
      timeline_type: 'NULLCAST',
      trim_user: true
    };

    const endpoint = this.ENDPOINTS.tweets.replace('{accountId}', accountId);
    const tweets = await this.makeRequest(endpoint, { 
      params: tweetParams
    });

    // Transform tweets to match PHP logic
    const transformedTweets = {};
    for (const tweet of tweets) {
      transformedTweets[tweet.id_str] = {
        full_text: tweet.full_text || tweet.text,
        card_uri: tweet.card_uri || null,
        url: tweet.entities?.urls?.[0]?.url || null
      };
      
      // Remove empty values
      Object.keys(transformedTweets[tweet.id_str]).forEach(key => {
        if (!transformedTweets[tweet.id_str][key]) {
          delete transformedTweets[tweet.id_str][key];
        }
      });
    }
    
    return transformedTweets;
  }

  /**
   * Fetch cards data
   * @param {string} accountId - Account ID
   * @param {Array} [cardUris] - Optional array of card URIs to fetch
   * @returns {Object} Object of card URI to card details
   */
  async fetchCards(accountId, cardUris) {
    // If cardUris not provided, get them from tweets
    if (!cardUris || !cardUris.length) {
      // Get tweets first
      const tweetsInfo = await this.fetchTweets(accountId);
      
      // Extract card_uris from tweets
      cardUris = Object.values(tweetsInfo)
        .map(tweet => tweet.card_uri)
        .filter(uri => uri != null);
        
      if (!cardUris.length) {
        return {};
      }
    }

    const cardUrisArray = Array.isArray(cardUris) ? cardUris : [cardUris];
    const cardsInfo = {};

    // Split card URIs into chunks of CARDS_MAX_COUNT_PER_REQUEST
    for (let i = 0; i < cardUrisArray.length; i += this.CARDS_MAX_COUNT_PER_REQUEST) {
      const chunk = cardUrisArray.slice(i, i + this.CARDS_MAX_COUNT_PER_REQUEST);
      
      // Skip empty chunks
      if (!chunk.length) continue;
      
      const endpoint = this.ENDPOINTS.cards.replace('{accountId}', accountId);
      const response = await this.makeRequest(endpoint, {
        params: {
          card_uris: chunk.join(','),
          count: this.CARDS_MAX_COUNT_PER_REQUEST
        }
      });

      // Process card data
      for (const cardInfo of response) {
        if (!cardsInfo[cardInfo.card_uri]) {
          cardsInfo[cardInfo.card_uri] = [];
        }

        // Extract URLs from different card types
        if (cardInfo.website_dest_url) {
          cardsInfo[cardInfo.card_uri].push(cardInfo.website_dest_url);
        }
        
        if (cardInfo.website_url) {
          cardsInfo[cardInfo.card_uri].push(cardInfo.website_url);
        }

        // Handle components (like details components)
        if (cardInfo.components) {
          const detailsComponents = cardInfo.components.filter(
            component => component.type === 'DETAILS'
          );

          for (const detail of detailsComponents) {
            if (detail.destination && detail.destination.url) {
              cardsInfo[cardInfo.card_uri].push(detail.destination.url);
            }
          }
        }
      }
    }

    return cardsInfo;
  }

  /**
   * Fetch all cards data
   * @param {string} accountId - Account ID
   * @param {Array} [cardUris] - Optional array of card URIs to fetch
   * @returns {Object} Object of card URI to card details
   */
  async fetchAllCards(accountId, cardUris) {
    // If cardUris not provided, get them from tweets
    if (!cardUris || !cardUris.length) {
      // Get tweets first
      const tweetsInfo = await this.fetchTweets(accountId);
      
      // Extract card_uris from tweets
      cardUris = Object.values(tweetsInfo)
        .map(tweet => tweet.card_uri)
        .filter(uri => uri != null);
        
      if (!cardUris.length) {
        return {};
      }
    }

    const cardUrisArray = Array.isArray(cardUris) ? cardUris : [cardUris];
    const cardsInfo = {};

    // Split card URIs into chunks of CARDS_MAX_COUNT_PER_REQUEST
    for (let i = 0; i < cardUrisArray.length; i += this.CARDS_MAX_COUNT_PER_REQUEST) {
      const chunk = cardUrisArray.slice(i, i + this.CARDS_MAX_COUNT_PER_REQUEST);
      
      // Skip empty chunks
      if (!chunk.length) continue;
      
      const endpoint = this.ENDPOINTS.cards_all.replace('{accountId}', accountId);
      const response = await this.makeRequest(endpoint, {
        params: {
          card_uris: chunk.join(','),
          with_deleted: true
        }
      });

      // Process card data
      for (const cardInfo of response) {
        if (!cardsInfo[cardInfo.card_uri]) {
          cardsInfo[cardInfo.card_uri] = [];
        }

        // Extract URLs from different card types
        if (cardInfo.website_dest_url) {
          cardsInfo[cardInfo.card_uri].push(cardInfo.website_dest_url);
        }
        
        if (cardInfo.website_url) {
          cardsInfo[cardInfo.card_uri].push(cardInfo.website_url);
        }

        // Handle components (like details components)
        if (cardInfo.components) {
          const detailsComponents = cardInfo.components.filter(
            component => component.type === 'DETAILS'
          );

          for (const detail of detailsComponents) {
            if (detail.destination && detail.destination.url) {
              cardsInfo[cardInfo.card_uri].push(detail.destination.url);
            }
          }
        }
      }
    }

    return cardsInfo;
  }

  /**
   * Fetch analytics data combining stats from different placements
   * @param {string} accountId - Account ID
   * @param {Object} params - Request parameters including start_time, end_time, fields
   * @returns {Array} Combined analytics data
   */
  async fetchAnalytics(accountId, params = {}) {
    // Validate required parameters
    if (!params.start_time || !params.end_time) {
      throw new ConfigurationError('Missing required parameters: start_time and end_time for analytics');
    }

    // Get all line items to have their currency
    const lineItems = await this.fetchLineItems(accountId);
    const lineItemsMap = {};
    lineItems.forEach(item => {
      lineItemsMap[item.id] = { currency: item.currency };
    });

    // Get all promoted tweets with line item IDs
    const promotedTweets = await this.fetchPromotedTweets(accountId);
    const promotedTweetsMap = {};
    promotedTweets.forEach(item => {
      promotedTweetsMap[item.id] = {
        tweet_id: item.tweet_id,
        line_item_id: item.line_item_id
      };
    });

    // Get tweet information to extract UTM parameters
    const tweets = await this.fetchTweets(accountId);
    
    // Get card URIs from tweets
    const cardUris = Object.values(tweets)
      .filter(tweet => tweet.card_uri)
      .map(tweet => tweet.card_uri);
    
    // Get cards information to extract destination URLs
    const cards = await this.fetchCards(accountId, cardUris);
    const cardsMap = {};
    cards.forEach(card => {
      if (!cardsMap[card.card_uri]) {
        cardsMap[card.card_uri] = [];
      }
      
      // Extract URLs from various card types
      if (card.website_dest_url) {
        cardsMap[card.card_uri].push(card.website_dest_url);
      }
      if (card.website_url) {
        cardsMap[card.card_uri].push(card.website_url);
      }
      if (card.components) {
        const detailsComponents = card.components.filter(comp => comp.type === 'DETAILS');
        detailsComponents.forEach(detail => {
          if (detail.destination && detail.destination.url) {
            cardsMap[card.card_uri].push(detail.destination.url);
          }
        });
      }
    });

    // Get stats from two placements and combine them
    const promotedTweetIds = Object.keys(promotedTweetsMap);
    
    // Process stats in batches
    const results = [];
    const BATCH_SIZE = this.MAX_ENTITIES_COUNT_FOR_STATS || 20;
    
    for (let i = 0; i < promotedTweetIds.length; i += BATCH_SIZE) {
      const batch = promotedTweetIds.slice(i, i + BATCH_SIZE);
      
      // Fetch stats for ALL_ON_TWITTER placement
      const twitterStats = await this.fetchStats(accountId, {
        entity: 'PROMOTED_TWEET',
        entity_ids: batch.join(','),
        granularity: 'DAY',
        metric_groups: 'ENGAGEMENT,BILLING',
        placement: 'ALL_ON_TWITTER',
        start_time: params.start_time,
        end_time: params.end_time
      });
      
      // Fetch stats for PUBLISHER_NETWORK placement
      const publisherStats = await this.fetchStats(accountId, {
        entity: 'PROMOTED_TWEET',
        entity_ids: batch.join(','),
        granularity: 'DAY',
        metric_groups: 'ENGAGEMENT,BILLING',
        placement: 'PUBLISHER_NETWORK',
        start_time: params.start_time,
        end_time: params.end_time
      });
      
      // Combine stats from both placements
      if (twitterStats.length !== publisherStats.length) {
        console.warn('Stats from different placements have different lengths');
      }
      
      // Process and combine stats
      for (let j = 0; j < twitterStats.length; j++) {
        const twitterStat = twitterStats[j];
        const publisherStat = publisherStats.find(ps => ps.id === twitterStat.id) || 
          { id_data: [{ metrics: { impressions: [0], billed_charge_local_micro: [0], url_clicks: [0] } }] };
        
        const promotedTweetId = twitterStat.id;
        const tweetId = promotedTweetsMap[promotedTweetId]?.tweet_id;
        const lineItemId = promotedTweetsMap[promotedTweetId]?.line_item_id;
        
        if (!lineItemId) {
          console.warn(`Line item ID not found for promoted tweet ${promotedTweetId}`);
          continue;
        }
        
        // Combine metrics
        const twitterMetrics = twitterStat.id_data[0]?.metrics || {};
        const publisherMetrics = publisherStat.id_data[0]?.metrics || {};
        
        const impressions = (twitterMetrics.impressions?.[0] || 0) + (publisherMetrics.impressions?.[0] || 0);
        const clicks = (twitterMetrics.url_clicks?.[0] || 0) + (publisherMetrics.url_clicks?.[0] || 0);
        const spend = (twitterMetrics.billed_charge_local_micro?.[0] || 0) + 
                      (publisherMetrics.billed_charge_local_micro?.[0] || 0);
        
        // Convert micro amounts (millionths) to actual currency
        const spendValue = spend / 1000000;
        
        // Build result object
        const result = {
          tweet_id: tweetId,
          line_item_id: lineItemId,
          impressions: impressions,
          clicks: clicks,
          spend: spendValue,
          currency: lineItemsMap[lineItemId]?.currency || 'USD',
          date: params.start_time,
          utm: {}
        };
        
        // Extract UTM parameters from tweet and card info
        if (tweetId && tweets[tweetId]) {
          const tweetInfo = tweets[tweetId];
          const cardUri = tweetInfo.card_uri;
          const cardUrls = cardUri ? (cardsMap[cardUri] || []) : [];
          
          // Extract UTM parameters from URLs
          result.utm = this.extractUtmFromUrls([tweetInfo.url, ...cardUrls].filter(Boolean));
        }
        
        results.push(result);
      }
    }
    
    return results;
  }
  
  /**
   * Fetch stats from Twitter/X Ads API
   * @param {string} accountId - Account ID
   * @param {Object} params - Stats request parameters
   * @returns {Array} Stats data
   */
  async fetchStats(accountId, params = {}) {
    const endpoint = this.ENDPOINTS.stats.replace('{accountId}', accountId);
    return await this.makeRequest(endpoint, { params });
  }
  
  /**
   * Extract UTM parameters from URLs
   * @param {Array<string>} urls - Array of URLs to extract UTM parameters from
   * @returns {Object} UTM parameters
   */
  extractUtmFromUrls(urls) {
    const utmParams = {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null
    };
    
    for (const url of urls) {
      try {
        if (!url) continue;
        
        const parsedUrl = new URL(url);
        const searchParams = parsedUrl.searchParams;
        
        // Check each UTM parameter
        for (const param in utmParams) {
          if (searchParams.has(param) && !utmParams[param]) {
            utmParams[param] = searchParams.get(param);
          }
        }
        
        // If we found all UTM params, break
        if (Object.values(utmParams).every(value => value !== null)) {
          break;
        }
      } catch (error) {
        console.warn(`Error parsing URL: ${url}`);
      }
    }
    
    // Remove null values
    for (const key in utmParams) {
      if (utmParams[key] === null) {
        delete utmParams[key];
      }
    }
    
    return utmParams;
  }

  /**
   * Make an authenticated request to X Ads API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Array} API response
   */
  async makeRequest(endpoint, options = {}) {
    if (!this.initialized) {
      this.initialize();
    }
    
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
    
    // Generate OAuth 1.0a signature
    const oauthHeader = this._generateOAuthHeader(method, url, params);
    
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
        return Array.isArray(result) ? result : [result];
      } else {
        const error = JSON.parse(responseBody);
        if (this.isInvalidAccountServiceLevel(error, responseCode)) {
          throw new ConfigurationError('Invalid account service level');
        }
        if (this.isInsufficientUserAuthorized(error, responseCode)) {
          throw new ConfigurationError('Insufficient user authorization');
        }
        throw new APIError(`X Ads API request failed with status ${responseCode}: ${responseBody}`);
      }
    } catch (error) {
      if (error instanceof APIError || error instanceof ConfigurationError) {
        throw error;
      }
      throw new APIError(`X Ads API request failed: ${error.message}`);
    }
  }

  /**
   * Check if error is due to invalid account service level
   * @private
   * @param {Object} content - Error response content
   * @param {number} statusCode - HTTP status code
   * @returns {boolean} True if error is due to invalid account service level
   */
  isInvalidAccountServiceLevel(content, statusCode) {
    if (statusCode === 400 && content.errors) {
      return content.errors.some(error => 
        error.code === this.ERROR_CODES.INVALID_ACCOUNT_SERVICE_LEVEL
      );
    }
    return false;
  }

  /**
   * Check if error is due to insufficient user authorization
   * @private
   * @param {Object} content - Error response content
   * @param {number} statusCode - HTTP status code
   * @returns {boolean} True if error is due to insufficient authorization
   */
  isInsufficientUserAuthorized(content, statusCode) {
    if (statusCode === 403 && content.errors) {
      return content.errors.some(error => 
        error.code === this.ERROR_CODES.INSUFFICIENT_USER_AUTHORIZED_PERMISSION ||
        error.code === this.ERROR_CODES.ACTION_NOT_ALLOWED
      );
    }
    return false;
  }

  /**
   * Generate OAuth 1.0a authorization header
   * @private
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Object} params - Request parameters
   * @returns {string} Authorization header
   */
  _generateOAuthHeader(method, url, params = {}) {
    const oauthParams = {
      oauth_consumer_key: this.credentials.apiKey,
      oauth_nonce: this._generateNonce(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_token: this.credentials.accessToken,
      oauth_version: '1.0'
    };
    
    // Combine all parameters for signature
    const signatureParams = { ...params, ...oauthParams };
    
    // Generate signature base string
    const paramString = Object.keys(signatureParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(signatureParams[key])}`)
      .join('&');
    
    const signatureBaseString = [
      method.toUpperCase(),
      encodeURIComponent(url),
      encodeURIComponent(paramString)
    ].join('&');
    
    // Generate signing key
    const signingKey = `${encodeURIComponent(this.credentials.apiSecret)}&${encodeURIComponent(this.credentials.accessTokenSecret)}`;
    
    // Generate signature
    const signature = Utilities.base64Encode(
      Utilities.computeHmacSha1Signature(
        signatureBaseString,
        signingKey,
        Utilities.Charset.UTF_8
      )
    );
    
    // Add signature to OAuth parameters
    oauthParams.oauth_signature = signature;
    
    // Generate authorization header string
    return 'OAuth ' + Object.keys(oauthParams)
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');
  }

  /**
   * Generate a random nonce for OAuth
   * @private
   * @returns {string} Random nonce
   */
  _generateNonce() {
    return Utilities.getUuid().replace(/-/g, '');
  }
} 