To receive data from the Reddit Ads source, please make a copy of the file ["Reddit. Template"](https://docs.google.com/spreadsheets/d/1QCzmcLhcGcXQ8PxU-1rfJ2kQ9wiDh-_Hf8r6EWhVTCQ/copy). 

Fill in the required information:
- Start date
- Account IDs
- Fields

Data import begins on the selected **start date**. Note that selecting a long date range may prevent data from downloading due to large data volume.

![Reddit Start Date](/src/Integrations/RedditAds/res/reddit_startdate.png)

**Account ID** can be found on the homepage of your Reddit Advertising account. 

![Reddit Account ID](/src/Integrations/RedditAds/res/reddit_accountid.png)

Copy and paste the ID: 

![Account ID](/src/Integrations/RedditAds/res/reddit_pasteid.png)

Some fields are already pre-filled. The **Fields** tab allows you to select additional fields to include by checking the corresponding checkboxes. 

![Reddit Fileds](/src/Integrations/RedditAds/res/reddit_fields.png)

Then, press *OWOX -> Manage credentials*. 

![Reddit Credentials](/src/Integrations/RedditAds/res/reddit_credentials.png)

Add your credentials received by this tutorial: [**How to obtain the credentials for the Reddit Ads connector**](https://github.com/OWOX/js-data-connectors/blob/main/src/Integrations/RedditAds/CREDENTIALS.md).

![Reddit Token](/src/Integrations/RedditAds/res/reddit_tokens.png)

Press 'Check and Save' and then, press *OWOX -> Import New Data*.

![Reddit Import Data](/src/Integrations/RedditAds/res/reddit_import.png)

The import process is complete when the Log data displays **"Import is finished"**. Your data will be available in new tabs labeled with the corresponding data point names (e.g., *ad-account*, *ad-campaign*).

![Reddit Finished](/src/Integrations/RedditAds/res/reddit_success.png)

To include more data, select the relevant checkboxes on the Fields tab, then click OWOX > Import New Data. 
**Important!** If you want to change data range, first clear all previous data in the Status fields, and then change the Start Date / End Date, and click OWOX > Import New Data:

![Reddit Clear](/src/Integrations/RedditAds/res/reddit_clear.png)

