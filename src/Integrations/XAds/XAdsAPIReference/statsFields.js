/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var statsFields = {
  'id': {
    'description': 'The unique identifier for the stats record',
    'type': 'string'
  },
  'date': {
    'description': 'The date for which the statistics were collected',
    'type': 'string'
  },
  'placement': {
    'description': 'The placement type (ALL_ON_TWITTER or PUBLISHER_NETWORK)',
    'type': 'string',
    'enum': ['ALL_ON_TWITTER', 'PUBLISHER_NETWORK']
  },
  'id_data': {
    'description': 'Array of data points',
    'type': 'array',
    'items': {
      'type': 'object',
      'fields': {
        'metrics': {
          'description': 'Metrics for the data point',
          'type': 'object',
          'fields': {
            'impressions': {
              'description': 'Number of impressions',
              'type': 'array',
              'items': {
                'type': 'integer'
              }
            },
            'billed_charge_local_micro': {
              'description': 'Billed amount in micros',
              'type': 'array',
              'items': {
                'type': 'integer'
              }
            },
            'clicks': {
              'description': 'Number of clicks',
              'type': 'array',
              'items': {
                'type': 'integer'
              }
            }
          }
        }
      }
    }
  }
}; 