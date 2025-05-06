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
  "timeRange_start": {
    "type": "timestamp",
    "mode": "required",
    "description": "Start timestamp of the time range"
  },
  "timeRange_end": {
    "type": "timestamp",
    "mode": "required",
    "description": "End timestamp of the time range"
  },
  "organicFollowerGain": {
    "type": "integer",
    "mode": "required",
    "description": "Number of organic followers gained during the time period"
  },
  "paidFollowerGain": {
    "type": "integer",
    "mode": "required",
    "description": "Number of paid followers gained during the time period"
  },
  "followerCountsByAssociationType": {
    "type": "record",
    "mode": "repeated",
    "description": "Followers segmented by association type (empty in time-bound responses)"
  },
  "followerCountsBySeniority": {
    "type": "record",
    "mode": "repeated",
    "description": "Followers segmented by seniority (empty in time-bound responses)"
  },
  "followerCountsByIndustry": {
    "type": "record",
    "mode": "repeated",
    "description": "Followers segmented by industry (empty in time-bound responses)"
  },
  "followerCountsByFunction": {
    "type": "record", 
    "mode": "repeated",
    "description": "Followers segmented by function (empty in time-bound responses)"
  },
  "followerCountsByStaffCountRange": {
    "type": "record",
    "mode": "repeated",
    "description": "Followers segmented by staff count range (empty in time-bound responses)"
  },
  "followerCountsByGeoCountry": {
    "type": "record",
    "mode": "repeated",
    "description": "Followers segmented by country (empty in time-bound responses)"
  },
  "followerCountsByGeo": {
    "type": "record",
    "mode": "repeated",
    "description": "Followers segmented by geographic area (empty in time-bound responses)"
  }
};
