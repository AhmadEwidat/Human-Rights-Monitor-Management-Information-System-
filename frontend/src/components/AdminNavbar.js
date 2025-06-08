import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminNavbar.css';
import logo from '../assets/logo.png';

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-left">
        <img src={logo} alt="Logo" className="admin-logo" />
        <span className="admin-title">Monitor Palestine 360</span>
      </div>

      <ul className="admin-links">
        <li><Link to="/admin-welcome">Dashboard</Link></li>
        <li><Link to="/admin-institutions">Manage Institutions</Link></li>
        <li><Link to="/admin-reports">Review Reports</Link></li>
        <li><Link to="/admin-users">Manage Users</Link></li>
        <li><Link to="/admin/cases">Manage Cases</Link></li>
        <li><Link to="/admin-settings">Settings</Link></li>
        <li><Link to="/cases">Cases</Link></li>
        <li><Link to="/admin-reports">Pending Cases</Link></li>
      </ul>

      <button onClick={handleLogout} className="admin-logout-btn">
        Logout
      </button>
    </nav>
  );
};

export default AdminNavbar;
