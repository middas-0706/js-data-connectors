/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var followerStatisticsFields = {
  "organization_urn": {
    "type": "string",
    "mode": "required",
    "description": "Organization URN"
  },
  "category_type": {
    "type": "string",
    "mode": "required", 
    "description": "Type of follower category (followerCountsByAssociationType, followerCountsBySeniority, etc.)"
  },
  "segment_name": {
    "type": "string",
    "mode": "required",
    "description": "Name of the segment identifier (associationType, seniority, industry, function, staffCountRange, geo)"
  },
  "segment_value": {
    "type": "string",
    "mode": "required",
    "description": "Value of the segment identifier (e.g., urn:li:seniority:3, 'EMPLOYEE', etc.)"
  },
  "organic_follower_count": {
    "type": "integer",
    "mode": "required",
    "description": "Count of organic followers in this segment"
  },
  "paid_follower_count": {
    "type": "integer",
    "mode": "required",
    "description": "Count of paid followers in this segment"
  }
};
