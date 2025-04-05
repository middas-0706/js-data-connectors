/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Runs the import process based on the configuration in the Google Sheet.
 */
function startImportProcess() {
  try {
    console.log("Starting TikTok Ads import process...");

    // Get the active spreadsheet and the 'Config' sheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var configSheet = spreadsheet.getSheetByName('Config');
    
    if (!configSheet) {
      throw new Error("Config sheet not found in the active spreadsheet");
    }
    
    // Get the config range (assuming parameters are in columns A and B)
    var configRange = configSheet.getRange("A:B");

    var config = new GoogleSheetsConfig(configRange);
    var connector = new TikTokAdsConnector(config);
    
    // Ensure app_id and app_secret are explicitly initialized
    connector.appId = config.AppId && config.AppId.value ? config.AppId.value : null;
    connector.appSecret = config.AppSecret && config.AppSecret.value ? config.AppSecret.value : null;
    
    var pipeline = new TikTokAdsPipeline(config, connector);

    config.logMessage("🔄 Import process started...");
    pipeline.startImportProcess();
    config.logMessage("✅ Import process finished successfully");
  } catch (error) {
    console.error(`Error during import process: ${error}`);
    console.error(error.stack);
    if (config) {
      config.logMessage(`❌ Error: ${error.message}`);
    }
  }
}

/**
 * Creates a time-based trigger to run the import process daily.
 */
function createDailyTrigger() {
  try {
    // Delete any existing triggers with the same function name
    deleteTriggers();
    
    // Create a new trigger to run daily
    ScriptApp.newTrigger('startImportProcess')
      .timeBased()
      .everyDays(1)
      .atHour(5) // 5 AM in the script's timezone
      .create();
    
    // Get the active spreadsheet and the 'Config' sheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var configSheet = spreadsheet.getSheetByName('Config');
    
    if (!configSheet) {
      throw new Error("Config sheet not found in the active spreadsheet");
    }
    
    // Get the config range (assuming parameters are in columns A and B)
    var configRange = configSheet.getRange("A:B");
    
    var config = new GoogleSheetsConfig(configRange);
    config.logMessage("✅ Daily trigger set to run at 5 AM");
  } catch (error) {
    console.error(`Error creating trigger: ${error}`);
    console.error(error.stack);
    if (config) {
      config.logMessage(`❌ Error creating trigger: ${error.message}`);
    }
  }
}

/**
 * Creates a time-based trigger to run the import process hourly.
 */
function createHourlyTrigger() {
  try {
    // Delete any existing triggers with the same function name
    deleteTriggers();
    
    // Create a new trigger to run hourly
    ScriptApp.newTrigger('startImportProcess')
      .timeBased()
      .everyHours(1)
      .create();
    
    // Get the active spreadsheet and the 'Config' sheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var configSheet = spreadsheet.getSheetByName('Config');
    
    if (!configSheet) {
      throw new Error("Config sheet not found in the active spreadsheet");
    }
    
    // Get the config range (assuming parameters are in columns A and B)
    var configRange = configSheet.getRange("A:B");
    
    var config = new GoogleSheetsConfig(configRange);
    config.logMessage("✅ Hourly trigger set");
  } catch (error) {
    console.error(`Error creating trigger: ${error}`);
    console.error(error.stack);
    if (config) {
      config.logMessage(`❌ Error creating trigger: ${error.message}`);
    }
  }
}

/**
 * Creates a custom scheduled trigger.
 */
function createCustomTrigger() {
  try {
    // Delete any existing triggers with the same function name
    deleteTriggers();
    
    // Get the active spreadsheet and the 'Config' sheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var configSheet = spreadsheet.getSheetByName('Config');
    
    if (!configSheet) {
      throw new Error("Config sheet not found in the active spreadsheet");
    }
    
    // Get the config range (assuming parameters are in columns A and B)
    var configRange = configSheet.getRange("A:B");
    
    // Get the custom schedule configuration
    var config = new GoogleSheetsConfig(configRange);
    var customHour = parseInt((config.ScheduleHour && config.ScheduleHour.value) || "5", 10);
    var customMinute = parseInt((config.ScheduleMinute && config.ScheduleMinute.value) || "0", 10);
    
    // Validate hour and minute
    customHour = Math.max(0, Math.min(23, customHour));
    customMinute = Math.max(0, Math.min(59, customMinute));
    
    // Create a new trigger with custom schedule
    ScriptApp.newTrigger('startImportProcess')
      .timeBased()
      .everyDays(1)
      .atHour(customHour)
      .nearMinute(customMinute)
      .create();
    
    config.logMessage(`✅ Daily trigger set to run at ${customHour}:${customMinute < 10 ? '0' + customMinute : customMinute}`);
  } catch (error) {
    console.error(`Error creating custom trigger: ${error}`);
    console.error(error.stack);
    if (config) {
      config.logMessage(`❌ Error creating custom trigger: ${error.message}`);
    }
  }
}

/**
 * Deletes all triggers associated with this script.
 */
function deleteTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'startImportProcess') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

/**
 * Shows the available object schemas for the TikTok Ads API.
 */
function showAvailableObjects() {
  try {
    // Get the active spreadsheet and the 'Config' sheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var configSheet = spreadsheet.getSheetByName('Config');
    
    if (!configSheet) {
      throw new Error("Config sheet not found in the active spreadsheet");
    }
    
    // Get the config range (assuming parameters are in columns A and B)
    var configRange = configSheet.getRange("A:B");
    
    var config = new GoogleSheetsConfig(configRange);
    var connector = new TikTokAdsConnector(config);
    
    var schemas = connector.getFieldsSchema();
    
    var output = "Available TikTok Ads API Objects:\n\n";
    
    for (var nodeName in schemas) {
      output += "• " + nodeName + " - " + schemas[nodeName].title + "\n";
      output += "  " + schemas[nodeName].description + "\n";
      output += "  Unique Keys: " + schemas[nodeName].uniqueKeys.join(", ") + "\n\n";
    }
    
    output += "\nData Level Options for ad_insights:\n";
    output += "• AUCTION_ADVERTISER - Aggregate data at the advertiser level\n";
    output += "• AUCTION_CAMPAIGN - Aggregate data at the campaign level\n";
    output += "• AUCTION_ADGROUP - Aggregate data at the ad group level\n";
    output += "• AUCTION_AD - Detailed data at the ad level (default)\n\n";
    output += "Important: TikTok API limits dimensions to 1-4 elements. The connector automatically uses optimal dimensions for each data level.\n";
    output += "Required dimensions for each data level:\n";
    output += "• AUCTION_ADVERTISER: stat_time_day\n";
    output += "• AUCTION_CAMPAIGN: campaign_id, stat_time_day\n";
    output += "• AUCTION_ADGROUP: adgroup_id, stat_time_day\n";
    output += "• AUCTION_AD: ad_id, stat_time_day\n\n";
    output += "Valid metrics for ad_insights (these must be separate from dimensions):\n";
    
    // Get valid metrics from connector
    const validMetrics = connector.getValidAdInsightsMetrics();
    
    // Group metrics by category for readability
    const metricCategories = {
      "Cost metrics": ["spend", "cpc", "cpm", "cpr", "cpa", "cost_per_conversion", "cost_per_1000_reached"],
      "Performance metrics": ["impressions", "clicks", "ctr", "reach", "frequency", "viewable_impression", 
                             "viewable_rate", "video_play_actions", "video_watched_2s", "video_watched_6s",
                             "average_video_play", "average_video_play_per_user", "video_views_p25", 
                             "video_views_p50", "video_views_p75", "video_views_p100", "profile_visits",
                             "profile_visits_rate", "likes", "comments", "shares", "follows", "landing_page_views"],
      "Conversion metrics": ["conversion", "cost_per_conversion", "conversion_rate", "conversion_1d_click", 
                            "conversion_7d_click", "conversion_28d_click"]
    };
    
    for (const category in metricCategories) {
      const categoryMetrics = metricCategories[category].filter(metric => validMetrics.includes(metric));
      if (categoryMetrics.length > 0) {
        output += `• ${category}: ${categoryMetrics.join(", ")}\n`;
      }
    }
    
    output += "\nNote: Configure the DataLevel parameter in the Config sheet to change the data aggregation level.";
    
    config.logMessage(output);
  } catch (error) {
    console.error(`Error showing available objects: ${error}`);
    console.error(error.stack);
    if (config) {
      config.logMessage(`❌ Error: ${error.message}`);
    }
  }
}

/**
 * Tests the connection to the TikTok Ads API.
 */
function testConnection() {
  try {
    // Get the active spreadsheet and the 'Config' sheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var configSheet = spreadsheet.getSheetByName('Config');
    
    if (!configSheet) {
      throw new Error("Config sheet not found in the active spreadsheet");
    }
    
    // Get the config range (assuming parameters are in columns A and B)
    var configRange = configSheet.getRange("A:B");
    
    var config = new GoogleSheetsConfig(configRange);
    var connector = new TikTokAdsConnector(config);
    
    // Try to fetch advertiser data
    var advertiserIds = String(config.AdvertiserIDs && config.AdvertiserIDs.value || "").split(/[,;]\s*/);
    
    if (!advertiserIds || advertiserIds.length === 0 || advertiserIds[0] === "") {
      config.logMessage("❌ No advertiser IDs specified. Please configure AdvertiserIDs parameter.");
      return;
    }
    
    var testAdvertiserId = advertiserIds[0];
    config.logMessage(`🔄 Testing connection for advertiser ID: ${testAdvertiserId}`);
    
    // Make sure we have the app_id
    var appId = config.AppId && config.AppId.value;
    
    if (!appId) {
      config.logMessage("❌ AppId parameter not found. Please configure it in the Config sheet.");
      return;
    }
    
    // Make sure we have the app_secret
    var appSecret = config.AppSecret && config.AppSecret.value;
    
    if (!appSecret) {
      config.logMessage("❌ AppSecret parameter not found. Please configure it in the Config sheet.");
      return;
    }
    
    // Pass app_id and app_secret to the connector
    connector.appId = appId;
    connector.appSecret = appSecret;
    
    var data = connector.fetchData("advertiser", testAdvertiserId, ["advertiser_id", "advertiser_name"]);
    
    if (data && data.length > 0) {
      config.logMessage(`✅ Connection successful! Advertiser name: ${data[0].advertiser_name}`);
    } else {
      config.logMessage("⚠️ Connection successful but no advertiser data returned.");
    }
  } catch (error) {
    console.error(`Error testing connection: ${error}`);
    console.error(error.stack);
    if (config) {
      config.logMessage(`❌ Connection failed: ${error.message}`);
      
      // Provide more helpful error messages for common issues
      if (error.message.includes("Access Token")) {
        config.logMessage("ℹ️ Please check your Access Token. TikTok access tokens expire after 24 hours.");
      } else if (error.message.includes("advertiser")) {
        config.logMessage("ℹ️ Please check your Advertiser IDs. Make sure they are correct and accessible with your credentials.");
      } else if (error.message.includes("rate limit")) {
        config.logMessage("ℹ️ Rate limit exceeded. Please try again later.");
      }
    }
  }
}

/**
 * Returns an OAuth URL that will authorize this script to access
 * TikTok on the user's behalf.
 */
function getOAuthUrl() {
  try {
    // Get the active spreadsheet and the 'Config' sheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var configSheet = spreadsheet.getSheetByName('Config');
    
    if (!configSheet) {
      throw new Error("Config sheet not found in the active spreadsheet");
    }
    
    // Get the config range (assuming parameters are in columns A and B)
    var configRange = configSheet.getRange("A:B");
    
    var config = new GoogleSheetsConfig(configRange);
    var appId = config.AppId && config.AppId.value;
    var appSecret = config.AppSecret && config.AppSecret.value;
    var redirectUri = (config.RedirectUri && config.RedirectUri.value) || ScriptApp.getService().getUrl();
    
    if (!appId) {
      config.logMessage("❌ AppId parameter not found. Please configure it in the Config sheet.");
      return;
    }
    
    if (!appSecret) {
      config.logMessage("❌ AppSecret parameter not found. Please configure it in the Config sheet.");
      return;
    }
    
    var authUrl = "https://ads.tiktok.com/marketing_api/auth" +
      "?app_id=" + encodeURIComponent(appId) +
      "&secret=" + encodeURIComponent(appSecret) +
      "&redirect_uri=" + encodeURIComponent(redirectUri) +
      "&state=state123" +
      "&scope=ads.read,advertiser.read";
    
    config.logMessage("Please visit the following URL to authorize this script:");
    config.logMessage(authUrl);
    
    return authUrl;
  } catch (error) {
    console.error(`Error generating OAuth URL: ${error}`);
    console.error(error.stack);
    if (config) {
      config.logMessage(`❌ Error: ${error.message}`);
    }
  }
}

/**
 * Cleans up old data based on CleanUpToKeepWindow configuration.
 */
function cleanupOldData() {
  try {
    // Get the active spreadsheet and the 'Config' sheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var configSheet = spreadsheet.getSheetByName('Config');
    
    if (!configSheet) {
      throw new Error("Config sheet not found in the active spreadsheet");
    }
    
    // Get the config range (assuming parameters are in columns A and B)
    var configRange = configSheet.getRange("A:B");
    
    var config = new GoogleSheetsConfig(configRange);
    var connector = new TikTokAdsConnector(config);
    var pipeline = new TikTokAdsPipeline(config, connector);
    
    config.logMessage("🔄 Starting data cleanup process...");
    pipeline.cleanupOldData();
    config.logMessage("✅ Data cleanup completed");
  } catch (error) {
    console.error(`Error during data cleanup: ${error}`);
    console.error(error.stack);
    if (config) {
      config.logMessage(`❌ Error: ${error.message}`);
    }
  }
}

/**
 * Runs when the spreadsheet is opened. Sets up the custom menu.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('OWOX')
    .addItem('Run Import Process', 'startImportProcess')
    .addSeparator()
    .addItem('Test Connection', 'testConnection')
    .addItem('Show Available Objects', 'showAvailableObjects')
    .addSeparator()
    .addSubMenu(SpreadsheetApp.getUi().createMenu('Schedule')
      .addItem('Set Daily Schedule (5 AM)', 'createDailyTrigger')
      .addItem('Set Hourly Schedule', 'createHourlyTrigger')
      .addItem('Set Custom Schedule', 'createCustomTrigger')
      .addItem('Delete All Schedules', 'deleteTriggers'))
    .addItem('Clean Up Old Data', 'cleanupOldData')
    .addItem('Get OAuth URL', 'getOAuthUrl')
    .addToUi();
}

/**
 * Runs when the spreadsheet is installed (as a copy from a template).
 */
function onInstall() {
  onOpen();
} 