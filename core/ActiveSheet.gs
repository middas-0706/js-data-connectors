/**
 * Copyright OWOX Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
class ActiveSheet {

/**
 * Asbstract class making Google Sheets data active in Apps Script to simplity read/write operations
 *
 * @param object {sheet} instance of Sheet
 * @param string {columnIdName} a name of columnt with unique id
 *
 */
constructor(sheet, columnIdName) {

  if(typeof sheet.getDataRange != "function") {
    throw new Error(`Cannot create ${this.constructor.name} object. First parameter must be a instance of Sheet class`);
  } else {
    this.SHEET = sheet;
  }

  if(typeof columnIdName != "string") {
    throw new Error(`Cannot create ${this.constructor.name} object. First parameter must be string`);
  } else {
    this.columnIdName = columnIdName;
  }

  const values = this.SHEET.getDataRange().getValues();

  this.columnNames = values.shift();
  let columnIdIndex;
  
  // cheking if column name with unique id exists
  if( (columnIdIndex = this.columnNames.indexOf(this.columnIdName) ) == -1 ) {
    throw new Error(`Column '${this.columnIdName}' not found in the sheet '${sheet.getName()}'`);
  }

  // Convert sheet data from array to an associative object using the unique key from the specified column
  this.values = values.reduce((acc, row, rowIndex) => {
    const uniqueKey = row[columnIdIndex]; // Get the unique key from the "Id" column
    if (!uniqueKey) {
      throw new Error(`Row ${rowIndex + 1} in the sheet '${sheet.getName()}' has an empty or invalid '${this.columnIdName}' value.`);
    }

    acc[uniqueKey] = {
      ...this.columnNames.reduce((obj, col, colIndex) => ({
        ...obj,
        [col]: row[colIndex]
      }), {}),
      rowIndex // Add row index for reference
    };

    return acc;
  }, {});

}

/**
 * Returning specific row data by id 
 *
 * @param string {id} unique id of the record
 * @return object with row data
 * 
 */
getRecordById(id) {
  return typeof this.values[id] == "object" ? this.values[id] : null;
}

/**
 * Checking if record exists by id
 *
 * @param string {id} unique id of the record
 * @return TRUE if record exists, overwise FALSE
 * 
 */
isRecordExists(id)  {
  return typeof this.values[id] == "object";
}

/**
 * Checking if record exists by id
 *
 * @param object {record} object with record data
 * @return object {record} with added rowIndex property
 * 
 */
addNewRecord(record) {

  if( typeof record[ this.columnIdName ] == "undefined" ) {
    throw new Error("New record must contains unique id");
  }

  if( this.isRecordExists( record[ this.columnIdName ] )  ) {
    throw new Error(`Record with id '${record[ this.columnIdName ]}' already exists`);
  }

  // Filter data to include only existing columns
  let data = this.columnNames.map(key => record[key] || "");
  this.SHEET.appendRow(data);
  
  // @TODO: several processed might save data at the same time. We need to reserve blank rows first to make sure that index will not change
  record.rowIndex = this.SHEET.getLastRow() - 2; // index start from the 1, and the first is a header
  this.values[ record[ this.columnIdName ] ] = record;

  return record;

}

/**
 * Update content of an existing record
 *
 * @param object {record} object with record data
 * 
 */
updateRecord(record) {

  if( typeof record[ this.columnIdName ] == "undefined" ) {
    throw new Error("Updated record must contains unique id");
  }

  if( !this.isRecordExists( record[ this.columnIdName ] )  ) {
    throw new Error(`Record with id '${record[ this.columnIdName ]}' doesn't exist and cannot be updated`);
  } else {
    var existingRecord = this.getRecordById( record[ this.columnIdName ] );
  }

  var isRecordUpdated = false;

  // Filter data to include only existing columns
  let data = this.columnNames.map(function(key) {

    var value = "";

    if( typeof record[key] != "undefined" ) {
        value = record[key];

        if( !ActiveSheet.areValuesEqual(record[key], existingRecord[key]) ) {
          // console.log(`${record[key]} (${typeof record[key]}) != ${existingRecord[key]} (${typeof record[key]})`);
          isRecordUpdated = true;
        }
    } else {
      value = existingRecord[key];
    }

    return value;
  });

  if( isRecordUpdated ) {
    this.SHEET.getRange(existingRecord.rowIndex + 2 , 1, 1, data.length).setValues([data]);
  }

  return record;

}

static areValuesEqual(value1, value2) {

  var equal = null;
  
  if( typeof value1 == typeof value2) {
    
    equal = (value1 === value2)

  } else if( (value1 === null && value2 === "") || (value2 === null && value1 === "") ) {
    
    equal = true;

  } else if( value1 instanceof Date || value2 instanceof Date ) {
     
    const normalizeToDate = (value) => {
      if (value === null || value === "") return null;
      if (value instanceof Date) return value;
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
  }

  return equal;

}


}