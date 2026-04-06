const Message = require("../models/message");
const { getIO } = require("../config/socket");

/**
 * Chat Service
 * Handles business logic for chat messages and history
 */
class ChatService {
    /**
     * Get chat messages for a specific user
     */
    async getMessages(userId, limit = 100) {
        return await Message.find({ user: userId })
            .sort({ createdAt: 1 })
            .limit(limit);
    }

    /** 
     * Create, save and emit a new message
     */
    async createMessage(messageData) {
        const { user, sender, content, isAdmin } = messageData;

        // 1. Save to Database
        const newMessage = await Message.create({
            user,
            sender,
            content,
            isAdmin: !!isAdmin
        });

        // 2. Emit via Socket.io automatically
        try {
            const io = getIO();
            // Broadcast to the specific user chat room
            io.to(`chat_${user}`).emit("chat:message", newMessage);

            // If sender is NOT admin (it's a customer), notify all admins
            if (!isAdmin) {
                io.to("admin_chats").emit("chat:new_notification", {
                    userId: user,
                    message: content,
                    senderName: "Khách hàng" // You can populate this if needed
                });
            }
        } catch (error) {
            console.warn("⚠️ Socket not ready while sending message:", error.message);
        }

        return newMessage;
    }

    /**
     * Mark messages as read and notify via socket if needed
     */
    async markAsRead(userId, isAdmin) {
        const result = await Message.updateMany(
            { user: userId, isAdmin: !isAdmin, isRead: false },
            { isRead: true }
        );

        // Notify client to update UI (Optional)
        try {
            const io = getIO();
            io.to(`chat_${userId}`).emit("chat:read_update", { userId, isAdmin });
        } catch (err) { }

        return result;
    }

    /**
     * Get unique users who have chatted, with their last message and unread count
     * For Admin Dashboard
     */
    async getChatUsers() {
        const chatUsers = await Message.aggregate([
            // 1. Sort by newest first to get the latest message per user in group
            { $sort: { createdAt: -1 } },
            // 2. Group by user ID
            {
                $group: {
                    _id: "$user",
                    lastMessage: { $first: "$content" },
                    lastTime: { $first: "$createdAt" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$isRead", false] }, { $eq: ["$isAdmin", false] }] },
                                1, 0
                            ]
                        }
                    }
                }
            },
            // 3. Join with User model to get names
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            // 4. Flatten the userInfo array
            { $unwind: "$userInfo" },
            // 5. Clean up output
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    userName: "$userInfo.name",
                    lastMessage: 1,
                    lastTime: 1,
                    unreadCount: 1
                }
            },
            // 6. Sort final list by most recent activity
            { $sort: { lastTime: -1 } }
        ]);

        return chatUsers;
    }
}

module.exports = new ChatService();
