var ActiveSheet = class ActiveSheet {

  /**
   * Asbstract class making Google Sheets data active in Apps Script to simplity read/write operations
   * 
   * @param object {sheet} instance of Sheet
   * @param mixed {uniqueKeyColumns} a name of column with unique key or array with columns names
   *
   */
  constructor(sheet, uniqueKeyColumns = null) {
  
    if(typeof sheet.getDataRange != "function") {
      throw new Error(`Unable to create an ${this.constructor.name} object. First parameter must be an instance of Sheet class`);
    }
  
    this.SHEET = sheet;
  
    if(typeof uniqueKeyColumns == "string") {
  
      this.uniqueKeyColumns = [uniqueKeyColumns];
  
    } else if (typeof uniqueKeyColumns == "object" ) {
  
      this.uniqueKeyColumns = uniqueKeyColumns;
  
    } else {
    
      throw new Error(`Cannot create a ${this.constructor.name} object. Column Id Name must be either a string or an array. Got ${typeof uniqueKeyColumns} instead`);
    }
  
    const values = this.SHEET.getDataRange().getValues();
  
    // getting header with columns names
    this.columnNames = values.shift();
  
    // cheking if all columns from unique key are exist in this.columnNames
    if ( this.uniqueKeyColumns.some(column => !this.columnNames.includes(column)) ) {
      throw new Error(`Sheet '${sheet.getName()}' is missing one the folling required for unique key: column '${this.uniqueKeyColumns}'`);
    }
  
    // Convert sheet data from array to an associative object using the unique key from the specified column
    this.values = values.reduce((acc, row, rowIndex) => {
    
      // create a unique Key
      const uniqueKey = this.uniqueKeyColumns.reduce((accumulator, columnName) => {
        let index = this.columnNames.indexOf(columnName); // Find the index of the column name
        accumulator += `|${row[index]}`;              // Append the corresponding value from the row
        return accumulator;
      },[]);
  
      acc[uniqueKey] = {
        ...this.columnNames.reduce((obj, col, colIndex) => ({
          ...obj,
          [col]: row[colIndex]
        }), {}),
        rowIndex // Add row index for reference
      };
  
      return acc;
    }, {});
  
    // property to buffer added record
    this.addedRecordsBuffer = [];
  
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
  
  /**
   * Checking if record exists by id
   *
   * @param object {record} object with record data
   * @param Boolean {useBuffer}: Set to `false` if the record must be saved instantly, or `true` to save it later using `this.saveAddedRecordsFromBuffer()`.
   * 
   * @return object {record} with added rowIndex property
   * 
   */
  addNewRecord(record, useBuffer = false) {
  
    let uniqueKey = this.getRecordUniqueKey( record );
  
    // a new record must be added to buffer
    if( useBuffer ) {
  
      this.addedRecordsBuffer[ uniqueKey ] = record;
  
    // a new record must be saved right away
    } else {
  
    // Filter data to include only existing columns
      let data = this.columnNames.map(key => record[key] || "");
      this.SHEET.appendRow(data);
      record.rowIndex = this.SHEET.getLastRow() - 2; // index start from the 1, and the first is a header
      this.values[ uniqueKey ] = record;
    }
  
    
  
    return record;
  
  }
  
  /*
  * added records from buffer to asheet
  * 
  * @param (integer) {maxBufferSize} record will be added only if buffer size if larger than this parameter
  */
  saveRecordsAddedToBuffer(maxBufferSize = 0)  {
  
    let recordsAdded = 0;
    let bufferSize = Object.keys( this.addedRecordsBuffer ).length;
  
    // buffer must be saved only in case if it is larger than maxBufferSize
    if( bufferSize >= maxBufferSize && bufferSize ) {
      
      let startIndex = this.SHEET.getLastRow() - 2;
      let index = 1;
      let data = [];
      for(var uniqueKey in this.addedRecordsBuffer) {
        let record = this.addedRecordsBuffer[uniqueKey];
        record.rowIndex = startIndex + index++;
        //console.log("rowIndex: " + record.rowIndex);
        this.values[ uniqueKey ] = record;
        data.push( this.columnNames.map(key => record[key] || "") );
      }
  
      this.SHEET.getRange(startIndex + 3, 1, data.length, data[0].length).setValues(data);
      recordsAdded = bufferSize;
      this.addedRecordsBuffer = {};
  
    }
  
    return recordsAdded;
  }
  
  
  /**
   * Update content of an existing record
   *
   * @param object {record} object with record data
   * 
   * @return boolean Returns true if the record was updated; otherwise, returns false
   */
  updateRecord(record) {
  
    let uniqueKey = this.getRecordUniqueKey( record );
  
    var existingRecord = this.getRecordByUniqueKey( uniqueKey );
    var isRecordUpdated = false;
  
    // Updating cells that have received new values
    this.columnNames.forEach((columnName, columnIndex) => {
  
      // if new record has a columnName property and a value of this property differs from an existingRecord one
      if( columnName in record && !ActiveSheet.areValuesEqual(record[ columnName ], existingRecord[ columnName ]) ) {
        console.log(`${uniqueKey}: ${existingRecord[ columnName ]} ${typeof existingRecord[ columnName ]} → ${record[ columnName ]} ${typeof record[ columnName ]}`);
  
        // @TODO: before updating value we need to doublecheck that it is still the right record at this rowIndex
        
        this.SHEET.getRange(existingRecord.rowIndex + 2 , columnIndex + 1, 1, 1).setValue( record[ columnName ] );
        existingRecord[ columnName ] = record[ columnName ];
        isRecordUpdated = true;
      }
    });
    
    return isRecordUpdated;
  
  }
  
  
  /*
  *
  * Delete record from a sheet
  *
  * @param uniqueKey {string} unique key of the record to delete
  */
  deleteRecord(uniqueKey) {
  
  
    if( !(uniqueKey in this.values) ) {
      throw new Error(`Unable to delete the record with ID ${uniqueKey} because it was not found`);
  
    } else if( !("rowIndex" in this.values[ uniqueKey ])  ) {
      throw new Error(`Unable to delete the record with ID ${uniqueKey} because it does not have a rowIndex`);
      
    } else {
      let rowIndex = this.values[ uniqueKey ].rowIndex;
      this.SHEET.deleteRow(rowIndex + 2);
  
  // https://developers.google.com/apps-script/reference/spreadsheet/sheet#deleterowsrowposition,-howmany
      // if we deleting record we need to shift all records below one position up
      for(uniqueKey in this.values) {
        if( this.values[uniqueKey].rowIndex > rowIndex ) {
          this.values[uniqueKey].rowIndex--;
        }
      }
      
    }
  
  
  }
  
  
  /*
  Adding header to sheet
  
  @param target Sheet
  @param array column names to be added
  
  */
  static addHeader(sheet, columnNames) {
  
    columnNames.forEach((columnName, index) => {
      sheet.insertColumns(index + 1);
      sheet.getRange(1, index + 1).setValue(columnName); 
    });
  
    sheet.getRange("1:1").setBackground("#f3f3f3");
    sheet.setFrozenRows(1);
  
  }
  
  /*
  Adding a column to the sheet
  
  @param columnName (string) column name
  @param columnIndex (integer) optional; column index
  
  */
  addColumn(columnName, columnIndex = 1) {
  
    this.SHEET.insertColumnAfter(columnIndex-1);
    this.SHEET.getRange(1, columnIndex).setValue(columnName); 
    this.columnNames.push(columnName);
    
  }
  
  
  getTheLastDate(dateColumnName) {
  
    throw new Error("getTheLastDate");
  }
  
  /*
  
  @param Sheet object of Sheet
  @return boolean true if sheet is empty, false overwise 
  
  */
  static isEmpty(sheet) {
  
    return sheet.getLastRow() === 0 && sheet.getLastColumn() === 0;
  
  }
  
  
  static areValuesEqual(value1, value2) {
  
    var equal = null;
  
    if ( value1.constructor.name == "Date" || value2.constructor.name == "Date" ) {
       
      const normalizeToDate = (value) => {
        if (value === null || value === "") return null;
        if (value.constructor.name == "Date") return value;
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
      };
  
      // Normalize inputs
      const date1 = normalizeToDate(value1);
      const date2 = normalizeToDate(value2);
  
      // Handle null or invalid dates
      if (date1 === null || date2 === null) {
        return value1 === value2; // Direct comparison for non-dates
      }
  
      // Compare timestamps
      equal = date1.getTime() === date2.getTime();
  
    } else if( typeof value1 == typeof value2) {
  
      equal = (value1 === value2)
  
    } else if( (value1 === undefined && value2 === "") || (value2 === undefined && value1 === "") ) {
  
      equal = true;
  
    } else if( (value1 === null && value2 === "") || (value2 === null && value1 === "") ) {
      
      equal = true;
  
    }
  
    return equal;
  
  }
  
  }