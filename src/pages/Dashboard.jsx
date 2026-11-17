import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  Utensils,
  Flame,
  Activity,
  Calendar,
  PlusCircle,
  FileText,
  ArrowRight,
} from 'lucide-react';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    consumed: 0,
    burned: 0,
    netCalories: 0,
    date: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your daily nutrition, workout activity, and calorie balance.
          </p>
        </div>

        {dashboardData.date && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600 shadow-xs self-start sm:self-auto">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Today · {dashboardData.date}</span>
          </div>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Consumed */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Consumed Today</span>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">
              {loading ? '...' : Math.round(dashboardData.consumed).toLocaleString()}
              <span className="text-sm font-normal text-slate-400 ml-1.5">kcal</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Total food intake today</p>
          </div>
        </div>

        {/* Burned */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Burned Today</span>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">
              {loading ? '...' : Math.round(dashboardData.burned).toLocaleString()}
              <span className="text-sm font-normal text-slate-400 ml-1.5">kcal</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Total exercise burn today</p>
          </div>
        </div>

        {/* Net Calories */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Net Calories</span>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">
              {loading ? '...' : Math.round(dashboardData.netCalories).toLocaleString()}
              <span className="text-sm font-normal text-slate-400 ml-1.5">kcal</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Intake − Burned balance</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/FoodEntry"
            className="group bg-white p-5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Log Food Entry</p>
                <p className="text-xs text-slate-400">Record food consumed today</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
          </Link>

          <Link
            to="/ExerciseEntry"
            className="group bg-white p-5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Log Exercise</p>
                <p className="text-xs text-slate-400">Record workout session</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
          </Link>

          <Link
            to="/Report"
            className="group bg-white p-5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">View Reports</p>
                <p className="text-xs text-slate-400">Analyze date-wise history</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
