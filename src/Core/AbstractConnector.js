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
          if (this.environment === 'apps_script') {
            const response = UrlFetchApp.fetch(url, { ...options, muteHttpExceptions: true });
            const code = response.getResponseCode();

            if (code >= 200 && code < 300) {
              return response;
            }

            const text = response.getContentText();
            let parsedJson;

            try {
              parsedJson = JSON.parse(text);
            } catch (parseErr) {
              parsedJson = null;
            }

            const errMsg = parsedJson?.error?.message || text;
            const err = new Error(errMsg);
            err.responseCode = code;
            err.responseJson = parsedJson;
            throw err;
          }

          throw new Error(`Unsupported environment: ${this.environment}`);
        }
        catch (error) {
          const retryable = this.isValidToRetry(error);

          if (attempt === this.maxFetchRetries || !retryable) {
            console.log(`No more retries (attempt ${attempt}). Throwing.`);
            throw error;
          }

          const delay = this.calculateBackoff(attempt);
          console.log(`Retrying after ${Math.round(delay/1000)}s...`);
          this.sleep(delay);
        }
      }
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