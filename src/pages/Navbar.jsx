
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        api.post('/auth/logout')
            .then(() => {
                alert("Logged out successfully!");
                navigate("/Login");
            })
            .catch((error) => {
                console.error("Logout failed:", error);
                alert("Logout failed");
            });
    };

    return (
        <div className="navbar">
            <h2>Dashboard Area</h2>
            <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </div>
    );
};

export default Navbar;