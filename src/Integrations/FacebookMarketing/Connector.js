var FacebookMarketingConnector = class FacebookMarketingConnector extends AbstractConnector {

  constructor( configRange ) {
  
    super( configRange.mergeParameters({
      AccessToken:{
        isRequired: true,
        requiredType: "string",
      },
      StartDate: {
        isRequired: true,
        requiredType: "date",
        value: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      },
      EndDate: {
        isRequired: true,
        requiredType: "date",
        value: new Date()
      },
      ReimportLookbackWindow: {
        requiredType: "number",
        isRequired: true,
        value: 2
      },
      CleanUpToKeepWindow: {
        requiredType: "number"
      },
      DestinationSheetName: {
        isRequired: true,
        value: "Data"
      },
      MaxFetchingDays: {
        requiredType: "number",
        isRequired: true,
        value: 30
      }
    }));
  
    this.fieldsSchema = FacebookMarketingFieldsSchema;
  
  }
  
  /*
  @param startDate start date
  @param endDate end date
  
  @return data array
  
  */
  fetchData(startDate, endDate)  {
  
    var jsonURL = `https://graph.facebook.com/v19.0/act_550429885113645/insights?fields=date_stop,campaign_name,impressions,clicks,spend,frequency,action_values&period=day&date_preset=last_30d&time_increment=1&limit=500&level=campaign&access_token=${this.config.AccessToken.value}`;
  
    throw new Error(jsonURL);
    var allData = [];
    var nextPageURL = jsonURL;
  
    while (nextPageURL) {
      // Fetch data from the JSON URL
      var response = UrlFetchApp.fetch(nextPageURL);
      var jsonData = JSON.parse(response.getContentText());
      var data = jsonData.data;
      nextPageURL = jsonData.paging ? jsonData.paging.next : null;
  
      allData = allData.concat(data);
    }
    Logger.log(allData);
  
  
  // time_range
  //https://graph.facebook.com/v21.0/120215615997700036/insights?fields=account_id,ad_id,campaign_id,campaign_name,cost_per_action_type,video_p100_watched_actions,video_p25_watched_actions,impressions,clicks,spend&level=ad&date_preset=last_30d&access_token=EAAKNuiINZCvIBO0Le67cwetx0HXZBZBrFhHak61KSFtxeV6Smv3VssMs7hX9bZCLGnZC5anupDBXUCTouEQhOHu6hJxPkD1fhrAZC4n88mdPkrtrzXmueIV2ZAOHq4BcfWtO4Pf0PRYYqmWAtiRe3GRcxLcWjWktmTohQZARomCnJDZBdWG1WoINe6vIavN6vYf9uykmpjU8vOzXc4V6QoXuP9CxpKhrvIHjYgDGfTYkdgovjQQ7SAvNVnTZCvdhcw
  
    throw new Error('FetchData');
    var data = [];
    
    //console.log(data);
    return data;
  
  }

/*

returing two-levels object with schema details
first level with name and description properties for group name
the seconed one for the fields

@return object

*/
getFieldsSchema() {

  return this.getSigleLevelFieldsSchema(this.fieldsSchema);

}

/*

recursive function to create one-level object schema with fields details

@param object fieldsSchema
@param string parent node name

*/
getSigleLevelFieldsSchema(fieldsSchema, parentGroupName = null) {

  var schema = {};
  let parentGroupPrefix = (parentGroupName ? parentGroupName + "/" : "");

  for(var groupName in fieldsSchema) {

    if( fieldsSchema[ groupName ].fields ) {
      schema[ parentGroupPrefix + groupName ] = {
        "isSelected":    parentGroupPrefix +  groupName,
        "description":   fieldsSchema[ groupName ].description,
        "documentation": fieldsSchema[ groupName ].documentation,
        "fields":        fieldsSchema[ groupName ].fields,
        //"fields":        Object.keys(fieldsSchema[ groupName ].fields).slice(0,5)
      }
    }

    // there are some edges at this node, we need to add them to schema as well
    if( fieldsSchema[ groupName ].edges ) {
        schema = {
          ...schema, 
          ...this.getSigleLevelFieldsSchema( fieldsSchema[ groupName ].edges, parentGroupPrefix + groupName)
        } 
    }

  }

  return schema;

}

}