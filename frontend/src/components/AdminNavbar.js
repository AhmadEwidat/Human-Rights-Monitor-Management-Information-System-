// src/components/AdminNavbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // ✨ إضافة الترجمة
import './AdminNavbar.css';
import logo from '../assets/logo.png';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // ✨ استخدام الترجمة

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
        <li><Link to="/admin-welcome">{t('dashboard')}</Link></li>
        <li><Link to="/admin-institutions">{t('manageInstitutions')}</Link></li>
        <li><Link to="/admin-reports">{t('reviewReports')}</Link></li>
        <li><Link to="/admin-users">{t('manageUsers')}</Link></li>
        <li><Link to="/admin-settings">{t('settings')}</Link></li>
         <li><Link to="/cases">Cases</Link></li>
        <li><Link to="/admin-reports">{t('pendingCases')}</Link></li>
      </ul>

      <button onClick={handleLogout} className="admin-logout-btn">
        {t('logout')}
      </button>
    </nav>
  );
};

export default AdminNavbar;
