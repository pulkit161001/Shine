import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteWhiteboard,
  fetchWhiteboard,
  saveWhiteboard,
  updateWhiteboard,
  socket,
} from "../utils/api";
import { Eraser, Save, Pencil, Square } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Whiteboard = ({ whiteboardId }) => {
  const [penColor, setPenColor] = useState("#000000");
  const [penSize, setPenSize] = useState(5);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const navigate = useNavigate();
  const lastPoint = useRef(null);
  const [tool, setTool] = useState("pen");
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const baseImageRef = useRef(null); //to avoid creating multiple shape on canvas when cursor moves

  //
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.strokeStyle = penColor;
    context.lineWidth = penSize;
    contextRef.current = context;

    if (whiteboardId) {
      socket.emit("join-room", whiteboardId);
      loadWhiteboard();
    }

    socket.on("canvas-state", (imageData) => {
      if (imageData) {
        const img = new Image();
        img.src = imageData;
        img.onload = () => {
          const context = contextRef.current;
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0);
        };
      }
    });

    // Socket event listeners
    socket.on("draw-line", ({ start, end, color, size }) => {
      const context = contextRef.current;
      context.strokeStyle = color;
      context.lineWidth = size;
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.stroke();
      context.strokeStyle = penColor; // Reset to current user's color
      context.lineWidth = penSize; // Reset to current user's size
    });

    socket.on("draw-rectangle", ({ start, width, height, color, size }) => {
      const context = contextRef.current;
      context.strokeStyle = color;
      context.lineWidth = size;
      context.strokeRect(start.x, start.y, width, height);
      context.strokeStyle = penColor; 
      context.lineWidth = penSize;
    });

    socket.on("clear-canvas", () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off("draw-line");
      socket.off("draw-rectangle");
      socket.off("canvas-state");
      socket.off("clear-canvas");
    };
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = penColor;
    }
  }, [penColor]);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.lineWidth = penSize;
    }
  }, [penSize]);

  const notify = (message) => {
    toast.success(message, { autoClose: 1000 });
  };

  const loadWhiteboard = async () => {
    try {
      const whiteboard = await fetchWhiteboard(whiteboardId);
      if (whiteboard.data) {
        const img = new Image();
        img.src = whiteboard.data;
        img.onload = () => {
          const canvas = canvasRef.current;
          const context = contextRef.current;
          context.clearRect(0, 0, canvas.width, canvas.height); //clear the canvas
          context.drawImage(img, 0, 0, canvas.width, canvas.height); //draw the image
        };
      } else {
        console.warn("No image data found for this whiteboard");
      }
    } catch (error) {
      console.error("Failed to load whiteboard:", error);
    }
  };

  const saveCurrentWhiteboard = async () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    try {
      const res = await saveWhiteboard({ name: "Guest User", data: imageData });
      navigate(`meeting/${res.whiteboard._id}`, { replace: true });
    } catch (error) {
      console.error("Failed to save whiteboard:", error);
    }
  };

  const updateCurrentWhiteboard = async () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    try {
      await updateWhiteboard({
        id: whiteboardId,
        name: "Guest User",
        data: imageData,
      });
      notify("Updated successfully!");
    } catch (error) {
      console.error("Failed to update whiteboard:", error);
    }
  };

  const deleteCurrentWhiteboard = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this whiteboard?"
    );
    if (!confirmDelete) return;

    try {
      await deleteWhiteboard(whiteboardId);
      navigate(`/`, { replace: true });
    } catch (error) {
      console.error("Failed to delete whiteboard:", error);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    if (whiteboardId) {
      socket.emit("clear-canvas", whiteboardId);
    }
  };

  const startDrawing = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;
    setIsDrawing(true);
    setStartPos({ x: offsetX, y: offsetY });

    if(tool==="pen" || tool==="eraser"){
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
      lastPoint.current = { x: offsetX, y: offsetY };
    }else if(tool==="rectangle"){
      const canvas = canvasRef.current;
      baseImageRef.current = contextRef.current.getImageData(0, 0, canvas.width, canvas.height);
    }
  };

  const finishDrawing = (event) => {
    if(!isDrawing) return;
    setIsDrawing(false);

    if(tool==="pen" || tool==="eraser"){
      contextRef.current.closePath();
      lastPoint.current = null;
    }else if(tool==="rectangle" && whiteboardId && baseImageRef){
      const { offsetX, offsetY } = event.nativeEvent;
      socket.emit("draw-rectangle", {
        roomId: whiteboardId,
        start: startPos,
        width: offsetX - startPos.x,
        height: offsetY - startPos.y,
        color: penColor,
        size: penSize,
      });
    }

    baseImageRef.current = null;

    // Save canvas state after drawing
    if (whiteboardId) {
      const imageData = canvasRef.current.toDataURL();
      socket.emit("save-canvas-state", {
        roomId: whiteboardId,
        imageData,
      });
    }
  };

  const draw = (event) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = event.nativeEvent;

    if (tool === 'pen' || tool === 'eraser') {
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();

      // Emit drawing event
      if (whiteboardId && lastPoint.current) {
        socket.emit("draw-line", {
          roomId: whiteboardId,
          start: lastPoint.current,
          end: { x: offsetX, y: offsetY },
          color: penColor,
          size: penSize,
        });
      }

      lastPoint.current = { x: offsetX, y: offsetY };
    }else if(tool==="rectangle"){
      if (baseImageRef.current) {
        contextRef.current.putImageData(baseImageRef.current, 0, 0);
      }
      const width = offsetX - startPos.x;
      const height = offsetY - startPos.y;
      contextRef.current.strokeRect(startPos.x, startPos.y, width, height);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center">
      <div className="mb-2 mt-2 flex items-center space-x-4">
        <button
          onClick={() => setTool("pen")}
          className={`p-2 rounded shadow ${
            tool === "pen" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          <Pencil />
        </button>
        <button
          onClick={() => setTool("rectangle")}
          className={`p-2 rounded shadow ${
            tool === "rectangle" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          <Square />
        </button>
        <button
          onClick={() => {
            setTool("eraser");
            setPenColor("#FFFFFF");
          }}
          className={`p-2 rounded shadow ${
            tool === "eraser" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          <Eraser />
        </button>
        {/* Color Picker */}
        <label className="flex items-center space-x-2">
          <input
            type="color"
            value={penColor}
            onChange={(e) => setPenColor(e.target.value)}
            className="w-10 h-10 border rounded"
          />
        </label>
        {/* Pen Size */}
        <label className="flex items-center space-x-2">
          <span>Size:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={penSize}
            onChange={(e) => setPenSize(Number(e.target.value))}
            className="w-32"
          />
          <span>{penSize}px</span>
        </label>
        {/* Clear Canvas */}
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-500 text-white rounded shadow"
        >
          Clear
        </button>
        {/* Save Canvas */}
        {whiteboardId ? (
          <button
            onClick={updateCurrentWhiteboard}
            className="p-2 bg-blue-700 text-white rounded shadow"
          >
            <Save />
          </button>
        ) : (
          <button
            onClick={saveCurrentWhiteboard}
            className="p-2 bg-blue-500 text-white rounded shadow"
          >
            <Save />
          </button>
        )}

        {whiteboardId && (
          <button
            onClick={deleteCurrentWhiteboard}
            className="px-4 py-2 bg-red-500 text-white rounded shadow"
          >
            Delete
          </button>
        )}
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        onMouseLeave={finishDrawing} // Stop drawing if the mouse leaves the canvas
        className="w-full h-full bg-white border"
      />
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Whiteboard;
