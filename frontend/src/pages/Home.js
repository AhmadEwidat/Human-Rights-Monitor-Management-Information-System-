import React, { useState, useEffect } from 'react';
import './Home.css';

const CreativeHome = () => {
  const [cases, setCases] = useState([]);
  const [stats] = useState({
    totalCases: 128,
    totalVictims: 94,
    topRegion: 'Gaza',
  });

  useEffect(() => {
    fetch("http://localhost:8000/cases")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setCases(data);
      });
  }, []);

  return (
    <div className="creative-home">
      <section className="hero-section">
        <div className="overlay">
          <h1>Documenting Violations in Palestine</h1>
          <p>Join us in uncovering the truth and supporting human rights</p>
          <button className="cta-btn">Explore Cases</button>
        </div>
      </section>

      <div className="stats-container">
        <div className="stat-card">
          <h3>{stats.totalCases}</h3>
          <p>Total Cases</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalVictims}</h3>
          <p>Total Victims</p>
        </div>
        <div className="stat-card">
          <h3>{stats.topRegion}</h3>
          <p>Most Affected Region</p>
        </div>
      </div>

      <section className="cases-section">
        <h2>Latest Cases</h2>
        <div className="cases-grid">
          {Array.isArray(cases) && cases.map((c, i) => (
            <div key={i} className="case-card">
              <h3>{c.title?.en || 'Untitled'}</h3>
              <p>
                {c.date_occurred?.slice(0, 10)} | {c.location?.region?.en || 'Unknown'} | {c.violation_types?.[0]?.name_en || 'N/A'}
              </p>
              <button>View Details</button>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2>About Us</h2>
        <p>
          We are a rights-focused platform documenting violations against Palestinians. We provide a verified database to support human rights reports and international justice efforts.
        </p>
      </section>

      <footer>© 2025 Monitor Palestine 360 – All rights reserved</footer>
    </div>
  );
};

export default CreativeHome;
