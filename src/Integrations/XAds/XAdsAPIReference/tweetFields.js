/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var tweetFields = {
  "id_str": {
    "description": "The unique identifier for the tweet",
    "type": "string",
    "required": true
  },
  "text": {
    "description": "The text content of the tweet",
    "type": "string"
  },
  "entities": {
    "description": "Entities contained in the tweet",
    "type": "object",
    "fields": {
      "urls": {
        "description": "URLs mentioned in the tweet",
        "type": "array",
        "items": {
          "type": "object",
          "fields": {
            "url": {
              "description": "The URL",
              "type": "string"
            }
          }
        }
      }
    }
  }
}; 