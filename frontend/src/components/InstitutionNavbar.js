import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './InstitutionNavbar.css';
import logo from '../assets/logo.png';

function InstitutionNavbar() {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    // يمكنك ضبط RTL يدويًا لو حبيت
    document.body.dir = 'ltr';
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <>
      <div className="top-bar">
        <div className="top-actions">
          <span className="language-switch" onClick={() => alert("Language switching is disabled.")}>
            🌐 EN / AR
          </span>
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>
            🌙 {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      <nav className="inst-nav">
        <div className="navbar-left">
          <img src={logo} alt="Logo" className="navbar-logo" />
        </div>

        <span className="inst-nav__logo">
          <h2>Monitor Palestine 360</h2>
        </span>

        <ul className="inst-nav__links">
          <li><NavLink to="/institution-dashboard">Dashboard</NavLink></li>
          <li><NavLink to="/institution-create-new-case">Create Case</NavLink></li>
          <li><NavLink to="/institution-my-cases">My Cases</NavLink></li>
          <li><NavLink to="/institution-reports">Reports</NavLink></li>
          <li><NavLink to="/institution-profile">Profile</NavLink></li>
          <li><NavLink to="/institution-settings">Settings</NavLink></li>
        </ul>

        <button className="inst-nav__logout" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </>
  );
}

export default InstitutionNavbar;
