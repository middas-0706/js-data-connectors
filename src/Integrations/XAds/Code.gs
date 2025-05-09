// Google Sheets Range with config data. Must refer to a table with three columns: name, value and comment
var CONFIG_RANGE = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config').getRange("A:C");

function onOpen() {
  SpreadsheetApp.getUi().createMenu('OWOX')
    .addItem('▶ Import New Data', 'importNewData')
    .addItem('🔑 Manage Credentials', 'manageCredentials')
    .addItem('⏰ Schedule', 'scheduleRuns')
    .addItem('📋 Update Fields Sheet', 'updateFieldsSheet')
    .addToUi();
}

function importNewData() {
  const config = new OWOX.GoogleSheetsConfig(CONFIG_RANGE);
  const properties = PropertiesService.getDocumentProperties().getProperties();
  
  // Get auth parameters from config and document properties
  const authParams = {
    apiKey: config.ApiKey.value,
    apiSecret: config.ApiSecret.value,
    accessToken: properties.AccessToken || '',
    accessTokenSecret: properties.AccessTokenSecret || ''
  };
  
  const connector = new OWOX.XAdsConnector(config.setParametersValues({
    ...authParams,
    Fields: properties.Fields || ''
  }));

  const pipeline = new OWOX.XAdsPipeline(
    config,
    connector,
    "GoogleSheetsStorage"
    // "GoogleBigQueryStorage"
  );

  pipeline.run();
}

function updateFieldsSheet() {
  const config = new OWOX.GoogleSheetsConfig(CONFIG_RANGE);
  
  // Get auth parameters from config and properties
  const properties = PropertiesService.getDocumentProperties().getProperties();
  const authParams = {
    apiKey: config.ApiKey.value,
    apiSecret: config.ApiSecret.value,
    accessToken: properties.AccessToken || '',
    accessTokenSecret: properties.AccessTokenSecret || ''
  };

  config.updateFieldsSheet(
    new OWOX.XAdsConnector(config.setParametersValues({
      ...authParams,
      Fields: "undefined"
    }))
  );
}

function manageCredentials() {
  const ui = SpreadsheetApp.getUi();
  const Properties = PropertiesService.getDocumentProperties();
  
  // Access Token management
  manageCredential(ui, Properties, 'AccessToken', 'Access Token', 
    'To import data from X Ads API, you need to add an Access Token. Please refer to the documentation for instructions.');
  
  // Access Token Secret management
  manageCredential(ui, Properties, 'AccessTokenSecret', 'Access Token Secret', 
    'To import data from X Ads API, you need to add an Access Token Secret. Please refer to the documentation for instructions.');
}

function manageCredential(ui, Properties, propertyName, displayName, description) {
  const currentValue = Properties.getProperty(propertyName);
  const response = ui.prompt(
    currentValue ? `Update your ${displayName}` : `Add your ${displayName}`,
    description,
    ui.ButtonSet.OK_CANCEL
  );

  // Check the user's response
  if (response.getSelectedButton() === ui.Button.OK) {
    const newValue = response.getResponseText(); 

    if (currentValue && newValue === "") {
      Properties.deleteProperty(propertyName);
      ui.alert(`☑️ Saved ${displayName} was deleted`);
    } else if (!/^[A-Za-z0-9\-_\.]+$/.test(newValue)) {
      ui.alert(`❌ The provided ${displayName} has an incorrect format`);
    } else {
      // Save the input to document properties
      Properties.setProperty(propertyName, newValue);
      ui.alert(`✅ ${displayName} saved successfully`);
    }
  }
}

function scheduleRuns() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Schedule Runs',
    'To schedule runs, you need to add a time trigger. Details: https://github.com/OWOX/js-data-connectors/issues/47',
    ui.ButtonSet.OK_CANCEL
  );
}
