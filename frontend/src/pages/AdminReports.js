import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

function AdminReports() {
  const { t, i18n } = useTranslation();
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
      const response = await fetch("http://localhost:8000/reports/?status=pending", {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCases(data.reports.filter((r) => r.pending_approval) || []);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError(t("fetchError") + ": " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (caseId, status) => {
    try {
      const response = await fetch(`http://localhost:8000/cases/${caseId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        fetchCases();
        alert(t("statusUpdated"));
      } else {
        throw new Error("Failed to update status");
      }
    } catch (err) {
      alert(t("fetchError") + ": " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{t("pendingCases")}</h2>
      {loading ? (
        <p>{t("loading")}</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : cases.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {cases.map((caseItem) => (
            <li key={caseItem.id} style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "4px" }}>
              <strong>{t("caseId")}:</strong> {caseItem.id}
              <br />
              <strong>{t("description")}:</strong> {caseItem.incident_details?.description || "غير متوفر"}
              <br />
              <strong>{t("location")}:</strong> {caseItem.incident_details?.location?.country || "غير محدد"}
              <br />
              <strong>{t("date")}:</strong> {new Date(caseItem.created_at).toLocaleDateString()}
              <br />
              <select
                onChange={(e) => handleUpdateStatus(caseItem.id, e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>{t("selectStatus")}</option>
                <option value="new">{t("new")}</option>
                <option value="under_investigation">{t("underInvestigation")}</option>
                <option value="resolved">{t("resolved")}</option>
              </select>
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