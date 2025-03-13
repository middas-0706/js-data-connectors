To receive data from the Criteo source, please make a copy of the file ["Criteo. Template"](https://docs.google.com/spreadsheets/d/1g_-q8sR5PsbB4-MDK9DYOn-mIXjHcR10VaYhy66kdBk/edit?usp=sharing) (*File -> Make a copy*). 

Fill in the required information:
- Start date
- Account ID
- Standard source
- Standard Medium

Data import begins on the selected **start date**. Note that selecting a long date range may prevent data from downloading due to large data volume.

![Criteo Start Date](/src/Integrations/Criteo/res/fb_startdate.png)

**Account ID** can be found on the Account Overview page in Meta AdsManager. 

![Criteo Account ID](/src/Integrations/Criteo/res/fb_accountid.png)

Copy and paste the ID: 

![Criteo ID](/src/Integrations/Criteo/res/fb_pasteid.png)

Some fields are already pre-filled. The **Fields** tab allows you to select additional fields to include by checking the corresponding checkboxes. 

![Criteo Fileds](/src/Integrations/Criteo/res/fb_fields.png)

Then, press *OWOX -> Manage credentials*. 

![Criteo Credentials](/src/Integrations/Criteo/res/fb_credentials.png)

Add your Access Token received by this tutorial: [**How to obtain the access token for the Facebook connector**](https://github.com/OWOX/js-data-connectors/blob/main/src/Integrations/Criteo/CREDENTIALS.md)

![Criteo Token](/src/Integrations/Criteo/res/fb_token.png)

Press OK and then, press *OWOX -> Import New Data*.

![Criteo Import Data](/src/Integrations/Criteo/res/fb_import.png)

The import process is complete when the Log data displays **"Import is finished"**. Your data will be available in new tabs labeled with the corresponding data point names (e.g., *ad-account*, *ad-campaign*).

![Criteo Finished](/src/Integrations/Criteo/res/fb_success.png)

To include more data, select the relevant checkboxes on the Fields tab, then click OWOX > Import New Data.