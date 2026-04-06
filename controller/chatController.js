const chatService = require("../services/chatService");

/**
 * Chat Controller
 * Handles HTTP requests for chat messages and history
 */
const chatController = {
    /**
     * Get chat messages for a specific user
     * GET /api/chat/:userId
     */
    getMessages: async (req, res) => {
        try {
            const { userId } = req.params;
            const messages = await chatService.getMessages(userId);

            res.status(200).json({
                success: true,
                count: messages.length,
                data: messages,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy lịch sử chat",
                error: error.message,
            });
        }
    },

    /**
     * Get unique users who have chatted
     * GET /api/chat/users
     * Admin Only
     */
    getChatUsers: async (req, res) => {
        try {
            const chatUsers = await chatService.getChatUsers();

            res.status(200).json({
                success: true,
                count: chatUsers.length,
                data: chatUsers,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy danh sách khách hàng chat",
                error: error.message,
            });
        }
    },
};

module.exports = chatController;
