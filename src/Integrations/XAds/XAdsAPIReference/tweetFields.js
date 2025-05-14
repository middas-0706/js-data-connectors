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
  "full_text": {
    "description": "The full text content of the tweet",
    "type": "string"
  },
  "text": {
    "description": "The text content of the tweet (fallback for full_text)",
    "type": "string"
  },
  "card_uri": {
    "description": "URI of the card associated with the tweet",
    "type": "string"
  },
  "nullcast": {
    "description": "Whether the tweet is nullcasted (not shown on the user's timeline)",
    "type": "boolean"
  },
  "tweet_type": {
    "description": "Type of tweet (e.g., PUBLISHED)",
    "type": "string"
  },
  "name": {
    "description": "Name of the tweet",
    "type": "string"
  },
  "created_at": {
    "description": "When the tweet was created",
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
      },
      "hashtags": {
        "description": "Hashtags mentioned in the tweet",
        "type": "array"
      },
      "user_mentions": {
        "description": "User mentions in the tweet",
        "type": "array"
      }
    }
  }
}; 