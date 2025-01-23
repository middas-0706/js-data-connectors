var OpenHolidaysPipeline = class OpenHolidaysPipeline extends AbstractPipeline {
    startImportProcess() {
        this.config.logMessage("🔄 Starting import process for public holidays");
        const data = this.connector.fetchData();

        if (!data.length) {
            this.config.logMessage("ℹ️ No new holidays fetched during this import.");
            return;
        }

        this.storage.saveData(data);
        this.config.logMessage(`✅ ${data.length} holidays successfully imported.`);
    }
};