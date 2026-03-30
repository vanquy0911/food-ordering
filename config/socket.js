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
                    console.log(`👤 User ${userId} joined their personal room`);
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
     * @returns {Object} - The socket.io instance
     * @throws {Error} - If socket.io is not initialized
     */
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    },
};
