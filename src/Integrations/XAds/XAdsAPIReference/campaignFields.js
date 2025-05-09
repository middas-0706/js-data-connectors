/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var campaignFields = {
  'id': {
    'description': 'The unique identifier for the campaign',
    'type': 'string'
  },
  'name': {
    'description': 'The name of the campaign',
    'type': 'string'
  },
  'start_time': {
    'description': 'When the campaign starts',
    'type': 'datetime'
  },
  'end_time': {
    'description': 'When the campaign ends',
    'type': 'datetime'
  },
  'daily_budget_amount_local_micro': {
    'description': 'Daily budget in micros',
    'type': 'integer'
  },
  'total_budget_amount_local_micro': {
    'description': 'Total budget in micros',
    'type': 'integer'
  },
  'funding_instrument_id': {
    'description': 'ID of the funding instrument',
    'type': 'string'
  },
  'currency': {
    'description': 'Currency code',
    'type': 'string'
  },
  'entity_status': {
    'description': 'Status of the campaign',
    'type': 'string'
  },
  'paused': {
    'description': 'Whether the campaign is paused',
    'type': 'boolean'
  },
  'account_id': {
    'description': 'ID of the account',
    'type': 'string'
  },
  'created_at': {
    'description': 'When the campaign was created',
    'type': 'datetime'
  },
  'updated_at': {
    'description': 'When the campaign was last updated',
    'type': 'datetime'
  },
  'deleted': {
    'description': 'Whether the campaign is deleted',
    'type': 'boolean'
  }
}; 