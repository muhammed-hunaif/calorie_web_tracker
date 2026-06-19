
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Sign from "./pages/Sign";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"
import Sidebar from "./pages/Sidebar";
import ExerciseEntry from "./pages/ExerciseEntry";
import FoodEntry from "./pages/FoodEntry";
import ExerciseMaster from "./pages/ExerciseMaster";
import FoodMaster from "./pages/FoodMaster";
import Report from "./pages/Report";
import ReportView from "./pages/ReportView";

import "./styles/Dashboard.css";

const Layout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Login" replace />} />
        <Route path="/Sign" element={<Sign />} />
        <Route path="/Login" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/Dashboard" element={<Dashboard/>} />
          <Route path="/ExerciseEntry" element={<ExerciseEntry/>} />
          <Route path="/FoodEntry" element={<FoodEntry/>} />
          <Route path="/ExerciseMaster" element={<ExerciseMaster/>} />
          <Route path="/FoodMaster" element={<FoodMaster/>} />
          <Route path="/Report" element={<Report/>} />
          <Route path="/ReportView/:date" element={<ReportView/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
