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


      

     
    </div>
  );
};

export default Home;
