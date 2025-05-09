/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var followerStatisticsTimeBoundFields = {
  "organization_urn": {
    "type": "string",
    "mode": "required",
    "description": "Organization URN"
  },
  "time_range_start": {
    "type": "timestamp",
    "mode": "required",
    "description": "Start timestamp of the time range"
  },
  "time_range_end": {
    "type": "timestamp",
    "mode": "required",
    "description": "End timestamp of the time range"
  },
  "organic_follower_gain": {
    "type": "integer",
    "mode": "required",
    "description": "Number of organic followers gained during the time period"
  },
  "paid_follower_gain": {
    "type": "integer",
    "mode": "required",
    "description": "Number of paid followers gained during the time period"
  },
  "follower_counts_by_association_type": {
    "type": "record",
    "mode": "repeated",
    "description": "Followers segmented by association type (empty in time-bound responses)"
  },
  "follower_counts_by_seniority": {
    "type": "record",
    "mode": "repeated",
    "description": "Followers segmented by seniority (empty in time-bound responses)"
  },
  "follower_counts_by_industry": {
    "type": "record",
    "mode": "repeated",
    "description": "Followers segmented by industry (empty in time-bound responses)"
  },
  "follower_counts_by_function": {
    "type": "record", 
    "mode": "repeated",
    "description": "Followers segmented by function (empty in time-bound responses)"
  },
  "follower_counts_by_staff_count_range": {
    "type": "record",
    "mode": "repeated",
    "description": "Followers segmented by staff count range (empty in time-bound responses)"
  },
  "follower_counts_by_geo_country": {
    "type": "record",
    "mode": "repeated",
    "description": "Followers segmented by country (empty in time-bound responses)"
  },
  "follower_counts_by_geo": {
    "type": "record",
    "mode": "repeated",
    "description": "Followers segmented by geographic area (empty in time-bound responses)"
  }
};
