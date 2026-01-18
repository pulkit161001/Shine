const express = require("express");
const mongoose = require("mongoose");
const whiteboardRoutes = require("./routes/whiteboardRoutes");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB
mongoose
	.connect(process.env.MONGO_DB_KEY)
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("MongoDB Error:", err));

// Routes
app.use("/api/whiteboards", whiteboardRoutes);

// HTTP + Socket.IO
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"],
	},
});

const activeRooms = new Map();

io.on("connection", (socket) => {
	console.log("User connected:", socket.id);

	socket.on("join-room", (roomId) => {
		socket.join(roomId);
		if (activeRooms.has(roomId)) {
			socket.emit("canvas-state", activeRooms.get(roomId));
		}
	});

	socket.on("save-canvas-state", ({ roomId, imageData }) => {
		activeRooms.set(roomId, imageData);
	});

	socket.on("draw-line", (data) => {
		socket.to(data.roomId).emit("draw-line", data);
	});

	socket.on("draw-rectangle", (data) => {
		socket.to(data.roomId).emit("draw-rectangle", data);
	});

	socket.on("clear-canvas", (roomId) => {
		activeRooms.set(roomId, null);
		socket.to(roomId).emit("clear-canvas");
	});
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
	const frontendPath = path.join(__dirname, "../../frontend/dist");
	app.use(express.static(frontendPath));
	app.get("*", (req, res) => {
		res.sendFile(path.join(frontendPath, "index.html"));
	});
}

httpServer.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
