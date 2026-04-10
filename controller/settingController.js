const settingService = require("../services/settingService");

/**
 * Get shop settings
 * @route GET /api/settings
 * @access Public
 */
exports.getSettings = async (req, res) => {
    try {
        const settings = await settingService.getSettings();

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
        const settings = await settingService.updateSettings(req.body);

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
