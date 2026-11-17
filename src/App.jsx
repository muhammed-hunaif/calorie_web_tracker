import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Sign from "./pages/Sign";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./pages/Sidebar";
import ExerciseEntry from "./pages/ExerciseEntry";
import FoodEntry from "./pages/FoodEntry";
import ExerciseMaster from "./pages/ExerciseMaster";
import FoodMaster from "./pages/FoodMaster";
import Report from "./pages/Report";
import ReportView from "./pages/ReportView";
import ProtectedRoute from "./pages/ProtectedRoute";
import { Menu, Flame } from "lucide-react";

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar with responsive mobile drawer */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header (hidden on md and above) */}
        <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 h-14 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Flame className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">CalorieTrack</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Menu"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
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

        {/* Protected routes — requires authentication */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/ExerciseEntry" element={<ExerciseEntry />} />
            <Route path="/FoodEntry" element={<FoodEntry />} />
            <Route path="/ExerciseMaster" element={<ExerciseMaster />} />
            <Route path="/FoodMaster" element={<FoodMaster />} />
            <Route path="/Report" element={<Report />} />
            <Route path="/ReportView/:date" element={<ReportView />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
