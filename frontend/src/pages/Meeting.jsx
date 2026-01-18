
import { useParams } from "react-router-dom";
import Whiteboard from "../components/Whiteboard";
import { LucideShare2, Save } from 'lucide-react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Meeting = () => {
  const { id } = useParams();

  const notify = (message) => {
    toast.success(message, { autoClose: 1000 });
  };

  const saveCurrentWhiteboard = () => {
    navigator.clipboard.writeText(`http://localhost:5173/meeting/${id}`)
    notify(`Room ID: ${id} copied to clipboard`);
  }

  return (
    <div className="h-screen bg-gray-100">
      <header className="p-4 bg-white shadow">
        <div className="flex">
        <h1 className="text-lg font-bold">Room ID: {id}</h1>
        <button
          onClick={saveCurrentWhiteboard}
          className="ml-2 px-1 bg-gray-200 text-black shadow rounded-sm"
        >
          <LucideShare2/>
        </button>
        </div>
      </header>
      <main className="h-full">
        <Whiteboard whiteboardId={id}/>
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Meeting;
