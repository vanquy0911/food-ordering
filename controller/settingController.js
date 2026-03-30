const SettingLocation = require("../models/settinglocation");

/**
 * Get shop settings
 * @route GET /api/settings
 * @access Public (or Admin, depending on usage)
 */
exports.getSettings = async (req, res) => {
    try {
        let settings = await SettingLocation.findOne({ isActive: true });
        
        // If no settings found, return default empty object or initial one
        if (!settings) {
            settings = await SettingLocation.create({
                title: "Default Store Configuration",
                isActive: true
            });
        }

        res.status(200).json({
            success: true,
            data: settings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Update shop settings
 * @route PUT /api/settings
 * @access Private (Admin only)
 */
exports.updateSettings = async (req, res) => {
    try {
        let settings = await SettingLocation.findOne({ isActive: true });

        if (!settings) {
            settings = new SettingLocation(req.body);
        } else {
            // Update fields manually to ensure structure
            settings.shopAddress = req.body.shopAddress || settings.shopAddress;
            settings.shopLocation = req.body.shopLocation || settings.shopLocation;
            settings.shippingConfig = req.body.shippingConfig || settings.shippingConfig;
            settings.title = req.body.title || settings.title;
        }

        await settings.save();

        res.status(200).json({
            success: true,
            message: "Settings updated successfully",
            data: settings,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
