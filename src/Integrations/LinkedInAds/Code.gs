/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// Google Sheets Range with config data. Must be refers to a table with three columns: name, value and comment
var CONFIG_RANGE = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config').getRange("A:C");

function onOpen() {
  SpreadsheetApp.getUi().createMenu('OWOX')
    .addItem('▶ Import New Data', 'importNewData')
    .addItem('🧹 CleanUp Expired Data', 'cleanUpExpiredData')
    .addItem('🔑 Manage Credentials', 'manageCredentials')
    .addItem('⏰ Schedule', 'scheduleRuns')
    .addItem('📋 Update Fields Sheet', 'updateFieldsSheet')
    .addToUi();
}

function importNewData() {
  console.log('Starting importNewData');
  const config = new OWOX.GoogleSheetsConfig(CONFIG_RANGE);
  
  try {
    const properties = PropertiesService.getDocumentProperties().getProperties();
    console.log('Properties:', properties);
    console.log('Config:', config);

    console.log('Creating connector...');
    const connector = new OWOX.LinkedAdsConnector(config.setParametersValues(properties));
    console.log('Connector created');

    console.log('Creating pipeline...');
    const pipeline = new OWOX.LinkedAdsPipeline(
      config,
      connector,
      "GoogleSheetsStorage"
    );
    console.log('Pipeline created, starting process...');

    pipeline.process();
  } catch (error) {
    SpreadsheetApp.getUi().alert(`Error: ${error.message}`);
    console.error('Error in importNewData:', error);
  }
}

function cleanUpExpiredData() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Clean Up Expired Data',
    'Which node data would you like to clean up? (adAccounts, adCampaigns, creatives, insights)',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() === ui.Button.OK) {
    const node = response.getResponseText().trim();
    const config = new OWOX.GoogleSheetsConfig(CONFIG_RANGE);
    
    try {
      // Get schema from the connector to find unique keys
      const connector = new OWOX.LinkedAdsConnector(config);
      const schema = connector.getAvailableFields()[node];
      
      if (!schema) {
        ui.alert(`Invalid node name: ${node}. Please use one of: adAccounts, adCampaigns, creatives, insights`);
        return;
      }
      
      const uniqueKeys = schema.uniqueKeys || ["id"];
      const dateColumn = schema.fields.date ? "date" : null;
      
      const storage = new OWOX.GoogleSheetsStorage(config, uniqueKeys);
      
      if (dateColumn) {
        const keepDays = config.CleanUpToKeepWindow 
          ? parseInt(config.CleanUpToKeepWindow.value) 
          : 90;
          
        storage.cleanUpExpiredData(dateColumn, keepDays);
        ui.alert(`Data older than ${keepDays} days has been removed from ${node}`);
      } else {
        ui.alert(`Node ${node} does not have date field for cleanup.`);
      }
    } catch (error) {
      ui.alert(`Error: ${error.message}`);
      console.error(error);
    }
  }
}

function updateFieldsSheet() {
  const config = new OWOX.GoogleSheetsConfig(CONFIG_RANGE);
  const connector = new OWOX.LinkedAdsConnector(config.setParametersValues({
    "AccessToken": "undefined",
    "AdAccountIds": "undefined"
  }));
  
  try {
    const schema = connector.getAvailableFields();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Fields') || 
      SpreadsheetApp.getActiveSpreadsheet().insertSheet('Fields');
    
    // Clear existing content
    sheet.clear();
    
    // Set headers
    sheet.getRange(1, 1, 1, 4).setValues([['Node', 'Field', 'Type', 'Description']]);
    
    // Populate fields
    let row = 2;
    for (const node in schema) {
      for (const field in schema[node].fields) {
        const fieldInfo = schema[node].fields[field];
        sheet.getRange(row, 1, 1, 4).setValues([[
          node,
          field,
          fieldInfo.type,
          fieldInfo.description
        ]]);
        row++;
      }
    }
    
    // Format as table
    sheet.getRange(1, 1, row-1, 4).createFilter();
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    
    SpreadsheetApp.getUi().alert('Fields sheet has been updated.');
  } catch (error) {
    SpreadsheetApp.getUi().alert(`Error: ${error.message}`);
    console.error(error);
  }
}

function manageCredentials() {
  const ui = SpreadsheetApp.getUi();
  const Properties = PropertiesService.getDocumentProperties();
  const currentKey = Properties.getProperty('AccessToken');
  const response = ui.prompt(
    currentKey ? 'Update your Access Token' : 'Add your Access Token',
    'To import data from LinkedIn Ads API, you need to add an Access Token with r_ads and r_ads_reporting scopes. Please refer to the documentation for instructions.',
    ui.ButtonSet.OK_CANCEL
  );

  // Check the user's response
  if (response.getSelectedButton() === ui.Button.OK) {
    const newKey = response.getResponseText(); 

    if (currentKey && newKey === "") {
      Properties.deleteProperty('AccessToken');
      ui.alert('☑️ Saved Access Token was deleted');
    } else if (!/^[A-Za-z0-9\-_\.]+$/.test(newKey)) {
      ui.alert('❌ The provided Access Token has an incorrect format');
    } else {
      // Save the input to document properties
      Properties.setProperty('AccessToken', newKey);
      ui.alert('✅ Access Token saved successfully');
    }
  }
}

function scheduleRuns() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Schedule data imports',
    'Would you like to set up a daily import schedule? This will create a trigger to run the importNewData function every day.',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    // Delete any existing triggers
    const triggers = ScriptApp.getProjectTriggers();
    for (let i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === 'importNewData') {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }
    
    // Create a new daily trigger
    ScriptApp.newTrigger('importNewData')
      .timeBased()
      .everyDays(1)
      .atHour(6)
      .create();
    
    ui.alert('✅ Schedule set up successfully! The data will be imported daily at 6:00 AM.');
  }
} 