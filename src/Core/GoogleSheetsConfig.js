var GoogleSheetsConfig = class GoogleSheetsConfig extends AbstractConfig {

    constructor(configRange) {
    
      if(typeof configRange.getA1Notation !== "function") {
        throw new Error(`Unable to create an GoogleSheetsConfig object. The first constructor's parameter must be an SpreadsheetApp.Sheet object`)
      } 
    
      // create an object to fill it with parameters in a way required by super class
      let configObject = {};
      
      configRange.getValues().forEach( (row, index) => {
    
        var name = row[0].replaceAll(/[^a-zA-Z0-9]/gi, "");
    
        // if name of the parameter is not empty and not in exclusion list → add it to configuration
        if( !(["", "Parameters", "Status", "Name"].includes(name) ) ) {
          
          var value = row[1];
          configObject[ name ] = {};
    
          if( value || value === 0 )  {
            configObject[name].value = value;
          }
    
          // If original parameter name of the config ends with *, it must be required
          if( row[0].slice(-1) == "*" ) { 
            configObject[ name ].isRequired = true;
          }
      
          // if this parameter need a reference to the cell, we need to add it
          if( ["Log", "CurrentStatus", "LastImportDate", "LastRequestedDate", "DestinationSpreadsheet"].includes(name) ) {
            configObject[ name ].cell = configRange.offset( index, 1, 1, 1);
          }
    
        }
    
      })
    
      // Assigning a time zone to the Log parameter in order to write time-stamped messages into it
      configObject.Log.timeZone = configRange.getSheet().getParent().getSpreadsheetTimeZone();
    
      super(configObject);
    
    }
    
    
    
    /*
    *
    * @param string current status value
    *
    */
    updateCurrentStatus(status) {
    
      this.CurrentStatus.cell.setValue(status);
    
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
    
      this.CurrentStatus.cell.setBackground( backgroundColor );
    
    } 
    
    /*
    
    updating the last import attempt date in a config sheet
    
    */
    updateLastImportDate() {
      
      this.LastImportDate.cell.setValue( Utilities.formatDate(new Date(), this.Log.timeZone, "yyyy-MM-dd HH:mm:ss") );
    
    }
    
    /*
    
    Updating the last requested date in a config sheet
    
    @param date Date requested date
    
    */
    updateLastRequstedDate(date) {
    
      // checking is Last Request Date exists in a CONFIG and value was changed
      if( "LastRequestedDate" in this 
      && ( !this.LastRequestedDate.value || date.getTime() != this.LastRequestedDate.value.getTime() ) ) {
    
        this.LastRequestedDate.value = new Date(date.getTime() );
        this.LastRequestedDate.cell.setValue( Utilities.formatDate(date, this.Log.timeZone, "yyyy-MM-dd HH:mm:ss") );
    
      }
    
    }
    
    
    /*
    
    Checking current status if it is in progress or not
    
    @return boolean true is process in progress
    
    */
    isInProgress() {
      // @TODO: Config might be not a Google Sheet
        return (this.CurrentStatus.cell.getValue().indexOf("progress") !== -1)
    
    }
    
    addWarningToCurrentStatus() {
      this.CurrentStatus.cell.setBackground( "#fff0c4" );
    }
    
    /*
    *
    * @param string message to Log
    *
    */
    logMessage(message, removeExistingMessage = false) {
    
      console.log(message);
      
      let formattedDate = Utilities.formatDate(new Date(), this.Log.timeZone, "yyyy-MM-dd HH:mm:ss"); // Format the date
    
      // Read the existing log message if it shouldn’t be removed
      let currentLog = removeExistingMessage ? "" : this.Log.cell.getValue();
    
      currentLog ? currentLog += "\n" : "";
    
      let emoji = "☑️ ";
      let match;
    
      // If a message starts with an emoji, we need to move it to the beginning to make the log look perfect and easy to read
      if( match = message.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Extended_Pictographic})\s+/u) ) {
        emoji = match[0];
        message = message.slice(2).trim();
      }
    
      this.Log.cell.setValue(
        `${currentLog}${emoji}${formattedDate}: ${message}`
      );
    
    }
    
    }