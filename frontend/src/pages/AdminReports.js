import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

function AdminReports() {
  const { t } = useTranslation();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "admin") {
      navigate("/login");
      return;
    }
    fetchCases();
  }, [role, navigate]);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/reports/?pending_only=true", {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        const formattedCases = data.reports?.map(report => ({
          ...report,
          id: report._id || report.id
        })) || [];
        setCases(formattedCases);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError(t("fetchError") + ": " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (caseId, status, comment = "") => {
    if (!caseId) {
      alert(t("fetchError") + ": Invalid case ID");
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/reports/cases/${caseId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, comment }),
      });
      
      if (response.ok) {
        await fetchCases(); // Refresh the cases list
        alert(t("statusUpdated"));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to update status: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert(t("fetchError") + ": " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ color: "#2e7d32", marginBottom: "1.5rem" }}>{t("pendingCases")}</h2>
      {loading ? (
        <p>{t("loading")}</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : cases.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {cases.map((caseItem) => (
            <li
              key={caseItem.id}
              style={{
                marginBottom: "1rem",
                padding: "1.5rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                background: "#fff",
              }}
            >
              <div><strong>{t("caseId")}:</strong> {caseItem.id}</div>
              <div>
                <strong>{t("description")}:</strong>{" "}
                {caseItem.incident_details?.description || "غير متوفر"}
              </div>
              <div>
                <strong>{t("location")}:</strong>{" "}
                {caseItem.incident_details?.location?.country || "غير محدد"}
              </div>
              <div>
                <strong>{t("violationTypes")}:</strong>{" "}
                {caseItem.incident_details?.violation_types?.join(", ") || "غير متوفر"}
              </div>
              <div>
                <strong>{t("date")}:</strong>{" "}
                {new Date(caseItem.created_at).toLocaleDateString()}
              </div>
              <div style={{ marginTop: "1rem" }}>
                <button
                  onClick={() => handleUpdateStatus(caseItem.id, "approved")}
                  style={{
                    background: "#2e7d32",
                    color: "white",
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "4px",
                    marginRight: "1rem",
                  }}
                >
                  {t("approve")}
                </button>
                <button
                  onClick={() => handleUpdateStatus(caseItem.id, "rejected", prompt(t("rejectComment")))}
                  style={{
                    background: "#d32f2f",
                    color: "white",
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "4px",
                  }}
                >
                  {t("reject")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>{t("noPendingCases")}</p>
      )}
    </div>
  );
}

export default AdminReports;