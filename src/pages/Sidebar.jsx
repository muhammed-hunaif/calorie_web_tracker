import { Link, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/Login');
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
