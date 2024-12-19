var AbstractConnector = class AbstractConnector {

    /**
     * Asbstract class for Connectros
     *
     * @param {configSheetRange} instance of Range class with config data. The first row must be a name of the parameter, the second one its value 
     * @param {configConnector} optional object with hardcoded config. Defined in inherited classes. configConnector data overwrites configSheetRange data 
     *
     */
    constructor(configSheetRange = {getA1Notation: null}, configConnector = {} ) {
    
    
      // Check if configRange is an instance of Range Class
      if(typeof configSheetRange.getA1Notation != "function") {
        throw new Error(`Unable to create an ${this.constructor.name} object. The parameter must be an instance of Sheet class`)
      } 
    
      // defining CONFIG with connector's config parameters first, add merge with sheets paraments after
      this.CONFIG = configConnector;
    
      // Get the values from the config sheet range
      let configValues = configSheetRange.getValues();
    
      configValues.forEach( (row, index) => {
        var [name, value] = row; // First column as property name
    
        // replace of characters including spaces to let call parameters like this.CONFIG.parameterName
        name = name.replaceAll(/[^a-zA-Z0-9]/gi, "");
    
        // if name of the parameter is not empty and not in exclusion list → add it to configuration
        if( !(["", "Parameters", "Status", "Name"].includes(name) ) ) {
    
          // if this parameter is not defined in connectors config 
          if( !(name in this.CONFIG) )  {
            this.CONFIG[name] = {"value": value}
          
          // overwrite connectors's config with sheet's value if it is exists
          } else if ( value || (value === 0) ) {
            this.CONFIG[name]["value"] = value;
          }
    
          // If the name of the config parameter ends with *, it is required
          if( row[0].slice(-1) == "*" ) { 
            this.CONFIG[name].isRequired = true
          }
      
          // if this parameter need a reference to the cell, we need to add it
          if( ["Log", "CurrentStatus", "LastImportDate", "LastRequestedDate", "DestinationSpreadsheet"].includes(name) ) {
            this.CONFIG[ name ].cell = configSheetRange.offset( index, 1, 1, 1);
          }
    
        }
    
      });
    
      ["Log", "CurrentStatus"].forEach((name) => {
        if( !(name in this.CONFIG) ) {
          throw new Error(`Unable to load a configuration. The parameter ‘${name}’ not found in a config Sheet`)
        }
      });
    
      // Assigning a time zone to the Log parameter in order to write time-stamped messages in it
      this.CONFIG.Log.timeZone = this.CONFIG.Log.cell.getSheet().getParent().getSpreadsheetTimeZone();
    
      try {
    
        // validating config
        for (let name in this.CONFIG) {
    
          let parameter = this.CONFIG[ name ];
    
            // if parameter's value is required
          if( parameter.isRequired == true) {
            if( !parameter.value && parameter.value !== 0 ) {
              throw new Error(parameter.errorMessage ? parameter.errorMessage : `Unable to load the configuration. The parameter ‘${name}’ is required but was provided with an empty value`)
            }
          }
    
          // there is a type restriction for parameter values
          if( "requiredType" in parameter && parameter.value ) {
    
              if( !(["string", "number", "date"].includes( parameter.requiredType )) ) {
    
                throw new Error(`Parameter '${name}' has wrong requiredType in configuration`)
    
              // parameters must be eigher string or number
              } else if( ( parameter.requiredType == "string" || parameter.requiredType == "number" ) 
              && typeof parameter.value !== parameter.requiredType ) {
    
                throw new Error(`Parameter '${name}' must a a ${parameter.requiredType}. Got ${typeof parameter} instead`)
    
              // parameters must be a date
              } else if ( parameter.requiredType == "date"  
              && parameter.value.constructor.name != "Date" ) {
    
                throw new Error(`Parameter '${name}' must be a ${parameter.requiredType}. Got ${typeof parameter} instead`)
    
              }
        
          }
    
        };
    
      } catch(error) {
    
          this.logMessage(`Error:  ${error.message}`);
    
          // in case current status is not In progress, we need to update it to "Error". We cannot overwrite "In progress" status with "Error" to avoid import dublication
          if( !this.isInProgress() ) {
            this.updateCurrentStatus(`Error`);
          }
    
          throw error;
    
      }
    
    }
    
    /*
    
    Initiates imports new data from a data source
    
    */
    importNewData() {
    
      try {
    
        // if import is already in progress skip this run in order to avoid dublication 
        if( this.isInProgress() ) {
    
          this.logMessage("⚠️ Import is already in progress");
          this.CONFIG.CurrentStatus.cell.setBackground( "#fff0c4" );
    
        // stat a new import
        } else {
    
          this.logMessage("⚫️ Configuration was loaded successfully", true);
          this.updateCurrentStatus(`Import in progress`);
          this.updateLastImportDate();
          this.logMessage("🟢 Start importing new data");
    
          let destinationSheet = this.getDestinationSheet();
    
          // if destination sheet is empty than header should be created based on unique key columns list
          if( ActiveSheet.isEmpty(destinationSheet) ) {        
            ActiveSheet.addHeader(destinationSheet, this.uniqueKeyColumns);
            this.logMessage(`Column(s) for unique key was added: ${this.uniqueKeyColumns}`);
          }  
    
          this.runImportProcess();
    
          this.logMessage("✅ Import is finished");
          this.updateCurrentStatus(`Done`);      
        }
    
        this.updateLastImportDate();
    
      } catch( error ) {
    
        this.updateCurrentStatus(`Error`);
        this.logMessage(`❌ ${error.message}`);
        throw error;
    
      }
    
    }
    
    /*
    
    A method for calling from importNewData() for determining parameters needed to fetch new data.
    Code.gs → importNewData() → runImportProcess() → fetchData(), saveFetchedData();
    
    */
    runImportProcess() {
    
      var startDate = this.CONFIG.StartDate.value;
    
      // data wasn't fetched earlier
      if ( !this.CONFIG.LastRequestedDate.value ) {
        var lastRequestedDate = new Date(this.CONFIG.StartDate.value.getTime() );
    
      } else {
        var lastRequestedDate = new Date(this.CONFIG.LastRequestedDate.value.getTime() );
        lastRequestedDate.setDate( this.CONFIG.LastRequestedDate.value.getDate() - this.CONFIG.ReimportLookbackWindow.value );
      }
    
      // The earliest date that can be requested is the start date
      if( startDate.getTime() < lastRequestedDate.getTime() ) {
        var startDate = lastRequestedDate;
      }
    
      var endDate = new Date(startDate);
      endDate.setDate( startDate.getDate() + this.CONFIG.MaxFetchingDays.value );
    
      // End Date is defined in config and it is ealier than it was calculated below
      if( this.CONFIG.EndDate.value && endDate.getTime() > this.CONFIG.EndDate.value.getTime() ) {
        endDate = this.CONFIG.EndDate.value;
      }
    
      // endDate cannot be latter than now
      if( (new Date).getTime() <  endDate.getTime() ) {
          endDate = new Date();
      }
    
      // fetching new data from a data source
      let data = this.fetchData(startDate, endDate);
    
      // there are fetched records to update
      if( !data.length ) {      
        
        this.logMessage("ℹ️ No records have been fetched");
        this.updateLastRequstedDate(endDate);
    
      } else {
    
        this.logMessage(`${data.length} rows were fetched`);
        let activeSheet = new ActiveSheet(this.getDestinationSheet(), this.uniqueKeyColumns );
        this.saveFetchedDataToSheet(activeSheet, data);
    
      }
    
      this.updateLastRequstedDate(endDate);
    
    }
    
    
    
    /*
    
    Saving data to a sheet
    
    @param {activeSheet} ActiveSheet object with data destination sheet
    @param {data} array of assoc objects with records to save
    
    */
    saveFetchedDataToSheet(activeSheet, data) {
        
      // if there are new fields in new data that should be added first
      let newFields = Object.keys(data[0]).filter( column => !activeSheet.columnNames.includes(column) );
    
      // create new columns that are in data but absent in a Sheet
      for( var column in newFields ) {
        activeSheet.addColumn(newFields[column], activeSheet.columnNames.length + 1);
        this.logMessage(`Column '${newFields[column]}' was added to '${activeSheet.SHEET.getName()}' sheet`);
      }
    
      // updating sheet content based on data
      var recordsAdded = 0;
      var recordsUpdated = 0;
    
      data.map((row) => {
        if( activeSheet.isRecordExists(row) ) {
          if( activeSheet.updateRecord(row) ) {
            recordsUpdated++;
          };
        } else {
          activeSheet.addNewRecord(row, true);
          recordsAdded += activeSheet.saveRecordsAddedToBuffer(100);
        }
      })
    
      // saving the residue of the buffer to sheet
      recordsAdded += activeSheet.saveRecordsAddedToBuffer(0);
    
      if( recordsAdded > 0) {
        this.logMessage(`${recordsAdded} records were added`);
      }
    
      if( recordsUpdated > 0) {
        this.logMessage(`${recordsUpdated} records were updated`);
      }
    
    }
    
    
    /*
    * @return Sheet object for data Destination
    *
    */
    getDestinationSheet() {
    
      // reference to the destination sheet is not specified yet
      if( !this.CONFIG.DestinationSpreadsheet.sheet ) {
      
        // destination sheet is a default one (the same as config's sheet)
        if( !this.CONFIG.DestinationSpreadsheet.value ) {
          this.CONFIG.DestinationSpreadsheet.spreadsheet = this.CONFIG.DestinationSpreadsheet.cell.getSheet().getParent();
    
        // destination spreadsheet is defined in config and must me used instead of config's sheet
        } else {
    
          let match = this.CONFIG.DestinationSpreadsheet.value.match(/\/d\/([a-zA-Z0-9-_]+)/);
    
          // Destination Spreadhseet is defined by its id
          if( match && match[1] ) {
    
            this.CONFIG.DestinationSpreadsheet.spreadhsheet = SpreadsheetApp.openById(match[1]);
    
          } else {
            
            let match = this.CONFIG.DestinationSpreadsheet.cell.getRichTextValue().getLinkUrl().match(/\/d\/([a-zA-Z0-9-_]+)/);
    
            if (match && match[1]) {
              this.CONFIG.DestinationSpreadsheet.spreadsheet = SpreadsheetApp.openById( match[1] );
            } else {
              throw new Error(`Destination Spreadsheet must be either a Spreadsheet Id or a link to Spreadsheet`);
            }
          }
        }
    
        this.CONFIG.DestinationSpreadsheet.sheet = this.CONFIG.DestinationSpreadsheet.spreadsheet.getSheetByName( this.CONFIG.DestinationSheetName.value ); // Try to get the sheet
    
        // if destination sheet isn't exists in destination spreadsheet
        if ( !this.CONFIG.DestinationSpreadsheet.sheet ) {
          // If the sheet doesn't exist, create it
          this.CONFIG.DestinationSpreadsheet.sheet = this.CONFIG.DestinationSpreadsheet.spreadsheet.insertSheet( this.CONFIG.DestinationSheetName.value, 1 );
          this.logMessage(`Sheet '${this.CONFIG.DestinationSheetName.value}' was created.`);
    
        }
      }
      
      return this.CONFIG.DestinationSpreadsheet.sheet; // Return the sheet object
    
    }
    
    /*
    *
    * @param string current status value
    *
    */
    updateCurrentStatus(status) {
    
      this.CONFIG.CurrentStatus.cell.setValue(status);
    
      let backgroundColor = null;
    
      switch (status) {
        case "CleanUp in progress":
          backgroundColor = "#c9e3f9";
          break;
    
        case "Import in progress":
          backgroundColor = "#c9e3f9";
          break;
        case "Error":
          backgroundColor = "#fdd2cf";
          break;
        case "Done":
          backgroundColor = "#d4efd5";
          break;
      }
    
      this.CONFIG.CurrentStatus.cell.setBackground( backgroundColor );
    
    } 
    
    /*
    
    updating the last import attempt date in a config sheet
    
    */
    updateLastImportDate() {
      
      this.CONFIG.LastImportDate.cell.setValue( Utilities.formatDate(new Date(), this.CONFIG.Log.timeZone, "yyyy-MM-dd HH:mm:ss") );
    
    }
    
    /*
    
    Updating the last requested date in a config sheet
    
    @param date Date requested date
    
    */
    updateLastRequstedDate(date) {
    
      // checking is Last Request Date exists in a CONFIG and value was changed
      if( "LastRequestedDate" in this.CONFIG 
      && ( !this.CONFIG.LastRequestedDate.value || date.getTime() != this.CONFIG.LastRequestedDate.value.getTime() ) ) {
    
        this.CONFIG.LastRequestedDate.value = new Date(date.getTime() );
        this.CONFIG.LastRequestedDate.cell.setValue( Utilities.formatDate(date, this.CONFIG.Log.timeZone, "yyyy-MM-dd HH:mm:ss") );
    
      }
    
    }
    
    /*
    * Delete all rows from Sheets which have a this.dateColumn before today() - this.CONGIF.CleanUpToKeepWindow
    *
    */
    cleanUpExpiredData() {
    
      try {
    
        // parameter CleanUpToKeepWindow is not specified. It is required to cleanup
        if( !("CleanUpToKeepWindow" in this.CONFIG) ) {
    
          this.logMessage("⚠️ Unable to start cleanup because CleanUpToKeepWindow parameter is empty");
    
        // if import is already in progress skip this run in order to avoid dublication 
        } else if( this.isInProgress() ) {
    
          this.logMessage("⚠️ Unable to start cleanup because import is in progress");
          this.CONFIG.CurrentStatus.cell.setBackground( "#fff0c4" );
    
        // stat cleaning process
        } else {
    
          this.updateCurrentStatus(`CleanUp in progress`);
          this.logMessage(`🧹 Start cleaning expired rows`, true);
    
          let deletedRows = 0;
          let activeSheet = new ActiveSheet(this.getDestinationSheet(), this.uniqueKeyColumns );
          let maxDate = new Date();
          maxDate.setDate( maxDate.getDate() - this.CONFIG.CleanUpToKeepWindow.value );
    
          for(var uniqueKey in activeSheet.values ) {
    
            let record = activeSheet.values[uniqueKey];
    
            // record date is expired
            if( record[ this.dateColumn ] < maxDate ) {
              activeSheet.deleteRecord( uniqueKey );
              deletedRows++;
            }
    
          }
    
          switch (deletedRows) {
            case 0:
              this.logMessage(`No rows were deleted`);
              break;
    
            case 1:
              this.logMessage(`1 row was deleted`);
              break;
    
            default:
              this.logMessage(`${deletedRows} row were deleted`);
              break;
          }
          
        }
    
        this.logMessage("✅ Cleanup is finished");
        this.updateCurrentStatus(`Done`);
    
    
      } catch( error ) {
    
        this.logMessage(`❌ ${error.message}`);
        throw error;
    
      }
    
    
    }
    
    /*
    
    Checking current status if it is in progress or not
    
    @return boolean true is process in progress
    
    */
    isInProgress() {
    
        return (this.CONFIG.CurrentStatus.cell.getValue().indexOf("progress") !== -1)
    
    }
    
    /*
    *
    * @param string message to Log
    *
    */
    logMessage(message, removeExistingMessage = false) {
    
      console.log(message);
      
      let formattedDate = Utilities.formatDate(new Date(), this.CONFIG.Log.timeZone, "yyyy-MM-dd HH:mm:ss"); // Format the date
    
      // Read the existing log message if it shouldn’t be removed
      let currentLog = removeExistingMessage ? "" : this.CONFIG.Log.cell.getValue();
    
      currentLog ? currentLog += "\n" : "";
    
      let emoji = "☑️ ";
      let match;
    
      // If a message starts with an emoji, we need to move it to the beginning to make the log look perfect and easy to read
      if( match = message.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Extended_Pictographic})\s+/u) ) {
        emoji = match[0];
        message = message.slice(2).trim();
      }
    
      this.CONFIG.Log.cell.setValue(
        `${currentLog}${emoji}${formattedDate}: ${message}`
      );
    
    }
    
    
    
    /*
    
    A Data Source-specific methid is used to fetch new data and return it as an array of objects, where each property of an object corresponds to a column name.
    
    @return data array 
    */
    fetchNewData() {
    
      throw new Error("Method fetchNewData must be implemented in Class inheritor of AbstractConnector");
    
    }
    
    }