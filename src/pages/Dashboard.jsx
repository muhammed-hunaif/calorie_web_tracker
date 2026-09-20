import { useState, useEffect } from 'react';
import api from '../api/axios';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    consumed: 0,
    burned: 0,
    netCalories: 0,
    date: ''
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to Dashboard</h1>
        {/* These totals cover today only, so say which day they describe. */}
        {dashboardData.date && <p className="dashboard-subtitle">Today · {dashboardData.date}</p>}
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card consumed">
          <div className="card-title">Total Calories Consumed Today</div>
          <div className="card-value">{Math.round(dashboardData.consumed)}</div>
        </div>

        <div className="dashboard-card burned">
          <div className="card-title">Total Calories Burned Today</div>
          <div className="card-value">{Math.round(dashboardData.burned)}</div>
        </div>

        <div className="dashboard-card net">
          <div className="card-title">Net Calories Today</div>
          <div className="card-value">{Math.round(dashboardData.netCalories)}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
