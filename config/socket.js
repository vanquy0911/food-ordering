const chatService = require("../services/chatService");
const socketIO = require("socket.io");

let io;

module.exports = {
    /**
     * Initializes Socket.io with the given HTTP server
     * @param {Object} httpServer - Node.js HTTP server instance
     * @returns {Object} - The initialized socket.io instance
     */
    init: (httpServer) => {
        io = socketIO(httpServer, {
            cors: {
                origin: "*", // Adjust this in production for security
                methods: ["GET", "POST", "PUT", "DELETE"],
            },
        });

        io.on("connection", (socket) => {
            console.log("⚡ New client connected:", socket.id);

            // Join a private room for the user to receive personal notifications
            socket.on("join", (userId) => {
                if (userId) {
                    socket.join(`user_${userId}`);
                    console.log(`👤 User joined private room: user_${userId}`);
                }
            });

            // --- CHAT EVENTS ---

            // 1. Join a specific chat room (usually user_id)
            socket.on("chat:join", (chatUserId) => {
                if (chatUserId) {
                    socket.join(`chat_${chatUserId}`);
                    console.log(`💬 Joined chat room: chat_${chatUserId}`);
                }
            });

            // 2. Handle sending a message
            socket.on("chat:send", async (data) => {
                try {
                    // ChatService now handles both Creating and Emitting the message
                    await chatService.createMessage(data);
                } catch (error) {
                    console.error("❌ Chat error:", error.message);
                    socket.emit("chat:error", { message: "Failed to send message" });
                }
            });

            socket.on("disconnect", () => {
                console.log("🔥 Client disconnected:", socket.id);
            });
        });

        return io;
    },

    /**
     * Returns the initialized socket.io instance
     */
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    },
};
