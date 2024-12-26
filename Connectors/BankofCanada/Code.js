// Google Sheets Range with config data. Must me referes to a table with three columns: name, value and comment
var CONFIG_RANGE = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config').getRange("A:C");

function onOpen() {
  SpreadsheetApp.getUi().createMenu('OWOX')
    .addItem('▶ Import New Data', 'importNewData')
    .addItem('✖️ CleanUp Expired Data', 'cleanUpExpiredDate')
    .addToUi();
}

function importNewData() {

  const Connector = new OWOXConnector.BankOfCanada( CONFIG_RANGE );
  Connector.importNewData();

}

function cleanUpExpiredData() {

  const Connector = new OWOXConnector.BankOfCanada( CONFIG_RANGE );
  Connector.cleanUpExpiredData();


}