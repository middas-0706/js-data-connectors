/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var lineItemFields = {
  'id': {
    'description': 'The unique identifier for the line item',
    'type': 'string'
  },
  'name': {
    'description': 'The name of the line item',
    'type': 'string'
  },
  'campaign_id': {
    'description': 'ID of the parent campaign',
    'type': 'string'
  },
  'bid_amount_local_micro': {
    'description': 'Bid amount in micros',
    'type': 'integer'
  },
  'bid_type': {
    'description': 'Type of bidding',
    'type': 'string'
  },
  'automatically_select_bid': {
    'description': 'Whether to automatically select bid',
    'type': 'boolean'
  },
  'charge_by': {
    'description': 'How the line item is charged',
    'type': 'string'
  },
  'advertiser_domain': {
    'description': 'Domain of the advertiser',
    'type': 'string'
  },
  'primary_web_event_tag': {
    'description': 'Primary web event tag',
    'type': 'string'
  },
  'optimization': {
    'description': 'Optimization settings',
    'type': 'string'
  },
  'objective': {
    'description': 'Objective of the line item',
    'type': 'string'
  },
  'product_type': {
    'description': 'Type of product',
    'type': 'string'
  },
  'placements': {
    'description': 'Placement settings',
    'type': 'array'
  },
  'created_at': {
    'description': 'When the line item was created',
    'type': 'datetime'
  },
  'updated_at': {
    'description': 'When the line item was last updated',
    'type': 'datetime'
  },
  'deleted': {
    'description': 'Whether the line item is deleted',
    'type': 'boolean'
  }
}; 