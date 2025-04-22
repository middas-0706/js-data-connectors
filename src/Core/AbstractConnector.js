/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

class AbstractConnector {
  //---- constructor -------------------------------------------------
    /**
     * Asbstract class for Connectros
     * @param {configSheetRange} instance of Range class with config data. The first row must be a name of the parameter, the second one its value 
     * @param {configConnector} optional object with hardcoded config. Defined in inherited classes. configConnector data overwrites configSheetRange data 
     * @param {Object} options - Additional options for connector
     * @param {string} options.environment - Environment where connector is running ('apps_script', 'node', etc.)
     */
    constructor(config, options = {}) {

      // Check if configRange is an instance of Range Class
      if( typeof config.setParametersValues !== "function" ) {
        throw new Error(`Unable to create an ${this.constructor.name} object. The first parameter must be inheritance of AbstractConfig class`)
      } 

      this.config = config;
      this.maxFetchRetries = 3;
      this.initialRetryDelay = 5000;
      this.environment = options.environment || 'apps_script';
    }
    //----------------------------------------------------------------

  //---- fetchData ---------------------------------------------------
    /**
     * A Data Source-specific methid is used to fetch new data and return it as an array of objects, where each property of an object corresponds to a column name.
     * @return data array
     */
    fetchData() {

      throw new Error("Method fetchData must be implemented in Class inheritor of AbstractConnector");

    }
    //----------------------------------------------------------------

  //---- getFieldsSchema ---------------------------------------------
    /**
     * returing two-levels object with schema details
     * first level with name and description properties for group name
     * the second one for the fields
     * @return object
     */
    getFieldsSchema() {

      // filter only end points with fields
      return Object.fromEntries(
        Object.entries(this.fieldsSchema).filter(([_, value]) => value.fields)
      );

    }
    //----------------------------------------------------------------
    
  //---- urlFetchWithRetry -------------------------------------------
    /**
     * Makes a URL fetch request with retry capability for transient errors
     * @param {string} url - The URL to fetch
     * @param {Object} options - Options for the fetch request (optional)
     * @return {HTTPResponse} The response object from the fetch
     * @throws {Error} After exhausting all retries
     */
    urlFetchWithRetry(url, options) {
      for (let attempt = 1; attempt <= this.maxFetchRetries; attempt++) {
        try {
          const response = this._executeRequest(url, options);
          return response;
        }
        catch (error) {
          if (!this._shouldRetry(error, attempt)) {
            throw error;
          }
          
          this._waitBeforeRetry(attempt);
        }
      }
    }
    
  //---- _executeRequest --------------------------------------------
    /**
     * Executes the HTTP request based on the current environment
     * @param {string} url - The URL to fetch
     * @param {Object} options - Options for the fetch request
     * @return {HTTPResponse} The response object
     * @throws {Error} If the request fails or returns an error status
     * @private
     */
    _executeRequest(url, options) {
      if (this.environment === 'apps_script') {
        const response = UrlFetchApp.fetch(url, { ...options, muteHttpExceptions: true });
        
        return this._validateResponse(response);
      }
      
      throw new Error(`Unsupported environment: ${this.environment}`);
    }
    
  //---- _validateResponse ------------------------------------------
    /**
     * Validates the HTTP response and handles error cases
     * @param {HTTPResponse} response - The HTTP response to validate
     * @return {HTTPResponse} The validated response
     * @throws {Error} If the response indicates an error
     * @private
     */
    _validateResponse(response) {
      const code = response.getResponseCode();
      
      if (code >= HTTP_STATUS.SUCCESS_MIN && code <= HTTP_STATUS.SUCCESS_MAX) {
        return response;
      }
      
      const errorInfo = this._extractErrorInfo(response);
      const error = new Error(errorInfo.message);
      error.responseCode = code;
      error.responseJson = errorInfo.json;
      
      throw error;
    }
    
  //---- _extractErrorInfo ------------------------------------------
    /**
     * Extracts error information from a response
     * @param {HTTPResponse} response - The response object
     * @return {Object} Object containing error message and JSON data if available
     * @private
     */
    _extractErrorInfo(response) {
      const text = response.getContentText();
      let parsedJson = null;
      let message = text;
      
      try {
        parsedJson = JSON.parse(text);
        message = 
          parsedJson?.error?.message || 
          parsedJson?.message || 
          parsedJson?.errorMessage || 
          parsedJson?.error_message ||
          (parsedJson?.errors && Array.isArray(parsedJson.errors) && parsedJson.errors[0]?.message) || 
          text;
      } catch (parseErr) {
        console.log(`Response is not valid JSON: ${parseErr.message}`);
      }
      
      return {
        message,
        json: parsedJson
      };
    }
    
  //---- _shouldRetry ----------------------------------------------
    /**
     * Determines if a retry should be attempted
     * @param {Error} error - The error that occurred
     * @param {number} attempt - The current attempt number
     * @return {boolean} Whether to retry
     * @private
     */
    _shouldRetry(error, attempt) {
      if (attempt >= this.maxFetchRetries) {
        console.log(`Maximum retry attempts (${this.maxFetchRetries}) reached.`);
        return false;
      }
      
      const retryable = this.isValidToRetry(error);
      console.log(`Attempt ${attempt}: isValidToRetry = ${retryable}`);
      
      return retryable;
    }
    
  //---- _waitBeforeRetry ------------------------------------------
    /**
     * Waits before retrying with exponential backoff
     * @param {number} attempt - The current attempt number
     * @private
     */
    _waitBeforeRetry(attempt) {
      const delay = this.calculateBackoff(attempt);
      console.log(`Retrying after ${Math.round(delay/1000)}s...`);
      this.sleep(delay);
    }
    
  //---- calculateBackoff --------------------------------------------
    /**
     * Calculates backoff delay with exponential strategy and jitter
     * @param {number} attemptNumber - Current attempt number (1-based)
     * @return {number} Delay in milliseconds
     */
    calculateBackoff(attemptNumber) {
      return this.initialRetryDelay * Math.pow(2, attemptNumber - 1) * (0.5 + Math.random());
    }
    //----------------------------------------------------------------

  //---- isValidToRetry ----------------------------------------------
    /**
     * Determines if an error is valid for retry
     * This is a default implementation that always returns false
     * Connector implementations should override this method for service-specific error handling
     * 
     * @param {Error} error - The error to check
     * @return {boolean} True if the error should trigger a retry, false otherwise
     */
    isValidToRetry(error) {
      // By default, don't retry any errors
      // Each connector should implement its own retry logic
      return false;
    }
    //----------------------------------------------------------------

  //---- sleep ------------------------------------------------------
    /**
     * Sleep for the specified time based on the current environment
     * @param {number} milliseconds - Time to sleep in milliseconds
     */
    sleep(milliseconds) {
      if (this.environment === 'apps_script') {
        Utilities.sleep(milliseconds);
      } else {
        throw new Error(`Unsupported environment: ${this.environment}`);
      }
    }
    //----------------------------------------------------------------
}