import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import './InstitutionNavbar.css'; // تأكد أنه نفس التصميم النهائي من navbar.css
import logo from '../assets/logo.png';

function InstitutionNavbar() {
  const [darkMode, setDarkMode] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
    setDarkMode(!darkMode);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <>
      <div className="top-bar">
        <div className="top-actions">
          <span className="language-switch" onClick={toggleLanguage}>
            🌐 EN / AR
          </span>
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>
            🌙 {darkMode ? t('lightMode') : t('darkMode')}
          </button>
        </div>
      </div>

      <nav className="inst-nav">
        <div className="navbar-left">
          <img
            src={logo}
            alt="Logo"
            className="navbar-logo"
          />
        </div>

        <span className="inst-nav__logo">
          <h2>Monitor Palestine 360</h2>
        </span>

        <ul className="inst-nav__links">
          <li><NavLink to="/institution-dashboard">{t('dashboard')}</NavLink></li>
          <li><NavLink to="/institution-create-case">{t('createCase')}</NavLink></li>
          <li><NavLink to="/institution-my-cases">{t('myCases')}</NavLink></li>
          <li><NavLink to="/institution-reports">{t('reports')}</NavLink></li>
          <li><NavLink to="/institution-profile">{t('profile')}</NavLink></li>
          <li><NavLink to="/institution-settings">{t('settings')}</NavLink></li>
        </ul>

        <button className="inst-nav__logout" onClick={handleLogout}>
          {t('logout')}
        </button>
      </nav>
    </>
  );
}

export default InstitutionNavbar;
