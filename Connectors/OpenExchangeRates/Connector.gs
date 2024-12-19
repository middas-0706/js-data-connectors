// API Documentation: https://docs.openexchangerates.org/reference/historical-json

var OpenExchangeRates = class OpenExchangeRates extends OWOXCore.AbstractConnector {

  constructor( configRange, properties ) {
  
    super(
      configRange, 
      {
        AppId: {
          isRequired: true,
          value: properties["AppId"],
          requiredType: "string",
          errorMessage: "You need to add App Id first. Go to Google Sheets Menu ⟩ OWOX ⟩ 🔑 Manage Credentials'"
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
          value: 1
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
        },
        Symbols: {
          requiredType: "string",
          requiredPattern: "" // @TODO: add a support of regexp validation of parameters value ^([A-Z]{3}|[A-Z]{3}(, ?[A-Z]{3})*)$
        },
        base: { // Changing the API `base` currency is available for Developer, Enterprise and Unlimited plan clients
          requiredType: "string",
          isRequired: true,
          value: "USD"
        }
      }
    );
  
    this.dateColumn = ["date"];
    this.uniqueKeyColumns = ["date", "base", "currency"];
  
  }
  
  
  /*
  
  A method for invoking importNewData() to determine the parameters required for fetching new data
  Code.gs → importNewData() → runImportProcess() → fetchData(), saveFetchedData();
  
  */
  runImportProcess() {
  
    var startDate = this.CONFIG.StartDate.value;
  
    // data wasn't fetched earlier
    if ( !this.CONFIG.LastRequestedDate.value ) {
      var lastRequestedDate = new Date(this.CONFIG.StartDate.value.getTime() );
  
    } else {
      var lastRequestedDate = new Date( this.CONFIG.LastRequestedDate.value.getTime() );
      lastRequestedDate.setDate( this.CONFIG.LastRequestedDate.value.getDate() - this.CONFIG.ReimportLookbackWindow.value );
    }
    // The earliest date that can be requested is the start date
    if( startDate.getTime() < lastRequestedDate.getTime() ) {
      var startDate = lastRequestedDate;
    }
  
    // ensuring that data will not be requested for future 
    const MaxFetchingDays = Math.min (
      Math.floor( ( (new Date()).getTime() - startDate.getTime() ) / (1000 * 60 * 60 * 24) ), // days from startDate until today
      this.CONFIG.MaxFetchingDays.value 
    )
  
    let activeSheet = new OWOXCore.ActiveSheet(this.getDestinationSheet(), this.uniqueKeyColumns );
  
    // start requesting data day by day from startDate to startDate + MaxFetchingDays
    for(var daysShift = 0; daysShift < MaxFetchingDays; daysShift++) {
  
      // fetching new data from a data source  
      let data = this.fetchData(startDate);
  
      // there are fetched records to update
      if( !data.length ) {      
        
        if( daysShift == 0) {
          this.logMessage("ℹ️ No records have been fetched");
        }
  
      } else {
  
        this.logMessage(`${data.length} rows were fetched`);
        this.saveFetchedDataToSheet(activeSheet, data);
  
      }
  
      this.updateLastRequstedDate(startDate);
      startDate.setDate( startDate.getDate() + 1);  // let's move on to the next date
  
    }    
  
  }
  
  /*
  @param date The requested date as a Date object
  
  @return data array
  
  */
  fetchData(date)  {
  
    let data = [];
    let base = this.CONFIG.base.value;
    let app_id = this.CONFIG.AppId.value;
    let symbols = '';
  
    // Limit results to specific currencies (comma-separated list of 3-letter codes)
    if( this.CONFIG.Symbols.value ) {
      symbols = '&symbols=' + this.CONFIG.Symbols.value.replace(/[^A-Z,]/g,"");
    }
   
    var date = Utilities.formatDate(date, "UTC", "yyyy-MM-dd"); // The requested date in YYYY-MM-DD format (required)
    const url = `https://openexchangerates.org/api/historical/${date}.json?base=${base}${symbols}&app_id=${app_id}`;
    
    this.logMessage(`🔄 Fetching rates for ${date}`);
  
    //console.log(url);
  
    var response = UrlFetchApp.fetch(url, {'method': 'get', 'muteHttpExceptions': true} );
    var historical = JSON.parse( response.getContentText() );
  
    for (var currency in historical["rates"]) {
      data.push({
        date: new Date(date),
        base: base,
        currency: currency,
        rate: parseFloat(historical["rates"][ currency ])
      });
    };
  
    //console.log(data);
    return data;
  
  }
    
  }