const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

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

        // --- AUTHENTICATION MIDDLEWARE ---
        io.use(async (socket, next) => {
            const socketId = socket.id;
            console.log("\n--- [SOCKET CONNECTION ATTEMPT] ---");
            console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`);
            console.log(`🆔 Socket ID: ${socketId}`);

            try {
                // Log basic handshake info
                console.log("📨 Handshake Headers:", JSON.stringify(socket.handshake.headers, null, 2));

                // Get token from handshake (Auth or Query)
                const token = socket.handshake.auth.token || socket.handshake.query.token;
                console.log(`🎟️ Token Source: ${socket.handshake.auth.token ? "Auth Object" : (socket.handshake.query.token ? "Query Params" : "NONE")}`);

                if (!token) {
                    console.error(`❌ [${socketId}] REJECTED: Token is missing from request`);
                    return next(new Error("Authentication error: Token missing"));
                }

                // Verify token
                console.log(`⏳ [${socketId}] Verifying JWT...`);
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log(`✅ [${socketId}] JWT Verified. Decoded ID: ${decoded.id}`);

                // Get user from database
                console.log(`⌛ [${socketId}] Querying Database for user...`);
                const user = await User.findById(decoded.id).select("-password");

                if (!user) {
                    console.error(`❌ [${socketId}] REJECTED: User ID ${decoded.id} not found in DB`);
                    return next(new Error("Authentication error: User not found"));
                }

                // Attach user to socket object
                socket.user = user;
                console.log(`💎 [${socketId}] AUTHENTICATED: ${user.name} (${user.role})`);
                console.log("-----------------------------------\n");
                next();
            } catch (err) {
                console.error(`❌ [${socketId}] AUTH ERROR:`, err.message);
                if (err.name === 'TokenExpiredError') {
                    console.error("💡 Tip: Your JWT token has expired. Please login again.");
                }
                next(new Error(`Authentication error: ${err.message}`));
            }
        });

        io.on("connection", (socket) => {
            console.log(`⚡ Connected: ${socket.user.name} (${socket.user.role}) - ID: ${socket.id}`);

            // Join a private room for the user to receive personal notifications
            socket.on("join", () => {
                socket.join(`user_${socket.user._id}`);
                console.log(`👤 User joined private room: user_${socket.user._id}`);
            });

            // Join the admin notification room
            socket.on("admin:join_chats", () => {
                if (socket.user.role === "admin") {
                    socket.join("admin_chats");
                    console.log(`🛠️ Admin ${socket.user.name} joined global admin_chats room`);
                }
            });

            // --- CHAT EVENTS ---

            // 1. Join a specific chat room (usually user_id)
            socket.on("chat:join", (chatUserId) => {
                // Anyone can join a chat room if they have the ID?
                // Actually, admins can join any, users join their own
                const targetRoom = (socket.user.role === "admin") ? chatUserId : socket.user._id;
                socket.join(`chat_${targetRoom}`);
                console.log(`💬 Joined chat room: chat_${targetRoom}`);
            });

            // 2. Handle sending a message
            socket.on("chat:send", async (data) => {
                try {
                    // Enrich data with authenticated user info
                    const messagePayload = {
                        ...data,
                        user: (socket.user.role === "admin") ? data.user : socket.user._id,
                        sender: socket.user._id,
                        isAdmin: socket.user.role === "admin"
                    };

                    console.log(`✉️ Message from ${socket.user.name} to room chat_${messagePayload.user}`);
                    await require("../services/chatService").createMessage(messagePayload);
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
