var FacebookMarketingFieldsSchema = {
    "ad-account-user": {
        "overview": "Ad Account User",
        "description": "Someone on Facebook who creates ads. Each ad user can have a role on several ad accounts",
        "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-account-user",
        "fields": adAccountUserFields
    },
    "ad-account": {
        "overview": "Ad Account",
        "description": "Represents the business entity managing ads.",
        "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-account/",
        "fields": adAccountFields,
        "edges": {
            "adcreatives": {
                "description": "Defines your ad's appearance and content.",
                "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-account/adcreatives"
            },
            "adimages": {
                "description": "Library of images to use in ad creatives. Can be uploaded and managed independently.",
                "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-account/adimages"
            },
            "ads": {
                "description": "Data for an ad, such as creative elements and measurement information.",
                "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-account/ads"
            },
            "adsets": {
                "description": "Contain all ads that share the same budget, schedule, bid, and targeting.",
                "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-account/adsets"
            },
            "advideos": {
                "description": "Library of videos for use in ad creatives. Can be uploaded and managed independently.",
                "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-account/advideos"
            },
            "campaigns": {
                "description": "Define your campaigns' objective and contain one or more ad sets.",
                "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-account/campaigns"
            },
            "customaudiences": {
                "description": "The custom audiences owned by/shared with this ad account.",
                "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-account/customaudiences"
            },
            "insights": {
                "description": "Interface for insights. De-dupes results across child objects, provides sorting, and async reports.",
                "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-account/insights",
                "fields" : adAccountInsightsFields
            }
        }
    },
    "ad-group": {
        "overview": "Ad",
        "description": "Contains information for an ad, such as creative elements and measurement information.",
        "documentation": "https://developers.facebook.com/docs/marketing-api/reference/adgroup/",
        "fields": adGroupFields,
        "edges": {
            "adcreatives": {
               "description": "Defines your ad's appearance and content.",
               "documentation": "https://developers.facebook.com/docs/marketing-api/reference/adgroup/adcreatives"
            },
            "insights": {
               "description": "Insights on your advertising performance.",
               "documentation": "https://developers.facebook.com/docs/marketing-api/reference/adgroup/insights",
               "fields": adGroupInsightsFields
            },
            "leads": {
               "description": "Any leads associated with a Lead Ad.",
               "documentation": "https://developers.facebook.com/docs/marketing-api/reference/adgroup/leads"
            },
            "previews": {
               "description": "Generate ad previews from an existing ad.",
               "documentation": "https://developers.facebook.com/docs/marketing-api/reference/adgroup/previews"
            }
        }
    },
    "ad-creative": {
        "overview": "Ad Creative",
        "description": "Format for your image, carousel, collection, or video ad.",
        "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-creative/",
        "fields": adCreativeFields,
        "edges": {
            "previews": {
                "description": "Generate ad previews from the existing ad creative object.",
                "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-creative/previews"
            }
        }
    },
    "ad-campaign": {
        "overview": "Ad Set",
        "description": "Contains all ads that share the same budget, schedule, bid, and targeting.",
        "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-campaign/",
        "fields": adCampaignFields,
        "edges": {
            "activities": {
                "description": "Log of actions taken on the ad set.",
                "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-campaign/activities"
              },
              "adcreatives": {
                "description": "Defines your ad's content and appearance.",
                "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-campaign/adcreatives"
              },
              "ads": {
                "description": "Data necessary for an ad, such as creative elements and measurement information.",
                "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-campagin/ads"
              },
              "insights": {
                "description": "Insights on your advertising performance.",
                "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-campaign/insights"
              }
        },
    },
    "ad-campaign-group": {
        "overview": "Ad Campaign",
        "description": "Defines your ad campaigns' objective. Contains one or more ad set.",
        "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/",
        "fields": AdCampaignGroupFields,
        "edges": {
            "ads": {
               "description": "Data necessary for an ad, such as creative elements and measurement information.",
               "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/ads"
            },
            "adsets": {
               "description": "Contain all ads that share the same budget, schedule, bid, and targeting.",
               "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/adsets"
            },
            "insights": {
               "description": "Insights on your advertising performance.",
               "documentation": "https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/insights",
               "fields" : adCampaignInsightsFields
            }
        }
    },
    "insights": {
        "overview": "Insights",
        "description": "Provides a single, consistent interface to retrieve ad statistics.",
        "documentation": "https://developers.facebook.com/docs/marketing-api/insights/breakdowns",
        "fields": adInsightsBreakDownFields
    }
}