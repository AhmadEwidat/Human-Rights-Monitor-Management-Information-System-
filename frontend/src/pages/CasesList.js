import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

function CasesList() {
  const { t, i18n } = useTranslation();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!role || role !== "institution") {
      navigate("/login");
      return;
    }
    fetchCases();
  }, [role, navigate]);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/reports/cases", {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log("Fetched cases data:", data);
      const formattedCases = Array.isArray(data.cases) ? data.cases.map((c) => ({
        ...c,
        id: c.id || c._id?.toString(),
      })) : [];
      setCases(formattedCases);
    } catch (err) {
      setError(t("fetchError") + ": " + err.message);
      console.error("Fetch error:", err.message);
      if (err.message.includes("401")) {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCase = (caseId) => {
    navigate(`/institution-create-report/${caseId}`);
  };

  // الأنماط باستخدام CSS مُدمج
  const containerStyle = {
    padding: "2rem",
    fontFamily: "'Arial', sans-serif",
    maxWidth: "1200px",
    margin: "0 auto",
    color: "#333",
  };

  const headerStyle = {
    fontSize: "1.5rem",
    color: "#2e7d32",
    marginBottom: "1.5rem",
  };

  const loadingStyle = {
    fontStyle: "italic",
    color: "#666",
  };

  const errorStyle = {
    color: "#d32f2f",
    fontWeight: "500",
  };

  const listStyle = {
    listStyle: "none",
    padding: "0",
  };

  const caseItemStyle = {
    background: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "1.5rem",
    marginBottom: "1rem",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s",
  };

  const caseItemHoverStyle = {
    transform: "translateY(-2px)", // يُطبق عبر onMouseEnter
  };

  const caseDetailStyle = {
    marginBottom: "0.5rem",
  };

  const buttonStyle = {
    background: "#2e7d32",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "background 0.3s",
  };

  const createButtonStyle = {
    ...buttonStyle,
    marginTop: "1.5rem",
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>{t("availableCases")}</h2>
      {loading ? (
        <p style={loadingStyle}>{t("loading")}</p>
      ) : error ? (
        <p style={errorStyle}>{error}</p>
      ) : cases.length > 0 ? (
        <ul style={listStyle}>
          {cases.map((caseItem) => (
            <li
              key={caseItem.id}
              style={caseItemStyle}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div style={caseDetailStyle}>
                <strong>{t("caseId")}:</strong> {caseItem.id}
              </div>
              <div style={caseDetailStyle}>
                <strong>{t("description")}:</strong>{" "}
                {caseItem.incident_details?.description || "غير متوفر"}
              </div>
              <button
                style={buttonStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#1b5e20")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#2e7d32")
                }
                onClick={() => handleSelectCase(caseItem.id)}
              >
                {t("addReport")}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>{t("noCases")}</p>
      )}
      <button
        style={createButtonStyle}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#1b5e20")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#2e7d32")}
        onClick={() => navigate("/institution-create-new-case")}
      >
        {t("createNewCase")}
      </button>
    </div>
  );
}

export default CasesList;