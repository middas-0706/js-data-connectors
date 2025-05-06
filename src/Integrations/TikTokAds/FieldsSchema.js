/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var TikTokAdsFieldsSchema = {
  // Advertiser account information
  "advertiser": {
    "title": "Advertiser Account",
    "description": "TikTok Advertiser Account information",
    "uniqueKeys": ["advertiser_id"],
    "fields": {
      "advertiser_id": {
        "type": "string",
        "description": "Advertiser ID"
      },
      "advertiser_name": {
        "type": "string",
        "description": "Advertiser Name"
      },
      "company_name": {
        "type": "string",
        "description": "Company Name"
      },
      "currency": {
        "type": "string",
        "description": "Account Currency"
      },
      "status": {
        "type": "string",
        "description": "Account Status"
      },
      "timezone": {
        "type": "string",
        "description": "Account Timezone"
      },
      "create_time": {
        "type": "datetime",
        "description": "Creation Time"
      },
      "address": {
        "type": "string",
        "description": "The physical address of the advertiser"
      },
      "contacter": {
        "type": "string",
        "description": "The contact person for the advertiser"
      },
      "country": {
        "type": "string",
        "description": "The country where the advertiser is located"
      },
      "description": {
        "type": "string",
        "description": "A brief description or bio of the advertiser or company"
      },
      "email": {
        "type": "string",
        "description": "The email address associated with the advertiser"
      },
      "industry": {
        "type": "string",
        "description": "The industry or sector the advertiser operates in"
      },
      "language": {
        "type": "string",
        "description": "The preferred language of communication for the advertiser"
      },
      "phone_number": {
        "type": "string",
        "description": "The phone number of the advertiser"
      },
      "balance": {
        "type": "float",
        "description": "The current balance in the advertiser's account"
      }
    }
  },

  // Campaigns
  // secondary_status, optimization_goal, catalog_enabled, rf_campaign_type, is_search_campaign, is_smart_performance_campaign, rta_bid_enabled, 
  // special_industries, modify_time, app_promotion_type, is_advanced_dedicated_campaign, budget, is_new_structure, campaign_name, campaign_app_profile_page_state, 
  // campaign_product_source, objective, rta_product_selection_enabled, roas_bid, rta_id, campaign_type, campaign_id, deep_bid_type, operation_status, create_time, 
  // advertiser_id, disable_skan_campaign, budget_mode, postback_window_mode, bid_align_type, app_id, objective_type, budget_optimize_on, bid_type
  "campaigns": {
    "title": "Campaigns",
    "description": "TikTok Ad Campaigns",
    "uniqueKeys": ["campaign_id"],
    "fields": {
      "advertiser_id": {
        "type": "string",
        "description": "Advertiser ID"
      },
      "campaign_id": {
        "type": "string",
        "description": "Campaign ID"
      },
      "campaign_name": {
        "type": "string",
        "description": "Campaign Name"
      },
      "app_promotion_type": {
        "type": "string",
        "description": "Type of app promotion being used in the campaign"
      },
      "operation_status": {
        "type": "string",
        "description": "Operation Status"
      },
      "bid_type": {
        "type": "string",
        "description": "Type of bid strategy being used in the campaign"
      },
      "roas_bid": {
        "type": "float",
        "description": "Return on ad spend bid target"
      },
      "is_advanced_dedicated_campaign": {
        "type": "bool",
        "description": "Flag indicating if this is an advanced dedicated campaign"
      },
      "is_search_campaign": {
        "type": "bool",
        "description": "Flag indicating if the campaign is for search ads"
      },
      "rf_campaign_type": {
        "type": "string",
        "description": "Reach and frequency campaign type"
      },
      "rta_bid_enabled": {
        "type": "bool",
        "description": "Flag indicating if RTA bidding is enabled"
      },
      "secondary_status": {
        "type": "string",
        "description": "Additional status information of the campaign"
      },
      "postback_window_mode": {
        "type": "string",
        "description": "Mode for the postback window"
      },
      "disable_skan_campaign": {
        "type": "bool",
        "description": "Flag indicating if SKAdNetwork is disabled for the campaign"
      },
      "budget_optimize_on": {
        "type": "bool",
        "description": "The metric or event that the budget optimization is based on"
      },
      "budget_mode": {
        "type": "string",
        "description": "Budget Mode (BUDGET_MODE_DAY or BUDGET_MODE_TOTAL)"
      },
      "objective": {
        "type": "string",
        "description": "Campaign Objective"
      },
      "campaign_product_source": {
        "type": "string",
        "description": "Source of products for the campaign"
      },
      "optimization_goal": {
        "type": "string",
        "description": "Specific goal to be optimized for in the campaign"
      },
      "special_industries": {
        "type": "string",
        "description": "Special industries classification for the campaign"
      },
      "deep_bid_type": {
        "type": "string",
        "description": "Type of deep bidding strategy"
      },
      "rta_id": {
        "type": "string",
        "description": "Real-time advertising ID"
      },
      "rta_product_selection_enabled": {
        "type": "bool",
        "description": "Flag indicating if RTA product selection is enabled"
      },
      "budget": {
        "type": "float",
        "description": "Campaign Budget"
      },
      "is_new_structure": {
        "type": "bool",
        "description": "Flag indicating if the campaign utilizes a new campaign structure"
      },
      "is_smart_performance_campaign": {
        "type": "bool",
        "description": "Flag indicating if the campaign uses smart performance optimization"
      },
      "modify_time": {
        "type": "datetime",
        "description": "Last Modified Time"
      },
      "app_id": {
        "type": "string",
        "description": "ID of the app being promoted"
      },
      "objective_type": {
        "type": "string",
        "description": "Type of objective selected for the campaign (e.g., brand awareness, app installs)"
      },
      "campaign_type": {
        "type": "string",
        "description": "Type of campaign (e.g., awareness, conversion)"
      },
      "campaign_app_profile_page_state": {
        "type": "string",
        "description": "App profile page state for app campaigns"
      },
      "create_time": {
        "type": "datetime",
        "description": "Creation Time"
      },
      "catalog_enabled": {
        "type": "bool",
        "description": "Flag indicating if product catalog is enabled"
      },
      "bid_align_type": {
        "type": "string",
        "description": "Type of bid alignment"
      }
    }
  },

  // Ad Groups
  // optimization_goal, search_result_enabled, rf_purchased_type, schedule_end_time, is_new_structure, cpm, ios14_quota_type, catalog_id, predict_impression,
  //  delivery_mode, shopping_ads_retargeting_custom_audience_relation, budget_mode, roas_bid, video_download_disabled, click_attribution_window, phone_region_calling_code, 
  // phone_number, blocked_pangle_app_ids, conversion_id, rf_estimated_cpr, keywords, smart_audience_enabled, brand_safety_partner, create_time, carrier_ids,
  //  next_day_retention, messaging_app_type, operation_status, secondary_status, creative_material_mode, shopping_ads_type, schedule_infos, frequency, store_id, 
  // interest_category_ids, included_custom_actions, promotion_target_type, household_income, billing_event, spending_power, phone_region_code, conversion_bid_price, 
  // interest_keyword_ids, app_download_url, excluded_pangle_audience_package_ids, audience_type, zipcode_ids, conversion_window, frequency_schedule, min_android_version,
  //  deep_cpa_bid, catalog_authorized_bc_id, rf_estimated_frequency, advertiser_id, statistic_type, is_smart_performance_campaign, adgroup_name, modify_time, 
  // attribution_event_count, placement_type, inventory_filter_enabled, brand_safety_type, topview_reach_range, discount_type, schedule_start_time, gender,
  //  purchased_impression, ios14_targeting, pre_discount_budget, is_hfss, category_exclusion_ids, identity_id, messaging_app_account_id, shopping_ads_retargeting_type, 
  // pixel_id, discount_percentage, pre_discount_cpm, adgroup_id, optimization_event, bid_type, auto_targeting_enabled, search_keywords, schedule_type, 
  // audience_ids, split_test_status, vertical_sensitivity_id, message_event_set_id, deep_funnel_event_source_id, actions, languages, contextual_tag_ids,
  //  excluded_custom_actions, bid_price, bid_display_mode, app_id, targeting_expansion, skip_learning_phase, deep_funnel_optimization_status, vbo_window,
  //  scheduled_budget, device_price_ranges, deep_bid_type, purchase_intention_keyword_ids, age_groups, smart_interest_behavior_enabled, secondary_optimization_event,
  //  split_test_group_id, identity_type, campaign_name, deep_funnel_optimization_event, min_ios_version, tiktok_subplacements, app_type, product_source, isp_ids,
  //  view_attribution_window, comment_disabled, excluded_audience_ids, included_pangle_audience_package_ids, saved_audience_id, budget, promotion_type, purchased_reach, 
  // product_set_id, cpv_video_duration, location_ids, feed_type, audience_rule, share_disabled, adgroup_app_profile_page_state, identity_authorized_bc_id, dayparting,
  //  category_id, deep_funnel_event_source, campaign_id, store_authorized_bc_id, minis_id, promotion_website_type, adgroup_app_profile_page_type, network_types, 
  // discount_amount, placements, package, engaged_view_attribution_window, operating_systems, pacing, device_model_ids
  "ad_groups": {
    "title": "Ad Groups",
    "description": "TikTok Ad Groups",
    "uniqueKeys": ["adgroup_id"],
    "fields": {
      "adgroup_id": {
        "type": "string",
        "description": "Ad Group ID"
      },
      "adgroup_name": {
        "type": "string",
        "description": "Ad Group Name"
      },
      "advertiser_id": {
        "type": "string",
        "description": "Advertiser ID"
      },
      "campaign_id": {
        "type": "string",
        "description": "Campaign ID"
      },
      "campaign_name": {
        "type": "string",
        "description": "Campaign Name"
      },
      "operation_status": {
        "type": "string",
        "description": "Operation Status"
      },
      "budget": {
        "type": "float",
        "description": "Ad Group Budget"
      },
      "budget_mode": {
        "type": "string",
        "description": "Budget Mode (BUDGET_MODE_DAY or BUDGET_MODE_TOTAL)"
      },
      "bid_type": {
        "type": "string",
        "description": "Bidding Type"
      },
      "bid_price": {
        "type": "float",
        "description": "Bid Price"
      },
      "optimization_goal": {
        "type": "string",
        "description": "Optimization Goal"
      },
      "optimization_event": {
        "type": "string",
        "description": "Optimization Event"
      },
      "app_id": {
        "type": "string",
        "description": "ID of the app being promoted"
      },
      "app_type": {
        "type": "string",
        "description": "Type of app"
      },
      "audience_type": {
        "type": "string",
        "description": "Type of audience"
      },
      "audience_ids": {
        "type": "array",
        "description": "List of audience IDs"
      },
      "excluded_audience_ids": {
        "type": "array",
        "description": "List of excluded audience IDs"
      },
      "gender": {
        "type": "string",
        "description": "Target gender"
      },
      "age_groups": {
        "type": "array",
        "description": "Target age groups"
      },
      "languages": {
        "type": "array",
        "description": "Target languages"
      },
      "location_ids": {
        "type": "array",
        "description": "Target location IDs"
      },
      "interest_category_ids": {
        "type": "array",
        "description": "Interest category IDs"
      },
      "placements": {
        "type": "array",
        "description": "Ad placements"
      },
      "placement_type": {
        "type": "string",
        "description": "Type of placement"
      },
      "schedule_start_time": {
        "type": "datetime",
        "description": "Schedule Start Time"
      },
      "schedule_end_time": {
        "type": "datetime",
        "description": "Schedule End Time"
      },
      "schedule_type": {
        "type": "string",
        "description": "Type of schedule"
      },
      "frequency": {
        "type": "integer",
        "description": "Frequency cap"
      },
      "billing_event": {
        "type": "string",
        "description": "Billing Event Type"
      },
      "conversion_id": {
        "type": "string",
        "description": "Conversion ID"
      },
      "conversion_bid_price": {
        "type": "float",
        "description": "Conversion Bid Price"
      },
      "conversion_window": {
        "type": "integer",
        "description": "Conversion Window"
      },
      "click_attribution_window": {
        "type": "integer",
        "description": "Click Attribution Window"
      },
      "view_attribution_window": {
        "type": "integer",
        "description": "View Attribution Window"
      },
      "is_smart_performance_campaign": {
        "type": "bool",
        "description": "Flag indicating if the ad group uses smart performance optimization"
      },
      "is_new_structure": {
        "type": "bool",
        "description": "Flag indicating if the ad group utilizes a new structure"
      },
      "auto_targeting_enabled": {
        "type": "bool",
        "description": "Flag indicating if auto targeting is enabled"
      },
      "targeting_expansion": {
        "type": "object",
        "description": "Targeting expansion settings"
      },
      "device_price_ranges": {
        "type": "array",
        "description": "Target device price ranges"
      },
      "device_model_ids": {
        "type": "array",
        "description": "Target device model IDs"
      },
      "operating_systems": {
        "type": "array",
        "description": "Target operating systems"
      },
      "network_types": {
        "type": "array",
        "description": "Target network types"
      },
      "carrier_ids": {
        "type": "array",
        "description": "Target carrier IDs"
      },
      "create_time": {
        "type": "datetime",
        "description": "Creation Time"
      },
      "modify_time": {
        "type": "datetime",
        "description": "Last Modified Time"
      }
    }
  },

  // Ads
  // Ad object fields
  // These are the top 50 most important fields for TikTok Ads
  // Basic ad information
  // vertical_video_strategy, disclaimer_clickable_texts, vehicle_ids, call_to_action, campaign_id, 
  // tracking_app_id, operation_status, disclaimer_type, is_new_structure, deeplink_type, end_card_cta, 
  // catalog_id, tracking_pixel_id, profile_image_url, image_mode, shopping_ads_video_package_id, 
  // dark_post_status, aigc_disclosure_type, adgroup_name, item_stitch_status, image_ids, landing_page_urls, 
  // viewability_postbid_partner, tracking_message_event_set_id, call_to_action_id, brand_safety_postbid_partner, 
  // video_view_tracking_url, adgroup_id, tracking_offline_event_set_ids, showcase_products, utm_params, deeplink_format_type, 
  // identity_id, campaign_name, dynamic_format, phone_number, ad_id, item_group_ids, carousel_image_index, viewability_vast_url, 
  // branded_content_disabled, product_display_field_list, disclaimer_text, identity_authorized_bc_id, flight_ids, avatar_icon_web_uri,
  //  ad_text, create_time, music_id, product_specific_type, deeplink_utm_params, media_title_ids, ad_format, creative_authorized, 
  // optimization_event, creative_type, destination_ids, tiktok_item_id, impression_tracking_url, sku_ids, auto_message_id, dynamic_destination,
  //  ad_ref_pixel_id, deeplink, fallback_type, brand_safety_vast_url, advertiser_id, auto_disclaimer_types, shopping_ads_fallback_type, domain, page_id, 
  // vast_moat_enabled, phone_region_calling_code, product_set_id, item_duet_status, carousel_image_labels, cpp_url, hotel_ids, card_id, 
  // shopping_ads_deeplink_type, secondary_status, interactive_motion_id, phone_region_code, ad_texts, identity_type, display_name, app_name,
  //  home_listing_ids, promotional_music_disabled, modify_time, landing_page_url, tiktok_page_category, playable_url, click_tracking_url, video_id, ad_name, is_aco
  "ads": {
    "title": "Ads",
    "description": "TikTok Ads",
    "uniqueKeys": ["ad_id"],
    "fields": {
      "ad_id": {
        "type": "string",
        "description": "Ad ID"
      },
      "ad_name": {
        "type": "string",
        "description": "Ad Name"
      },
      "advertiser_id": {
        "type": "string",
        "description": "Advertiser ID"
      },
      "campaign_id": {
        "type": "string",
        "description": "Campaign ID"
      },
      "campaign_name": {
        "type": "string",
        "description": "Campaign Name"
      },
      "adgroup_id": {
        "type": "string",
        "description": "Ad Group ID"
      },
      "adgroup_name": {
        "type": "string",
        "description": "Ad Group Name"
      },
      "operation_status": {
        "type": "string",
        "description": "Operation Status"
      },
      "secondary_status": {
        "type": "string",
        "description": "Secondary Status"
      },
      "create_time": {
        "type": "datetime",
        "description": "Creation Time"
      },
      "modify_time": {
        "type": "datetime",
        "description": "Last Modified Time"
      },
      // Creative elements
      "ad_text": {
        "type": "string",
        "description": "Ad Text/Caption"
      },
      "ad_texts": {
        "type": "array",
        "description": "Multiple Ad Text Variations"
      },
      "call_to_action": {
        "type": "string",
        "description": "Call To Action Text"
      },
      "call_to_action_id": {
        "type": "string",
        "description": "Call To Action ID"
      },
      "image_ids": {
        "type": "array",
        "description": "Image IDs Used in the Ad"
      },
      "video_id": {
        "type": "string",
        "description": "Video ID Used in the Ad"
      },
      "image_mode": {
        "type": "string",
        "description": "Image Display Mode"
      },
      "creative_type": {
        "type": "string",
        "description": "Type of Creative (video, image, carousel, etc.)"
      },
      "ad_format": {
        "type": "string",
        "description": "Format of the Ad"
      },
      // Destination and tracking
      "landing_page_url": {
        "type": "string",
        "description": "Landing Page URL"
      },
      "landing_page_urls": {
        "type": "array",
        "description": "Multiple Landing Page URLs"
      },
      "deeplink": {
        "type": "string",
        "description": "Deep Link URL"
      },
      "deeplink_type": {
        "type": "string",
        "description": "Type of Deep Link"
      },
      "tracking_pixel_id": {
        "type": "string",
        "description": "Pixel ID for Tracking"
      },
      "impression_tracking_url": {
        "type": "string",
        "description": "URL for Impression Tracking"
      },
      "click_tracking_url": {
        "type": "string",
        "description": "URL for Click Tracking"
      },
      "video_view_tracking_url": {
        "type": "string",
        "description": "URL for Video View Tracking"
      },
      // Advanced features
      "is_new_structure": {
        "type": "bool",
        "description": "Flag indicating if the ad utilizes a new structure"
      },
      "is_aco": {
        "type": "bool",
        "description": "Flag indicating if Automated Creative Optimization is enabled"
      },
      "optimization_event": {
        "type": "string",
        "description": "Event being optimized for"
      },
      "catalog_id": {
        "type": "string",
        "description": "Product Catalog ID"
      },
      "product_set_id": {
        "type": "string",
        "description": "Product Set ID"
      },
      "sku_ids": {
        "type": "array",
        "description": "SKU IDs for Products"
      },
      "domain": {
        "type": "string",
        "description": "Domain for the Ad"
      },
      "display_name": {
        "type": "string",
        "description": "Display Name shown in the Ad"
      },
      "profile_image_url": {
        "type": "string",
        "description": "URL for Profile Image"
      },
      "app_name": {
        "type": "string",
        "description": "Name of the App being promoted"
      },
      "tracking_app_id": {
        "type": "string",
        "description": "App ID for Tracking"
      },
      "identity_id": {
        "type": "string",
        "description": "Identity ID"
      },
      "identity_type": {
        "type": "string",
        "description": "Type of Identity"
      },
      "page_id": {
        "type": "string",
        "description": "TikTok Page ID"
      },
      "tiktok_item_id": {
        "type": "string",
        "description": "TikTok Item ID"
      },
      "disclaimer_type": {
        "type": "string",
        "description": "Type of Disclaimer"
      },
      "disclaimer_text": {
        "type": "string",
        "description": "Disclaimer Text"
      },
      "utm_params": {
        "type": "object",
        "description": "UTM Parameters"
      }
    }
  },

  // Ad Insights (time series data)
  "ad_insights": {
    "title": "Ad Insights",
    "description": "TikTok Ad Insights Metrics",
    "uniqueKeys": ["ad_id", "stat_time_day"],
    "fields": {
      "ad_id": {
        "type": "string",
        "description": "Ad ID"
      },
      "advertiser_id": {
        "type": "string",
        "description": "Advertiser ID"
      },
      "campaign_id": {
        "type": "string",
        "description": "Campaign ID"
      },
      "adgroup_id": {
        "type": "string",
        "description": "Ad Group ID"
      },
      "stat_time_day": {
        "type": "datetime",
        "description": "Statistics Date"
      },
      "date_start": {
        "type": "datetime",
        "description": "Start Date"
      },
      "date_end": {
        "type": "datetime",
        "description": "End Date"
      },
      "impressions": {
        "type": "int32",
        "description": "Impressions"
      },
      "clicks": {
        "type": "int32",
        "description": "Clicks"
      },
      "cost": {
        "type": "float",
        "description": "Cost"
      },
      "ctr": {
        "type": "float",
        "description": "Click-Through Rate"
      },
      "conversion": {
        "type": "int32",
        "description": "Conversions"
      },
      "cost_per_conversion": {
        "type": "float",
        "description": "Cost Per Conversion"
      },
      "conversion_rate": {
        "type": "float",
        "description": "Conversion Rate"
      },
      "reach": {
        "type": "int32",
        "description": "Reach"
      },
      "engagement": {
        "type": "int32",
        "description": "Engagement"
      },
      "video_views": {
        "type": "int32",
        "description": "Video Views"
      },
      "video_watched_2s": {
        "type": "int32",
        "description": "2s Video Views"
      },
      "video_watched_6s": {
        "type": "int32",
        "description": "6s Video Views"
      },
      "video_completion": {
        "type": "int32",
        "description": "Video Completion"
      },
      "spend": {
        "type": "float",
        "description": "Spend"
      },
      "cpc": {
        "type": "float",
        "description": "Cost per click"
      },
      "cpm": {
        "type": "float",
        "description": "Cost per thousand impressions"
      },
      "frequency": {
        "type": "float",
        "description": "Frequency of occurrence"
      },
      "video_play_actions": {
        "type": "int32",
        "description": "Number of video plays"
      },
      "video_views_p25": {
        "type": "int32",
        "description": "Video views at 25% completion"
      },
      "video_views_p50": {
        "type": "int32",
        "description": "Video views at 50% completion"
      },
      "video_views_p75": {
        "type": "int32",
        "description": "Video views at 75% completion"
      },
      "video_views_p100": {
        "type": "int32",
        "description": "Video views at 100% completion"
      },
      "profile_visits": {
        "type": "int32",
        "description": "Profile visits"
      },
      "likes": {
        "type": "int32",
        "description": "Likes count"
      },
      "comments": {
        "type": "int32",
        "description": "Comments count"
      },
      "shares": {
        "type": "int32",
        "description": "Shares count"
      },
      "follows": {
        "type": "int32",
        "description": "Follows count"
      },
      "real_time_conversion": {
        "type": "int32",
        "description": "Real-time conversions"
      },
      "real_time_cost_per_conversion": {
        "type": "float",
        "description": "Cost per conversion in real-time"
      },
      "real_time_conversion_rate": {
        "type": "float",
        "description": "Real-time conversion rate"
      },
      "result": {
        "type": "int32",
        "description": "Number of results"
      },
      "cost_per_result": {
        "type": "float",
        "description": "Cost per result"
      }
    }
  },

  "audiences": {
    "title": "Audiences",
    "description": "TikTok Custom Audiences",
    "uniqueKeys": ["audience_id"],
    "fields": {
      "audience_id": {
        "type": "string",
        "description": "Unique identifier for the audience"
      },
      "advertiser_id": {
        "type": "string",
        "description": "Advertiser ID"
      },
      "name": {
        "type": "string",
        "description": "Name of the audience"
      },
      "audience_type": {
        "type": "string",
        "description": "Type of audience (e.g., demographic, interest-based)"
      },
      "cover_num": {
        "type": "int32",
        "description": "Number of audience members covered"
      },
      "create_time": {
        "type": "datetime",
        "description": "Timestamp indicating when the audience was created"
      },
      "is_valid": {
        "type": "bool",
        "description": "Flag indicating if the audience data is valid"
      },
      "is_expiring": {
        "type": "bool",
        "description": "Flag indicating if the audience data is expiring soon"
      },
      "expired_time": {
        "type": "datetime",
        "description": "Timestamp indicating when the audience data expires"
      }
    }
  }
}; 