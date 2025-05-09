/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var accountFields = {
  'id': {
    'description': 'The unique identifier for the account',
    'type': 'string'
  },
  'name': {
    'description': 'The name of the account',
    'type': 'string'
  },
  'business_name': {
    'description': 'The business name associated with the account',
    'type': 'string'
  },
  'timezone': {
    'description': 'The timezone of the account',
    'type': 'string'
  },
  'timezone_switch_at': {
    'description': 'When the timezone was last switched',
    'type': 'datetime'
  },
  'created_at': {
    'description': 'When the account was created',
    'type': 'datetime'
  },
  'updated_at': {
    'description': 'When the account was last updated',
    'type': 'datetime'
  },
  'deleted': {
    'description': 'Whether the account is deleted',
    'type': 'boolean'
  }
}; 