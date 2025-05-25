// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page centered-home">

      {/* 🔍 Search bar at the top */}
      <div className="search-container" style={{ marginBottom: '40px' }}>
        <input
          type="text"
          placeholder="Search for a case"
          className="search-input"
        />
        <button className="search-button">
          🔍
        </button>
      </div>

      <h1 className="home-title">Palestine Monitor 360</h1>

      <p className="home-description">
        A secure platform for documenting and analyzing human rights violations in Palestine.
        Submit reports, explore visual insights, and take part in defending justice.
      </p>

      <Link to="/submit-report" className="home-button">
        Submit a Report
      </Link>
    </div>
  );
};

export default Home;
