/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var promotedTweetFields = {
  'id': {
    'description': 'The unique identifier for the promoted tweet',
    'type': 'string'
  },
  'tweet_id': {
    'description': 'ID of the original tweet',
    'type': 'string'
  },
  'line_item_id': {
    'description': 'ID of the parent line item',
    'type': 'string'
  },
  'entity_status': {
    'description': 'Status of the promoted tweet (ACTIVE, PAUSED, etc.)',
    'type': 'string'
  },
  'approval_status': {
    'description': 'Approval status of the promoted tweet (ACCEPTED, REJECTED, etc.)',
    'type': 'string'
  },
  'created_at': {
    'description': 'When the promoted tweet was created',
    'type': 'datetime'
  },
  'updated_at': {
    'description': 'When the promoted tweet was last updated',
    'type': 'datetime'
  },
  'deleted': {
    'description': 'Whether the promoted tweet is deleted',
    'type': 'boolean'
  }
}; 