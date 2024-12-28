class AbstractConnector {

  /**
   * Asbstract class for Connectros
   *
   * @param {configSheetRange} instance of Range class with config data. The first row must be a name of the parameter, the second one its value 
   * @param {configConnector} optional object with hardcoded config. Defined in inherited classes. configConnector data overwrites configSheetRange data 
   *
   */
  constructor(config) {
  
    // Check if configRange is an instance of Range Class
    if( typeof config.setParametersValues !== "function" ) {
      throw new Error(`Unable to create an ${this.constructor.name} object. The first parameter must be inheritance of AbstractConfig class`)
    } 
  
    this.config = config;
  
    try {
  
      config.validate();
  
    } catch(error) {
  
      this.config.logMessage(`Error:  ${error.message}`);
  
      // in case current status is not In progress, we need to update it to "Error". We cannot overwrite "In progress" status with "Error" to avoid import dublication
      if( !this.isInProgress() ) {
        this.config.updateCurrentStatus(`Error`);
      }
  
      throw error;
  
    }
  
  }
  
  
  /*
  
  A Data Source-specific methid is used to fetch new data and return it as an array of objects, where each property of an object corresponds to a column name.
  
  @return data array 
  */
  fetchData() {
  
    throw new Error("Method fetchData must be implemented in Class inheritor of AbstractConnector");
  
  }
  
  }