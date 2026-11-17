import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    api
      .post('/auth/logout')
      .then(() => {
        alert('Logged out successfully!');
        navigate('/Login');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
        alert('Logout failed');
      });
  };

  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between">
      <h2 className="text-base font-semibold text-slate-800">Dashboard Area</h2>
      <button
        onClick={handleLogout}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-xs font-medium text-slate-600 transition cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Log Out</span>
      </button>
    </header>
  );
};

export default Navbar;
