/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var LinkedAdsConnector = class LinkedAdsConnector extends AbstractConnector {
  constructor(config) {
    super(config.mergeParameters({
      AccessToken:   { isRequired: true, requiredType: "string" },
      AccountURNs:   { isRequired: true },
      Fields:        { isRequired: true },
      Pivot:         { default: "CAMPAIGN" },
      Granularity:   { default: "DAILY" },
      Version:       { default: "202501" }
    }));
    this.fieldsSchema = LinkedInMarketingFieldsSchema;
  }

  fetchData(nodeName, urn, params = {}) {
    const base = "https://api.linkedin.com/rest/";
    let url, all = [], nextPageToken;

    switch(nodeName) {
      case "adAccounts":
        url = `${base}adAccounts/${encodeURIComponent(urn)}`;
        if (params.fields && params.fields.length) {
          url += `?fields=${params.fields.map(field => encodeURIComponent(field)).join(",")}`;
        }
        console.log('LinkedIn API Request URL:', url);
        break;
      case "adCampaignGroups":
        url = `${base}adAccounts/${encodeURIComponent(urn)}/adCampaignGroups?q=search&pageSize=100`;
        if (params.fields && params.fields.length) {
          url += `&fields=${params.fields.map(field => encodeURIComponent(field)).join(",")}`;
        }
        console.log('LinkedIn API Request URL:', url);
        break;
      case "adCampaigns":
        url = `${base}adAccounts/${encodeURIComponent(urn)}/adCampaigns?q=search&pageSize=100`;
        if (params.fields && params.fields.length) {
          url += `&fields=${params.fields.map(field => encodeURIComponent(field)).join(",")}`;
        }
        console.log('LinkedIn API Request URL:', url);
        break;
      case "creatives":
        url = `${base}adAccounts/${encodeURIComponent(urn)}/creatives?q=criteria&pageSize=100`;
        if (params.fields && params.fields.length) {
          url += `&fields=${params.fields.map(field => encodeURIComponent(field)).join(",")}`;
        }
        console.log('LinkedIn API Request URL:', url);
        break;
      case "adAnalytics":
        // Special handling for adAnalytics with field chunking
        const startDate = new Date(params.startDate);
        const endDate = new Date(params.endDate);
        
        // Format account ID as URN
        const accountUrn = `urn:li:sponsoredAccount:${urn}`;
        const encodedUrn = encodeURIComponent(accountUrn);
        
        // Ensure required fields are included
        const requiredFields = ['dateRange', 'pivotValues'];
        const fields = params.fields || [];
        const allFields = [...new Set([...requiredFields, ...fields])];
        
        // Split fields into chunks of 15 (LinkedIn API limit)
        const MAX_FIELDS_PER_REQUEST = 15;
        const fieldChunks = [];
        
        // Split fields into chunks, keeping required fields in each chunk
        for (let i = 0; i < allFields.length; i += MAX_FIELDS_PER_REQUEST) {
          const chunk = allFields.slice(i, i + MAX_FIELDS_PER_REQUEST);
          // Ensure required fields are in each chunk
          if (!chunk.includes('dateRange')) chunk.push('dateRange');
          if (!chunk.includes('pivotValues')) chunk.push('pivotValues');
          fieldChunks.push(chunk);
        }
        
        // If no fields specified, use required fields
        if (fieldChunks.length === 0) {
          fieldChunks.push(requiredFields);
        }
        
        // Process each chunk of fields
        for (const fieldChunk of fieldChunks) {
          url = `${base}adAnalytics?q=statistics` +
                `&dateRange=(start:(year:${startDate.getFullYear()},month:${startDate.getMonth() + 1},day:${startDate.getDate()}),end:(year:${endDate.getFullYear()},month:${endDate.getMonth() + 1},day:${endDate.getDate()}))` +
                `&pivots=List(CREATIVE,CAMPAIGN)` +
                `&timeGranularity=DAILY` +
                `&accounts=List(${encodedUrn})` +
                `&fields=${fieldChunk.map(field => encodeURIComponent(field)).join(",")}`;
          
          console.log('LinkedIn API Request URL:', url);
          
          const headers = {
            "LinkedIn-Version": this.config.Version.value,
            "X-RestLi-Protocol-Version": "2.0.0",
          };
          
          const res = JSON.parse(UrlFetchApp.fetch(url + `&oauth2_access_token=${this.config.AccessToken.value}`, { headers }).getContentText());
          console.log('LinkedIn API Response:', JSON.stringify(res, null, 2));
          const elems = res.elements || [];
          
          // Merge results with existing data
          if (all.length === 0) {
            all = elems;
          } else {
            // If we have key fields, merge based on them
            if (fieldChunk.includes('dateRange') && fieldChunk.includes('pivotValues')) {
              elems.forEach(newElem => {
                const existingIndex = all.findIndex(existing => 
                  JSON.stringify(existing.dateRange) === JSON.stringify(newElem.dateRange) && 
                  JSON.stringify(existing.pivotValues) === JSON.stringify(newElem.pivotValues)
                );
                
                if (existingIndex >= 0) {
                  all[existingIndex] = { ...all[existingIndex], ...newElem };
                } else {
                  all.push(newElem);
                }
              });
            } else {
              // If we don't have key fields, just append new elements
              all = all.concat(elems);
            }
          }
          
          // Check if we've hit the 15,000 elements limit
          if (all.length >= 15000) {
            console.warn('Reached LinkedIn API limit of 15,000 elements for adAnalytics');
            break;
          }
        }
        
        // Group data by dateRange and pivotValues
        const groupedData = all.reduce((acc, item) => {
          // Extract creative and campaign from pivotValues
          const creative = item.pivotValues.find(pv => pv.startsWith('urn:li:sponsoredCreative:'));
          const campaign = item.pivotValues.find(pv => pv.startsWith('urn:li:sponsoredCampaign:'));
          
          const key = `${JSON.stringify(item.dateRange)}|${creative}|${campaign}`;
          
          if (!acc[key]) {
            acc[key] = {
              dateRange: item.dateRange,
              creativeUrn: creative,
              campaignUrn: campaign
            };
          }
          
          // Merge all fields directly into the object
          Object.entries(item).forEach(([field, value]) => {
            if (field !== 'dateRange' && field !== 'pivotValues') {
              acc[key][field] = value;
            }
          });
          return acc;
        }, {});
        
        // Convert grouped data back to array
        return Object.values(groupedData);
        
      default:
        throw new Error(`Unknown node: ${nodeName}`);
    }

    // Handle response for non-adAnalytics endpoints
    const headers = {
      "LinkedIn-Version": this.config.Version.value,
      "X-RestLi-Protocol-Version": "2.0.0",
    };

    // Special handling for adAccounts
    if (nodeName === 'adAccounts') {
      const res = JSON.parse(UrlFetchApp.fetch(url + `&oauth2_access_token=${this.config.AccessToken.value}`, { headers }).getContentText());
      console.log('LinkedIn API Response:', JSON.stringify(res, null, 2));
      return [res];
    }

    // Pagination logic for other endpoints
    let pageToken = null;
    do {
      let pageUrl = url;
      if (pageToken) {
        pageUrl += `&pageToken=${encodeURIComponent(pageToken)}`;
      }
      pageUrl += `&oauth2_access_token=${this.config.AccessToken.value}`;

      console.log('LinkedIn API Request URL (with pagination):', pageUrl);

      const res = JSON.parse(UrlFetchApp.fetch(pageUrl, { headers }).getContentText());
      console.log('LinkedIn API Response:', JSON.stringify(res, null, 2));
      const elems = res.elements || [];
      all = all.concat(elems);

      const metadata = res.metadata || {};
      pageToken = metadata.nextPageToken || null;
    } while (pageToken !== null);

    return all;
  }
};

