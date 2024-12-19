// Google Sheets Range with config data. Must me referes to a table with three columns: name, value and comment
var CONFIG_RANGE = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config').getRange("A:C");

function onOpen() {
  SpreadsheetApp.getUi().createMenu('OWOX')
    .addItem('▶ Import New Data', 'importNewData')
    .addItem('✖️ CleanUp Expired Data', 'cleanUpExpiredDate')
    .addItem('🔑 Manage Credentials', 'manageCredentials')
    .addToUi();
}

function importNewData() {

  const Connector = new OWOXConnector.OpenExchangeRates( 
    CONFIG_RANGE,
    PropertiesService.getDocumentProperties().getProperties()
  );
  Connector.importNewData();

}

function cleanUpExpiredData() {

  const Connector = new OWOXConnector.OpenExchangeRates( CONFIG_RANGE );
  Connector.cleanUpExpiredData();

}

function manageCredentials() {

  const ui = SpreadsheetApp.getUi();
  const Properties = PropertiesService.getDocumentProperties();
  const currentKey = Properties.getProperty('AppId');

  const response = ui.prompt(
    currentKey ? 'Update your App ID' : 'Add your App Id',
    'To import data from Open Exchange Rates, you need to add an App ID. Here’s how you can get it: https://support.openexchangerates.org/article/121-your-app-id',
    ui.ButtonSet.OK_CANCEL
  );

  // Check the user's response
  if (response.getSelectedButton() === ui.Button.OK) {
    const newKey = response.getResponseText(); 

    if( currentKey && newKey === "" ) {
      
      Properties.deleteProperty('AppId');
      ui.alert('☑️ Saved App ID was deleted');

    } else if( !/^[a-f0-9]{32}$/.test(newKey) ) {

      ui.alert('❌ The provided App ID has an incorrect format');

    } else {
      // Save the input to document properties
      Properties.setProperty('AppId', newKey);

    }
    
  } 

}