const mongoose = require("mongoose");

const whiteboardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  data: { type: String, required: true }, // Base64-encoded image or JSON representation
  createdAt: { type: Date, default: Date.now },
});

const Whiteboard = mongoose.model("Whiteboard", whiteboardSchema);

module.exports = Whiteboard;
