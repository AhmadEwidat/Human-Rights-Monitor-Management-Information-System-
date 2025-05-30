import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

function ReportsPage() {
  const { t, i18n } = useTranslation();
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    start_date: "",
    end_date: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`http://localhost:8000/reports/?${queryParams}`);
      console.log("Response status:", response.status); // تتبع الحالة
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched data:", data); // تتبع البيانات
        setReports(data.reports || []);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(t("fetchError") + ": " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{t("reportsTitle")}</h2>

      {/* فلاتر التقارير */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          {t("status")}:
          <select name="status" onChange={handleFilterChange} value={filters.status}>
            <option value="">{t("all")}</option>
            <option value="new">{t("new")}</option>
            <option value="under_investigation">{t("underInvestigation")}</option>
            <option value="resolved">{t("resolved")}</option>
          </select>
        </label>
        <label>
          {t("startDate")}:
          <input
            type="date"
            name="start_date"
            onChange={handleFilterChange}
            value={filters.start_date}
          />
        </label>
        <label>
          {t("endDate")}:
          <input
            type="date"
            name="end_date"
            onChange={handleFilterChange}
            value={filters.end_date}
          />
        </label>
        <label>
          {t("location")}:
          <input
            type="text"
            name="location"
            onChange={handleFilterChange}
            placeholder={t("placeholderLocation")}
            value={filters.location}
          />
        </label>
        <button onClick={fetchReports} style={{ marginLeft: "1rem" }}>
          {t("applyFilters")}
        </button>
      </div>

      {/* عرض التقارير أو الأخطاء */}
      {loading ? (
        <p>{t("loading")}</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : reports.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {reports.map((report, index) => (
            <li key={index} style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "4px" }}>
              <strong>{t("incidentDetails")}:</strong> {report.incident_details?.description || "N/A"}
              <br />
              <strong>{t("status")}:</strong> {report.status || "N/A"}
              <br />
              <strong>{t("date")}:</strong> {new Date(report.created_at).toLocaleDateString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>{t("noReports")}</p>
      )}
    </div>
  );
}

export default ReportsPage;