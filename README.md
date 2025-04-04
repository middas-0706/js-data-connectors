![JavaScript Open-Source Connectors](res/main-cover.png)
## Why
We believe that everyone should have easy access to data. That’s why we are introducing open-source data connectors to empower every business to become data owners by importing their data into Spreadsheets or data warehouses.
Although there are many great SaaS and open-source products available, we see the need for a solution that offers a free cloud version and doesn’t require data engineers for maintenance.

## What
With just a few clicks and no coding, you can easily set up automated data imports into your spreadsheets and earn the following benefits:
- **Security-Friendly**: Being open-source, no credentials need to be shared with third-party products.
- **Unlimited Customization**: Scheduling and data schemas can be adjusted at any time.
- **Streamlined Tech Stack**: Connectors can be developed and customized via Apps Script. Google Sheets is more than enough to run your own data pipelines
- **Free**: Distributed under the ELv2 license, it allows free use for internal organizational services or providing paid services to clients, as long as it is not used to build a competing product.
- **Serverless**: neither Google Cloud nor computing resources are required to run it

#### Data Sources
| Name | Status | Links
| ------------ | ------ | ----
| Facebook Ads | 🟢 Public  | [Google Drive](https://drive.google.com/drive/u/0/folders/1_x556pta5lKtKbTltIrPEDkNqAn78jM4), [Source Code](https://github.com/OWOX/js-data-connectors/tree/main/src/Integrations/FacebookMarketing)
| Open Exchange Rates | 🟢 Public | [Google Drive](https://drive.google.com/drive/u/0/folders/1akutchS-Txr5PwToMzHrikTXd_GTs-84), [Source Code](https://github.com/OWOX/js-data-connectors/tree/main/src/Integrations/OpenExchangeRates)
| Bank of Canada | 🟢 Public  | [Google Drive](https://drive.google.com/drive/u/0/folders/18c9OHHmdZs-evtU1bWd6pIqdXjnANRmv), [Source Code](https://github.com/OWOX/js-data-connectors/tree/main/src/Integrations/BankOfCanada)
| Criteo Ads | 🟡 In Development | [Branch](https://github.com/OWOX/js-data-connectors/tree/criteo-alpha), [Discussion](https://github.com/OWOX/js-data-connectors/discussions/54)
| Bing Ads | 🟡 In Development | [Discussion](https://github.com/OWOX/js-data-connectors/tree/bing-ads-attempt-1)
| Reddit Ads | 🟡 In Development | [Branch](https://github.com/OWOX/js-data-connectors/tree/reddit_connector_v0.1), [Discussion](https://github.com/OWOX/js-data-connectors/discussions/2)
| Hotline | ⚪️ In Discussion | [Discussion](https://github.com/OWOX/js-data-connectors/discussions/55)
| LinkedIn Ads | ⚪️ In Discussion | [Discussion](https://github.com/OWOX/js-data-connectors/discussions/59)
| Twitter Ads | ⚪️ In Discussion | [Discussion](https://github.com/OWOX/js-data-connectors/discussions/60)
| Shopify Ads | ⚪️ In Discussion | [Discussion](https://github.com/OWOX/js-data-connectors/discussions/63)
| TikTok Ads | ⚪️ In Discussion | [Discussion](https://github.com/OWOX/js-data-connectors/discussions/62)
| Google Business Profile | ⚪️ In Discussion | [Discussion](https://github.com/OWOX/js-data-connectors/discussions/61)

#### Data Storages
| Name | Status | Links
| ------------ | ------ | ----
| Google Sheets | 🟢 Public  | [Issues](https://github.com/OWOX/js-data-connectors/issues?q=is%3Aissue%20state%3Aopen%20label%3AGoogleSheets)
| Google BigQuery | 🟡 In Development | [Branch](https://github.com/OWOX/js-data-connectors/tree/65-add-support-of-google-bigquery-as-data-storage), [Discussion](https://github.com/OWOX/js-data-connectors/discussions/39)

If you find an integration missing, you can share your use case and request it [here](https://github.com/OWOX/js-data-connectors/discussions)

## How
**To create your data import**, make a copy of the Google Sheets template for [existing integrations](https://github.com/OWOX/js-data-connectors/tree/main/src/Integrations). If you experience any issues, feel free to post them [here](https://github.com/OWOX/js-data-connectors/issues).

**To contribute to existing integrations or create a new one**, please visit the [contributors' guide](https://github.com/OWOX/js-data-connectors/blob/main/CONTRIBUTING.md). All you need to get started are basic knowledge of Apps Script and a GitHub login. No software installation is required on your computer.

**To become a part of the Core team**, please start by submitting a pull request to the Core part of the product. Understanding TypeScript, Git, and software development is required.

**To get support**, please [visit Q&A](https://github.com/OWOX/js-data-connectors/discussions/categories/q-a) first. If you want to report a bug, please [open an issue](https://github.com/OWOX/js-data-connectors/issues).
