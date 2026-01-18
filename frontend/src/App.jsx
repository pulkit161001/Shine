import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Meeting from "./pages/Meeting";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/meeting/:id" element={<Meeting />} />
    </Routes>
  );
};

export default App;
