import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Navbar.css';
import { Link, useLocation } from 'react-router-dom';

import logo from '../assets/logo.png'; // تأكد من المسار الصحيح

function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
    setDarkMode(!darkMode);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  // تحديث اتجاه الصفحة حسب اللغة المختارة
  useEffect(() => {
    document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

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

      <nav className="navbar">
        <div className="navbar-left">
          <img
            src={logo}
            alt="Logo"
            className="navbar-logo"
            style={{ height: '120px', width: 'auto', display: 'block', objectFit: 'contain' }}
          />
        </div>

        <span className="navbar-title">Monitor Palestine 360</span>

        <ul className="navbar-links">
          <li><Link to="/">{t('home')}</Link></li>
          <li><Link to="/about">{t('about')}</Link></li>
          <li><Link to="/how-it-works">{t('howItWorks')}</Link></li>
          <li><Link to="/submit-report">{t('submitReport')}</Link></li>
          <li><Link to="/contact">{t('contact')}</Link></li>
          <li><Link to="/faq">{t('faq')}</Link></li>
          <li><Link to="/dashboard">{t('dashboard')}</Link></li>
        </ul>

        <Link to="/login" className="login-btn">
          {t('login')}
        </Link>
      </nav>

     
    </>
  );
}

export default Navbar;
