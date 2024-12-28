var OpenExchangeRatesPipeline = class OpenExchangeRatesPipeline extends AbstractPipeline {


/*

A method for invoking importNewData() to determine the parameters required for fetching new data

*/
startImportProcess() {

  var startDate = this.config.StartDate.value;
  
  // data wasn't fetched earlier
  if ( !this.config.LastRequestedDate.value ) {
    var lastRequestedDate = new Date(this.config.StartDate.value.getTime() );

  } else {
    var lastRequestedDate = new Date( this.config.LastRequestedDate.value.getTime() );
    lastRequestedDate.setDate( this.config.LastRequestedDate.value.getDate() - this.config.ReimportLookbackWindow.value );
  }
  // The earliest date that can be requested is the start date
  if( startDate.getTime() < lastRequestedDate.getTime() ) {
    var startDate = lastRequestedDate;
  }

  // ensuring that data will not be requested for future 
  const MaxFetchingDays = Math.min (
    Math.floor( ( (new Date()).getTime() - startDate.getTime() ) / (1000 * 60 * 60 * 24) ), // days from startDate until today
    this.config.MaxFetchingDays.value 
  )

  // start requesting data day by day from startDate to startDate + MaxFetchingDays
  for(var daysShift = 0; daysShift < MaxFetchingDays; daysShift++) {

    // fetching new data from a data source  
    let data = this.connector.fetchData(startDate);

    // there are fetched records to update
    if( !data.length ) {      
      
      if( daysShift == 0) {
        this.config.logMessage("ℹ️ No records have been fetched");
      }

    } else {

      this.config.logMessage(`${data.length} rows were fetched`);
      this.storage.saveData(data);

    }

    this.config.updateLastRequstedDate(startDate);
    startDate.setDate( startDate.getDate() + 1);  // let's move on to the next date

  }    

}


}