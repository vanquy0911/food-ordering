const SettingLocation = require("../models/settinglocation");

/**
 * Setting Service
 * Handles business logic for global shop settings and location
 */
class SettingService {
    /**
     * Get or create active shop settings
     * @returns {Object} - Shop settings
     */
    async getSettings() {
        let settings = await SettingLocation.findOne({ isActive: true });
        
        if (!settings) {
            settings = await SettingLocation.create({
                title: "Default Store Configuration",
                isActive: true
            });
        }
        
        return settings;
    }

    /**
     * Update shop settings
     * @param {Object} data - Updated settings data
     * @returns {Object} - Updated shop settings
     */
    async updateSettings(data) {
        let settings = await SettingLocation.findOne({ isActive: true });

        if (!settings) {
            settings = new SettingLocation(data);
        } else {
            // Update fields manually to ensure structure
            settings.shopAddress = data.shopAddress || settings.shopAddress;
            settings.shopLocation = data.shopLocation || settings.shopLocation;
            settings.shippingConfig = data.shippingConfig || settings.shippingConfig;
            settings.title = data.title || settings.title;
        }

        await settings.save();
        return settings;
    }
}

module.exports = new SettingService();
