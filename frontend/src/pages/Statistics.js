import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

function Statistics() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState({ new: 0, underInvestigation: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/reports/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        const reports = data.reports || [];
        const statsData = reports.reduce(
          (acc, report) => {
            acc[report.status] = (acc[report.status] || 0) + 1;
            return acc;
          },
          { new: 0, underInvestigation: 0, resolved: 0 }
        );
        setStats(statsData);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError(t("fetchError") + ": " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>{t("statistics") || "إحصائيات"}</h2>
      {loading ? (
        <p>{t("loading")}</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <div>
          <p>{t("new")}: {stats.new}</p>
          <p>{t("underInvestigation")}: {stats.underInvestigation}</p>
          <p>{t("resolved")}: {stats.resolved}</p>
        </div>
      )}
    </div>
  );
}

export default Statistics;