import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // The session lives in an httpOnly cookie the browser cannot touch,
            // so the server has to clear it. Without this the token stays valid
            // and navigating back to /Dashboard silently logs the user in again.
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            localStorage.clear();
            navigate('/Login', { replace: true });
        }
    };

    return (
        <div className="sidebar">
            <ul>
                <li><Link to="/Dashboard" >Dashboard</Link></li>
                <li><Link to="/FoodMaster" >Food Master</Link></li>
                <li><Link to="/ExerciseMaster" >Exercise Master</Link></li>
                <li><Link to="/FoodEntry" >Food Entry</Link></li>
                <li><Link to="/ExerciseEntry" >Exercise Entry</Link></li>
                <li><Link to="/Report" >Reports</Link></li>
            </ul>
            <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a></li>
            </ul>
        </div>
    );
};

export default Sidebar;
