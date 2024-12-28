class AbstractStorage {

    constructor(config, uniqueKeyColumns) {
    
      if(typeof config.setParametersValues !== "function") {
        throw new Error(`Unable to create an AbstractStorage object. First parameter must be an instance of AbstractConfig class`);
      }
    
      config.validate();
      this.config = config;
    
      if( typeof uniqueKeyColumns == "string" ) {
        this.uniqueKeyColumns = [uniqueKeyColumns];
      } else if (typeof uniqueKeyColumns == "object" ) {
        this.uniqueKeyColumns = uniqueKeyColumns;
      }
    
    }
    
    
    /*
    
    Calculcating unique key based on this.uniqueKeyColumns
    
    @param object 
    
    */
    getRecordUniqueKey(record) {
    
      return this.uniqueKeyColumns.reduce((accumulator, columnName) => {
        
        if( !(columnName in record) ) {
          throw Error(`'${columnName}' value is required for Unique Key, but it is missing in ${record}`);
        }
    
        accumulator += `|${record[columnName]}`;      // Append the corresponding value from the row
        return accumulator;
      }, []);
    
    }
    
    
    /**
     * Returning specific row data by id 
     *
     * @param string {key} unique id of the record
     * @return object with row data
     * 
     */
    getRecordByUniqueKey(key) {
      return typeof this.values[key] == "object" ? this.values[key] : null;
    }
    
    
    /**
     * Checking if record exists by id
     *
     * @param object {record}  record
     * @return TRUE if record exists, overwise FALSE
     * 
     */
    isRecordExists( record )  {
    
      return this.getRecordUniqueKey(record) in this.values;
    
    }
    
    
    
    /*
    
    Saving data to a storage
    
    @param {data} array of assoc objects with records to save
    
    */
    saveData(data) {
    
      // if there are new columns in data that should be added first
      let newFields = Object.keys(data[0]).filter( column => !this.columnNames.includes(column) );
    
      // create new columns that are in data but absent in a Sheet
      for( var column in newFields ) {
        this.addColumn(newFields[column], this.columnNames.length + 1);
        
        // @TODO: SHEET hasn't to be mentioned here
        this.config.logMessage(`Column '${newFields[column]}' was added to '${this.SHEET.getName()}' sheet`);
      }
    
      // updating sheet content based on data
      var recordsAdded = 0;
      var recordsUpdated = 0;
    
      data.map((row) => {
        if( this.isRecordExists(row) ) {
          if( this.updateRecord(row) ) {
            recordsUpdated++;
          };
        } else {
          this.addNewRecord(row, true);
          recordsAdded += this.saveRecordsAddedToBuffer(100);
        }
      })
    
      // saving the residue of the buffer to sheet
      recordsAdded += this.saveRecordsAddedToBuffer(0);
    
      if( recordsAdded > 0) {
        this.config.logMessage(`${recordsAdded} records were added`);
      }
    
      if( recordsUpdated > 0) {
        this.config.logMessage(`${recordsUpdated} records were updated`);
      }
    
    }
    
    /*
    * Add records from buffer to a sheet
    * 
    * @param (integer) {maxBufferSize} record will be added only if buffer size if larger than this parameter
    */
    saveRecordsAddedToBuffer(maxBufferSize = 0) {
    
      throw new Error("saveRecordsAddedToBuffer() must be implemented in AbsctractStorage subclasse");
    
    } 
    
    /*
    * Delete all rows from Sheets which have a this.dateColumn before today() - this.CONGIF.CleanUpToKeepWindow
    *
    * @param string date field 
    */
    cleanUpExpiredData(dateColumn) {
    
    
      try {
    
        // if import is already in progress skip this run in order to avoid dublication 
        if( this.config.isInProgress() ) {
    // add retry
          this.config.logMessage("⚠️ Unable to start cleanup because import is in progress");
          this.config.addWarningToCurrentStatus();
    
    
        // cheking if data column is exists in this.columnNames
        } else if ( this.uniqueKeyColumns.some(column => !this.columnNames.includes( dateColumn )) )  {
      
          throw new Error(`Cannot clean up expired data because the column ‘${dateColumn}’ is missing in the data storage`);
    
        // stat cleaning process
        } else {
    
          this.config.updateCurrentStatus(`CleanUp in progress`);
          this.config.logMessage(`🧹 Start cleaning expired rows`, true);
    
          let deletedRows = 0;
          let maxDate = new Date();
    
          maxDate.setDate( maxDate.getDate() - this.config.CleanUpToKeepWindow.value );
    
          for(var uniqueKey in this.values ) {
    
            let record = this.values[uniqueKey];
    
            // record date is expired
            if( record[ dateColumn ] < maxDate ) {
              this.deleteRecord( uniqueKey );
              deletedRows++;
            }
    
          }
    
          switch (deletedRows) {
            case 0:
              this.config.logMessage(`No rows were deleted`);
              break;
    
            case 1:
              this.config.logMessage(`1 row was deleted`);
              break;
    
            default:
              this.config.logMessage(`${deletedRows} row were deleted`);
              break;
          }
          
        }
    
        this.config.logMessage("✅ Cleanup is finished");
        this.config.updateCurrentStatus(`Done`);
    
    
      } catch( error ) {
    
        this.config.logMessage(`❌ ${error.message}`);
        throw error;
    
      }
    
    
    }
    
    
    }