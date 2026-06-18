import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <ul>
                <li><Link to="/Dashboard" >Dashboard</Link></li>
                <li><Link to="/FoodMaster" >Food Master</Link></li>
                <li><Link to="/ExerciseMaster" >Exercise Master</Link></li>
                <li><Link to="/FoodEntry" >Food Entries</Link></li>
                <li><Link to="/ExerciseEntry" >Exercise Entries</Link></li>
                <li><Link to="/Report" >Reports</Link></li>
            </ul>
        </div>
    );
};

export default Sidebar;
