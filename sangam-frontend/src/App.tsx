import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Dashboard2 from "./pages/Dashboard2";
import InstagramSettings from "./pages/InstagramSettings";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard2" element={<Dashboard2 />} />
        <Route path="/settings/instagram" element={<InstagramSettings />} />
      </Routes>
    </Router>
  );
};

export default App;
