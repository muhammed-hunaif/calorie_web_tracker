import { useState, useEffect } from 'react';
import api from '../api/axios';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    consumed: 0,
    burned: 0,
    netCalories: 0
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
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card consumed">
          <div className="card-title">Total Calories Consumed</div>
          <div className="card-value">{dashboardData.consumed}</div>
        </div>

        <div className="dashboard-card burned">
          <div className="card-title">Total Calories Burned</div>
          <div className="card-value">{dashboardData.burned}</div>
        </div>

        <div className="dashboard-card net">
          <div className="card-title">Total Net Calories</div>
          <div className="card-value">{dashboardData.netCalories}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
