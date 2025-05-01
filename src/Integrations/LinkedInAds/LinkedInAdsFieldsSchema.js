/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var LinkedInMarketingFieldsSchema = {
  "adAccounts": {
    overview: "Ad Accounts",
    description: "Advertising accounts for an organization.",
    documentation: "https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads/account-structure/create-and-manage-accounts",
    uniqueKeys: ["id"],
    fields: {
      id: { type: "long", description: "Unique internal ID representing the account." },
      name: { type: "string", description: "A label for the account." },
      currency: { type: "string", description: "Currency code (ISO)." },
      notifiedOnCampaignOptimization: { type: "boolean", description: "Indicates if the campaign contact is notified about campaign optimization opportunities." },
      notifiedOnCreativeApproval: { type: "boolean", description: "Indicates if the creative contact is notified when a creative has been reviewed and approved." },
      notifiedOnCreativeRejection: { type: "boolean", description: "Indicates if the creative contact is notified when a creative has been rejected due to content." },
      notifiedOnEndOfCampaign: { type: "boolean", description: "Indicates if the campaign contact is notified when an associated campaign has been completed." },
      notifiedOnNewFeaturesEnabled: { type: "boolean", description: "Indicates if the account owner is notified about new Campaign Manager features." },
      reference: { type: "string", description: "URN of the entity (organization or person) on whose behalf the account is advertised." },
      referenceInfo: { type: "object", description: "Information about the entity associated with the reference (organization or person). Read-only field." },
      servingStatuses: { type: "array<string>", description: "Array of serving statuses for the account (e.g., RUNNABLE, BILLING_HOLD, etc.)." },
      status: { type: "string", description: "Status of the account (ACTIVE, CANCELED, DRAFT, PENDING_DELETION, REMOVED)." },
      type: { type: "string", description: "Type of the account. BUSINESS accounts can be created through the API; ENTERPRISE accounts cannot." },
      test: { type: "boolean", description: "Flag indicating if the account is a test account. Immutable after creation." }
    }
  },
  "adCampaignGroups": {
    overview: "Campaign Groups",
    description: "Group campaigns under an account.",
    documentation: "https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads/account-structure/create-and-manage-campaign-groups",
    uniqueKeys: ["id"],
    fields: {
      account: {
        type: "string",
        description: "URN identifying the advertising account associated with the campaign group. Immutable once set."
      },
      accountInfo: {
        type: "object",
        description: "Information about the advertising account associated with the campaign group. Read-only field."
      },
      backfilled: {
        type: "boolean",
        description: "Flag that denotes whether the campaign group was created organically or to backfill existing campaigns. Read-only."
      },
      id: {
        type: "long",
        description: "Numerical identifier for the campaign group. Read-only."
      },
      name: {
        type: "string",
        description: "The name of the campaign group (max 100 characters)."
      },
      runSchedule: {
        type: "object",
        description: "Run dates for the campaign group.",
        fields: {
          start: {
            type: "long",
            description: "Inclusive (>=) start date when campaigns begin running."
          },
          end: {
            type: "long",
            description: "Exclusive (<) end date when campaigns stop. Optional for open-ended groups."
          }
        }
      },
      servingStatuses: {
        type: "array<string>",
        description: "System-controlled serving statuses (e.g., RUNNABLE, BILLING_HOLD, etc.)."
      },
      status: {
        type: "string",
        description: "Status of campaign group (ACTIVE, ARCHIVED, CANCELLED, DRAFT, PAUSED, PENDING_DELETION, REMOVED)."
      },
      totalBudget: {
        type: "object",
        description: "Total budget for the campaign group.",
        fields: {
          amount: {
            type: "float",
            description: "Maximum amount to spend over the life of the campaign group."
          },
          currencyCode: {
            type: "string",
            description: "ISO currency code for the total budget."
          }
        }
      },
      test: {
        type: "boolean",
        description: "Flag indicating if this is a test campaign group. Read-only, immutable."
      },
      allowedCampaignTypes: {
        type: "array<string>",
        description: "Allowed campaign types (TEXT_AD, SPONSORED_UPDATES, SPONSORED_INMAILS, DYNAMIC). Read-only and only for Enterprise accounts."
      },
      objectiveType: {
        type: "string",
        description: "Campaign group objective type (BRAND_AWARENESS, ENGAGEMENT, JOB_APPLICANTS, LEAD_GENERATION, WEBSITE_CONVERSIONS, WEBSITE_VISITS, VIDEO_VIEWS). Immutable."
      },
      budgetOptimization: {
        type: "object",
        description: "Budget optimization settings for the group.",
        fields: {
          bidStrategy: {
            type: "string",
            description: "Bid strategy (MAXIMUM_DELIVERY, MANUAL, COST_CAP)."
          },
          budgetOptimizationStrategy: {
            type: "string",
            description: "Budget allocation strategy (DYNAMIC)."
          }
        }
      },
      dailyBudget: {
        type: "float",
        description: "Optional daily budget shared across campaigns when using DYNAMIC strategy (API v202504+)."
      }
    }
  },
  "adCampaigns": {
    overview: "Campaigns",
    description: "Ad campaigns with scheduling, targeting, budgeting and other settings.",
    documentation: "https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads/account-structure/create-and-manage-campaigns",
    uniqueKeys: ["id"],
    fields: {
      id:                     { type: "long",    description: "Unique internal ID representing the campaign." },
      account:                { type: "string",     description: "URN identifying the advertising account associated with the campaign." },
      accountInfo:            { type: "object",  description: "Information about the associated account." },
      campaignGroup:          { type: "string",     description: "URN identifying the campaign group associated with the campaign." },
      campaignGroupInfo:      { type: "object",  description: "Information about the associated campaign group." },
      name:                   { type: "string",  description: "Name of the campaign for easier identification and reference." },
      status:                 { type: "string",  description: "Campaign status (ACTIVE, PAUSED, DRAFT, etc.)." },
      costType:               { type: "string",  description: "Cost model for billing: CPC, CPM, CPV." },
      type:                   { type: "string",  description: "Campaign type: TEXT_AD, SPONSORED_UPDATES, SPONSORED_INMAILS, DYNAMIC, etc." },
      objectiveType:          { type: "string",  description: "Campaign objective type (e.g., LEAD_GENERATION, WEBSITE_VISITS, VIDEO_VIEWS)." },
      associatedEntity:       { type: "string",     description: "URN identifying the intended beneficiary of the campaign." },
      associatedEntityInfo:   { type: "object",  description: "Information about the associated entity (organization or person)." },
      audienceExpansionEnabled: { type: "boolean", description: "Whether Audience Expansion is enabled for broader reach." },
      dailyBudget:            { type: "object",  description: "Daily budget setting.", fields: { amount: {type: "float"}, currencyCode: {type: "string"} } },
      totalBudget:            { type: "object",  description: "Total (lifetime) budget setting.", fields: { amount: {type: "float"}, currencyCode: {type: "string"} } },
      locale:                 { type: "object",  description: "Locale setting.", fields: { country: {type: "string"}, language: {type: "string"} } },
      offsiteDeliveryEnabled: { type: "boolean", description: "Whether the campaign is allowed to deliver ads outside LinkedIn (Audience Network)." },
      connectedTelevisionOnly:{ type: "boolean", description: "Flag for Connected TV-only campaigns." },
      creativeSelection:      { type: "string",  description: "Creative rotation strategy: OPTIMIZED or ROUND_ROBIN." },
      runSchedule:            { type: "object",  description: "Campaign run schedule.", fields: { start: {type: "long"}, end: {type: "long"} } },
      targetingCriteria:      { type: "object",  description: "Advanced targeting criteria structure." },
      optimizationTargetType: { type: "string",  description: "Spending optimization strategy (MAX_CLICK, MAX_CONVERSION, etc.)." },
      optimizationPreference: { type: "object",  description: "Granular optimization preferences such as frequency caps." },
      unitCost:               { type: "object",  description: "Unit cost settings.", fields: { amount: {type: "float"}, currencyCode: {type: "string"} } },
      versionTag:             { type: "string",  description: "Version tag for concurrency control." },
      servingStatuses:        { type: "array",   description: "System-controlled serving statuses (RUNNABLE, STOPPED, etc.)." },
      pacingStrategy:         { type: "string",  description: "Pacing strategy: LIFETIME or ACCELERATED." },
      format:                 { type: "string",  description: "Ad format at campaign level (e.g., SINGLE_VIDEO, CAROUSEL, etc.)." },
      test:                   { type: "boolean", description: "Flag indicating whether the campaign is a test campaign." }
    }
  },
  "creatives": {
    overview: "Creatives",
    description: "Ad creative objects.",
    documentation: "https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads/account-structure/create-and-manage-creatives",
    uniqueKeys: ["id"],
    fields: {
      account:              { type: "string",    description: "URN identifying the advertising account associated with the creative. Read-only." },
      campaign:             { type: "string",    description: "URN identifying the campaign associated with the creative." },
      content:              { type: "object", description: "Content sponsored in the creative. Can be dynamic content, text, document, or reference to a post (image, video, article, carousel)." },
      createdAt:            { type: "long",   description: "Creation time in milliseconds since epoch." },
      createdBy:            { type: "string",    description: "Person URN who developed the creative." },
      id:                   { type: "string",    description: "Unique ID for a creative (SponsoredCreativeUrn). Read-only." },
      inlineContent:        { type: "object", description: "Inline content sponsored in the creative (e.g., ugcPost for reducing API calls). Required if action is createInline." },
      intendedStatus:       { type: "string", description: "Creative user intended status: ACTIVE, PAUSED, DRAFT, ARCHIVED, CANCELED, PENDING_DELETION, REMOVED." },
      isServing:            { type: "boolean",description: "Indicates whether the creative is currently being served. Read-only." },
      lastModifiedAt:       { type: "long",   description: "Time when the creative was last modified, in milliseconds since epoch." },
      lastModifiedBy:       { type: "string",    description: "Person URN who modified the creative." },
      leadgenCallToAction:  { type: "object", description: "Call to action details for Lead Generation campaigns. Required if campaign objective is LEAD_GENERATION." },
      review:               { type: "object", description: "Creative review status. Null when creative is in DRAFT state. Read-only." },
      servingHoldReasons:   { type: "array",  description: "Reasons why the creative is not serving. Null if the creative is serving." },
      name:                 { type: "string", description: "The name of the creative that can be set by the advertiser." }
    }
  },
  "adAnalytics": {
    overview: "LinkedIn Ads Analytics Report",
    description: "Provides analytics data for LinkedIn advertising campaigns",
    documentation: "https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads-reporting/ads-reporting",
    uniqueKeys: ["dateRange", "creativeUrn", "campaignUrn"],
    fields: {
      date: {
        type: "date",
        description: "The date of the metrics"
      },
      creativeUrn: {
        type: "string",
        description: "The URN of the creative from pivotValues"
      },
      campaignUrn: {
        type: "string",
        description: "The URN of the campaign from pivotValues"
      },
      pivotValues: {
        type: "object",
        description: "The value of the pivots for a specific record returned (CREATIVE and CAMPAIGN URNs)"
      },
      dateRange: {
        type: "object",
        description: "The date range for the metrics"
      },
      adId: {
        type: "string",
        description: "The ID of the ad"
      },
      adAccount: {
        type: "string",
        description: "The ID of the ad account"
      },
      campaignId: {
        type: "string",
        description: "The ID of the campaign"
      },
      creativeId: {
        type: "string",
        description: "The ID of the creative"
      },
      actionClicks:                            { type: "long",    description: "The count of clicks on the action button of the Sponsored Messaging ad." },
      adUnitClicks:                            { type: "long",    description: "The count of clicks on the ad unit displayed alongside the Sponsored Messaging ad." },
      approximateMemberReach:                  { type: "long",    description: "Non-demographic pivots only (i.e. not MEMBER_). The estimated number of unique member accounts with at least one impression. This metric is an updated and more accurate version of legacy metric approximateUniqueImpressions. This metric is only available when the number of days in the date range is less than or equal to 92 days. This metric is fully launched in Jan 2024." },
      averageDwellTime:                       { type: "long",    description: "Average user dwell time (in seconds). It measures the duration for which more than 50% of the ad's pixels remain visible in the viewport." },
      audiencePenetration:                    { type: "double",  description: "The approximate number of unique members reached by the advertiser divided by the approximate total target audience size. The field will be null if the date range has more than 92 days. This metric only supports the CAMPAIGN pivot." },
      cardClicks:                             { type: "long",    description: "Non-demographic pivots only (i.e. not MEMBER_). The number of clicks for each card of a carousel ad." },
      cardImpressions:                        { type: "long",    description: "Non-demographic pivots only (i.e. not MEMBER_). The number of impressions shown for each card of a carousel ad." },
      clicks:                                 { type: "long",    description: "The count of chargeable clicks." },
      commentLikes:                           { type: "long",    description: "The count of likes of a comment. Sponsored Content only." },
      comments:                               { type: "long",    description: "The count of comments. Sponsored Content only." },
      companyPageClicks:                      { type: "long",    description: "The count of clicks to view the company page." },
      conversionValueInLocalCurrency:         { type: "bigdecimal", description: "Non-demographic pivots only (i.e. not MEMBER_). Value of the conversions in the account's local currency based on rules defined by the advertiser." },
      costInLocalCurrency:                    { type: "bigdecimal", description: "Cost in the account's local currency based on the pivot and timeGranularity." },
      costInUsd:                              { type: "bigdecimal", description: "Cost in USD based on the pivot and timeGranularity." },
      costPerQualifiedLead:                   { type: "bigdecimal", description: "How much money was spent per qualified lead. Ratio is costInLocalCurrency / qualifiedLeads." },
      downloadClicks:                         { type: "long",    description: "The number of times users have indicated the intent to download the media in an ad by clicking the download icon." },
      externalWebsiteConversions:             { type: "long",    description: "Total number of times users took a desired action after clicking on or seeing your ad." },
      externalWebsitePostClickConversions:    { type: "long",    description: "Total number of times users took a desired action after clicking on your ad." },
      externalWebsitePostViewConversions:     { type: "long",    description: "Total number of times users took a desired action after seeing your ad." },
      follows:                                { type: "long",    description: "The count of follows. Sponsored Content and Follower ads only." },
      fullScreenPlays:                        { type: "long",    description: "Number of times members click on the full screen button or on the video(mobile only) to go into full screen mode." },
      headlineClicks:                         { type: "long",    description: "The number of times members clicked on the headline of conversation ads." },
      headlineImpressions:                    { type: "long",    description: "The number of times members were shown the headline of conversation ads." },
      impressions:                            { type: "long",    description: "This is the count of 'impressions' for Sponsored Content and 'sends' for Sponsored Messaging." },
      landingPageClicks:                      { type: "long",    description: "The count of clicks which take the user to the creative landing page." },
      leadGenerationMailContactInfoShares:    { type: "long",    description: "The number of times users shared contact info through the One Click Lead Gen for Sponsored Messaging ads." },
      leadGenerationMailInterestedClicks:     { type: "long",    description: "The count of Sponsored Messaging ad recipients who clicked to demonstrate interest." },
      likes:                                  { type: "long",    description: "The count of likes. Sponsored Content only." },
      oneClickLeadFormOpens:                  { type: "long",    description: "The count of times users opened the lead form for a One Click Lead Gen campaign." },
      oneClickLeads:                          { type: "long",    description: "The count of leads generated through One Click Lead Gen." },
      opens:                                  { type: "long",    description: "The count of opens of Sponsored Messaging ads." },
      otherEngagements:                       { type: "long",    description: "The count of user interactions with the ad unit that do not fit into any other more specific category." },
      qualifiedLeads:                         { type: "long",    description: "The count of qualified leads shared by the advertiser." },
      reactions:                              { type: "long",    description: "The count of positive reactions on Sponsored Content which can capture, like, interest, praise, and other responses." },
      sends:                                  { type: "long",    description: "The count of sends of Sponsored Messaging ads." },
      shares:                                 { type: "long",    description: "The count of shares. Sponsored Content only." },
      subscriptionClicks:                     { type: "long",    description: "The count of clicks to subscribe to a series, such as a Newsletter." },
      talentLeads:                            { type: "long",    description: "Number of leads captured through a talent media campaign." },
      textUrlClicks:                          { type: "long",    description: "The count of clicks on any links (anchor tags) that were included in the body of the Sponsored Messaging ad." },
      totalEngagements:                       { type: "long",    description: "The count of all user interactions with the ad unit." },
      validWorkEmailLeads:                    { type: "long",    description: "The count of leads with a valid work email that does not use an established free or personal email domain." },

      // Video metrics
      videoCompletions:                       { type: "long",    description: "The count of video ads that played 97-100% of the video." },
      videoFirstQuartileCompletions:          { type: "long",    description: "The count of video ads that played through the first quartile of the video." },
      videoMidpointCompletions:               { type: "long",    description: "The count of video ads that played through the midpoint of the video." },
      videoStarts:                            { type: "long",    description: "The count of video ads that were started by users." },
      videoThirdQuartileCompletions:          { type: "long",    description: "The count of video ads that played through the third quartile of the video." },
      videoViews:                             { type: "long",    description: "A video ad playing for at least 2 continuous seconds 50% in-view, or a click on the CTA, whichever comes first." },

      // Document metrics
      documentCompletions:                    { type: "long",    description: "The number of times users reached 100% of the document's length." },
      documentFirstQuartileCompletions:       { type: "long",    description: "The number of times users reached the first quartile of the document's length." },
      documentMidpointCompletions:            { type: "long",    description: "The number of times users reached the second quartile of the document's length." },
      documentThirdQuartileCompletions:       { type: "long",    description: "The number of times users reached the third quartile of the document's length." },

      // Job metrics
      jobApplications:                        { type: "bigdecimal", description: "The number of times a member completed a job application after viewing or clicking on an ad." },
      jobApplyClicks:                         { type: "bigdecimal", description: "The number of times a member clicked on the job's apply button on an LinkedIn jobs page." },
      postClickJobApplications:               { type: "bigdecimal", description: "The number of times a member completed a job application after clicking on an ad." },
      postClickJobApplyClicks:                { type: "bigdecimal", description: "The number of times a member clicked on the job's apply button after clicking on an ad." },
      postViewJobApplications:                { type: "bigdecimal", description: "The number of times a member completed a job application after viewing an ad." },
      postViewJobApplyClicks:                 { type: "bigdecimal", description: "The number of times a member clicked on the job's apply button after viewing an ad." },

      // Event metrics
      registrations:                          { type: "bigdecimal", description: "The number of times a member has registered for an event or seminar." },
      postClickRegistrations:                 { type: "bigdecimal", description: "The number of times a member has registered for an event after clicking on an ad." },
      postViewRegistrations:                  { type: "bigdecimal", description: "The number of times a member has registered for an event after viewing an ad." },

      // Viral metrics
      viralCardClicks:                        { type: "long",    description: "The number of viralClicks for each card of a carousel ad." },
      viralCardImpressions:                   { type: "long",    description: "The number of viralImpressions shown for each card of a carousel ad." },
      viralClicks:                            { type: "long",    description: "The count of clicks on viral impressions." },
      viralCommentLikes:                      { type: "long",    description: "The count of likes on comments from viral impressions." },
      viralComments:                          { type: "long",    description: "The count of comments from viral impressions." },
      viralCompanyPageClicks:                 { type: "long",    description: "The count of clicks to view the company page from viral impressions." },
      viralDownloadClicks:                    { type: "long",    description: "The number of times users have indicated the intent to download the media in a viral ad." },
      viralExternalWebsiteConversions:        { type: "long",    description: "The count of conversions that are attributed to your ads driven by a viral event." },
      viralExternalWebsitePostClickConversions:{ type: "long",    description: "The count of post-click conversions that are attributed to your ads driven by a viral click." },
      viralExternalWebsitePostViewConversions: { type: "long",    description: "The count of post-view conversions that are attributed to your ads driven by a viral impression." },
      viralFollows:                           { type: "long",    description: "The count of follows from viral impressions." },
      viralFullScreenPlays:                   { type: "long",    description: "Number of times members click on the full screen button or on the video(mobile only) to go into full screen mode." },
      viralImpressions:                       { type: "long",    description: "The count of viral impressions for this activity." },
      viralLandingPageClicks:                 { type: "long",    description: "The count of clicks on viral impressions to take the user to the creative landing page." },
      viralLikes:                             { type: "long",    description: "The count of likes from viral impressions." },
      viralOneClickLeadFormOpens:             { type: "long",    description: "The count of times users opened the lead form for viral impressions from a Lead Gen campaign." },
      viralOneClickLeads:                     { type: "long",    description: "The count of leads generated through One Click Lead Gen from viral impressions." },
      viralOtherEngagements:                  { type: "long",    description: "The count of user interactions with viral impressions that do not fit into any other more specific category." },
      viralReactions:                         { type: "long",    description: "The count of positive reactions on viral Sponsored Content." },
      viralShares:                            { type: "long",    description: "The count of shares from viral impressions." },
      viralSubscriptionClicks:                { type: "long",    description: "The count of viral clicks to subscribe to a series, such as a Newsletter." },
      viralTotalEngagements:                  { type: "long",    description: "The count of all user interactions with a viral ad unit." },

      // Viral video metrics
      viralVideoCompletions:                  { type: "long",    description: "The count of viral video ads that played 97-100% of the video." },
      viralVideoFirstQuartileCompletions:     { type: "long",    description: "The count of viral video ads that played through the first quartile of the video." },
      viralVideoMidpointCompletions:          { type: "long",    description: "The count of viral video ads that played through the midpoint of the video." },
      viralVideoStarts:                       { type: "long",    description: "The count of viral video ads that were started by users." },
      viralVideoThirdQuartileCompletions:     { type: "long",    description: "The count of viral video ads that played through the third quartile of the video." },
      viralVideoViews:                        { type: "long",    description: "A viral video ad playing for at least 2 continuous seconds 50% in-view, or a click on the CTA, whichever comes first." },

      // Viral document metrics
      viralDocumentCompletions:               { type: "long",    description: "The number of times users reached 100% of the document's length on a viral post." },
      viralDocumentFirstQuartileCompletions:  { type: "long",    description: "The number of times users reached the first quartile of the document's length on a viral post." },
      viralDocumentMidpointCompletions:       { type: "long",    description: "The number of times users reached the second quartile of the document's length on a viral post." },
      viralDocumentThirdQuartileCompletions:  { type: "long",    description: "The number of times users reached the third quartile of the document's length on a viral post." },

      // Viral job metrics
      viralJobApplications:                   { type: "bigdecimal", description: "The number of times a member completed a job application after viewing or clicking on a viral ad." },
      viralJobApplyClicks:                    { type: "bigdecimal", description: "The number of times a member clicked on the job's apply button on a viral ad." },
      viralPostClickJobApplications:          { type: "bigdecimal", description: "The number of times a member completed a job application after clicking on a viral ad." },
      viralPostClickJobApplyClicks:           { type: "bigdecimal", description: "The number of times a member clicked on the job's apply button after clicking on a viral ad." },
      viralPostViewJobApplications:           { type: "bigdecimal", description: "The number of times a member completed a job application after viewing a viral ad." },
      viralPostViewJobApplyClicks:            { type: "bigdecimal", description: "The number of times a member clicked on the job's apply button after viewing a viral ad." },

      // Viral event metrics
      viralRegistrations:                     { type: "bigdecimal", description: "The number of times a member has registered for an event after viewing or clicking on a viral ad." },
      viralPostClickRegistrations:            { type: "bigdecimal", description: "The number of times a member has registered for an event after clicking on a viral ad." },
      viralPostViewRegistrations:             { type: "bigdecimal", description: "The number of times a member has registered for an event after viewing a viral ad." },
      debugInfo:                               { type: "object",  description: "Debug information.", fields: {
        PipelineId:                            { type: "string",  description: "Pipeline ID." },
        Source:                                { type: "string",  description: "Source information." }
      }}
    }
  }
};