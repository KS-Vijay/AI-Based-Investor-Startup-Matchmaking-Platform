import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import assets from '../assets/assets';

const Navbar = ({ userType = 'startup' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDropdownToggle = () => setShowDropdown((prev) => !prev);
  
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const getProfileSettingsPath = () => {
    return userType === 'investor' ? '/investor-profile-settings' : '/startup-profile-settings';
  };

  const getDashboardPath = () => {
    return userType === 'investor' ? '/investor-dashboard' : '/startup-dashboard';
  };

  const getSearchPath = () => {
    return userType === 'investor' ? '/startupssearch' : '/investor-search';
  };

  const getSearchLabel = () => {
    return userType === 'investor' ? 'Explore Startups' : 'Explore Investors';
  };

  const getProfileLabel = () => {
    return userType === 'investor' ? 'Investor Profile' : 'Startup Profile';
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getButtonClass = (path) => {
    const baseClass = "text-white px-4 py-2 rounded-lg transition";
    return isActive(path) 
      ? `${baseClass} bg-indigo-800 text-purple-300` 
      : `${baseClass} hover:text-purple-300 hover:bg-indigo-800`;
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(getDashboardPath())}>
        <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow">Chatiao</span>
      </div>
      <nav className="flex items-center gap-6 text-sm font-medium relative">
        <button onClick={() => navigate(getDashboardPath())} className={getButtonClass(getDashboardPath())}>Home</button>
        <button onClick={() => navigate(getSearchPath())} className={getButtonClass(getSearchPath())}>{getSearchLabel()}</button>
        <button onClick={() => navigate('/chat')} className={getButtonClass('/chat')} title="Chat">
          Chat
        </button>
        {/* Robot Icon Dropdown */}
        <div className="relative ml-4">
          <button
            className="p-2 rounded-full hover:bg-indigo-800 transition flex items-center border border-white/10"
            title="User Menu"
            onClick={handleDropdownToggle}
          >
            <img src="https://img.freepik.com/premium-photo/humanoid-half-man-body-robotic-cyberfunk-black-backround_1230721-5.jpg" alt="Robot" className="w-9 h-9" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg z-20">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-indigo-100"
                onClick={() => { setShowDropdown(false); navigate(getProfileSettingsPath()) }}
              >{getProfileLabel()}</button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-indigo-100"
                onClick={handleLogout}
              >Logout</button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar; 