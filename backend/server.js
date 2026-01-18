const express = require("express");
const mongoose = require("mongoose");
const whiteboardRoutes = require("./routes/whiteboardRoutes");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http"); // Required for Socket.IO
const { Server } = require("socket.io");
const path = require("path");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
// ✅ Correct ESM dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose
	.connect(process.env.MONGO_DB_KEY)
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("MongoDB Error Occured ", err));

//Routes
app.use("/api/whiteboards", whiteboardRoutes);

// Create HTTP server and bind Socket.IO
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:5173", // Frontend origin
		methods: ["GET", "POST"],
	},
});

// Store active rooms and their drawing data
const activeRooms = new Map();

io.on("connection", (socket) => {
	console.log("A user connected", socket.id);

	// Join a whiteboard room
	socket.on("join-room", (roomId) => {
		socket.join(roomId);
		console.log(`User ${socket.id} joined room ${roomId}`);

		if (activeRooms.has(roomId)) {
			socket.emit("canvas-state", activeRooms.get(roomId));
		}
	});

	// Save canvas state
	socket.on("save-canvas-state", ({ roomId, imageData }) => {
		activeRooms.set(roomId, imageData);
	});

	// Handle drawing events
	socket.on("draw-line", ({ roomId, start, end, color, size }) => {
		socket.to(roomId).emit("draw-line", { start, end, color, size });
	});

	// Handle drawing events
	socket.on(
		"draw-rectangle",
		({ roomId, start, width, height, color, size }) => {
			socket
				.to(roomId)
				.emit("draw-rectangle", { start, width, height, color, size });
		}
	);

	// Handle canvas clear
	socket.on("clear-canvas", (roomId) => {
		activeRooms.set(roomId, null);
		socket.to(roomId).emit("clear-canvas");
	});

	socket.on("disconnect", () => {
		console.log("User disconnected:", socket.id);
	});
});

if (process.env.NODE_ENV === "production") {
	const frontendPath = path.join(__dirname, "../../frontend/dist");

	app.use(express.static(frontendPath));

	app.use("*", (req, res) => {
		res.sendFile(path.join(frontendPath, "index.html"));
	});
}

httpServer.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
