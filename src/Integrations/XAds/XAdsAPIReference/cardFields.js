/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var cardFields = {
  "id": {
    "description": "The unique identifier for the card",
    "type": "string",
    "required": true
  },
  "name": {
    "description": "The name of the card",
    "type": "string",
    "required": true
  },
  "card_type": {
    "description": "Type of the card",
    "type": "string",
    "required": true
  },
  "card_uri": {
    "description": "URI of the card",
    "type": "string",
    "required": true
  },
  "created_at": {
    "description": "When the card was created",
    "type": "datetime"
  },
  "updated_at": {
    "description": "When the card was last updated",
    "type": "datetime"
  },
  "deleted": {
    "description": "Whether the card is deleted",
    "type": "boolean",
    "required": true
  },
  "components": {
    "description": "Card components including media and buttons",
    "type": "array",
    "items": {
      "type": "object",
      "fields": {
        "type": {
          "description": "Component type (MEDIA, BUTTON, etc)",
          "type": "string"
        },
        "media_key": {
          "description": "Key for media component",
          "type": "string"
        },
        "media_metadata": {
          "description": "Metadata for media component",
          "type": "object"
        },
        "label": {
          "description": "Label for button component",
          "type": "object",
          "fields": {
            "value": {
              "description": "Label value",
              "type": "string"
            },
            "type": {
              "description": "Label type",
              "type": "string"
            }
          }
        },
        "destination": {
          "description": "Destination for button component",
          "type": "object",
          "fields": {
            "type": {
              "description": "Destination type",
              "type": "string"
            },
            "url": {
              "description": "Destination URL",
              "type": "string"
            },
            "country_code": {
              "description": "Country code",
              "type": "string"
            },
            "googleplay_app_id": {
              "description": "Google Play app ID",
              "type": "string"
            },
            "ios_app_store_identifier": {
              "description": "iOS App Store identifier",
              "type": "string"
            }
          }
        }
      }
    }
  }
}; 