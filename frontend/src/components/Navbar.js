import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Navbar.css';
import { Link } from 'react-router-dom';

import logo from '../assets/logo.png'; // تأكد من المسار الصحيح

function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const { t, i18n } = useTranslation();

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
          <li><a href="#">{t('home')}</a></li>
          <li><a href="#">{t('about')}</a></li>
          <li><a href="#">{t('howItWorks')}</a></li>
          <li><a href="#">{t('submitReport')}</a></li>
          <li><a href="#">{t('contact')}</a></li>
          <li><a href="#">{t('faq')}</a></li>
          <li><a href="#">{t('dashboard')}</a></li>
        </ul>

<Link to="/login" className="login-btn">
  {t('login')}
</Link>
     </nav>

      <div className="search-container">
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          className="search-input"
        />
        <button className="search-button">
          🔍
        </button>
      </div>
    </>
  );
}

export default Navbar;
