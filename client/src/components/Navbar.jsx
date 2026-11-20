import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaMagic } from 'react-icons/fa';

const Navbar = ({ userType = 'startup' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDropdownToggle = () => setShowDropdown((prev) => !prev);
  
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
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
    const baseClass = "text-white px-3.5 py-2 rounded-xl transition text-sm font-medium flex items-center gap-1.5";
    return isActive(path) 
      ? `${baseClass} bg-purple-600/40 text-purple-200 border border-purple-500/30` 
      : `${baseClass} hover:text-purple-300 hover:bg-white/10`;
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(getDashboardPath())}>
        <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent drop-shadow">
          MatchPoint AI
        </span>
      </div>
      <nav className="flex items-center gap-3 sm:gap-4 text-sm font-medium relative">
        <button onClick={() => navigate(getDashboardPath())} className={getButtonClass(getDashboardPath())}>
          Dashboard
        </button>
        <button onClick={() => navigate('/matches')} className={getButtonClass('/matches')}>
          <FaMagic className="text-purple-400 text-xs" />
          <span>AI Matches</span>
        </button>
        <button onClick={() => navigate(getSearchPath())} className={getButtonClass(getSearchPath())}>
          {getSearchLabel()}
        </button>
        <button onClick={() => navigate('/chat')} className={getButtonClass('/chat')}>
          Messages
        </button>

        {/* User Dropdown */}
        <div className="relative ml-2">
          <button
            className="p-1.5 rounded-full hover:bg-white/10 transition flex items-center border border-white/15"
            title="User Menu"
            onClick={handleDropdownToggle}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-xs text-white">
              {userType === 'investor' ? 'INV' : 'FND'}
            </div>
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 text-white rounded-xl shadow-2xl z-50 py-1">
              <button
                className="block w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-purple-600/20 transition"
                onClick={() => { setShowDropdown(false); navigate(getProfileSettingsPath()) }}
              >
                {getProfileLabel()}
              </button>
              <button
                className="block w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
