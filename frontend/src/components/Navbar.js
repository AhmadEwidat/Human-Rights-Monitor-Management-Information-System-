import React, { useState } from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

function Navbar() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
    setDarkMode(!darkMode);
  };

  return (
    <>
      <div className="news-flash">
        <div className="flash-title">News Flash</div>
        <div className="flash-ticker">
          <ul>
            <li>🔥 غزة تحت القصف – المستشفيات تعاني نقصًا حادًا</li>
            <li>🧒 استشهاد طفل برصاص الاحتلال في نابلس</li>
            <li>🏥 قصف مباشر لمستشفى الشفاء بغزة</li>
            <li>🕊️ استشهاد الصحفية هنادي أبو نعيم خلال تغطية ميدانية</li>
          </ul>
        </div>
      </div>

      <div className="top-bar">
        <div className="top-actions">
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>
            🌙 {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      <nav className="navbar">
        <div className="navbar-left">
          <img
            src={logo}
            alt="Logo"
            className="navbar-logo"
            style={{ height: '120px', width: 'auto', objectFit: 'contain' }}
          />
        </div>

        <span className="navbar-title">Monitor Palestine 360</span>

        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/violations">Browse Violations</Link></li>
          <li><Link to="/how-it-works">How It Works</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/faq">FAQ</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/statistics">Statistics</Link></li>
        </ul>

        <Link to="/login" className="login-btn">
          Institution Login
        </Link>
      </nav>
    </>
  );
}

export default Navbar;
