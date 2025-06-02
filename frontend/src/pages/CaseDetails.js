import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const CaseDetails = () => {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/cases/${caseId}`);
        setCaseData(res.data);
      } catch (err) {
        console.error("Error fetching case details:", err);
        setError("Failed to fetch case.");
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [caseId]);

  if (loading) return <p>Loading case...</p>;
  if (error) return <p>{error}</p>;
  if (!caseData) return <p>No case data available.</p>;

  return (
    <div className="container mt-4">
      <h2>Case Details</h2>
      <p><strong>Case ID:</strong> {caseData.case_id}</p>
      <p><strong>Title (EN):</strong> {caseData.title.en}</p>
      <p><strong>Title (AR):</strong> {caseData.title.ar}</p>
      <p><strong>Description (EN):</strong> {caseData.description.en}</p>
      <p><strong>Description (AR):</strong> {caseData.description.ar}</p>
      <p><strong>Status:</strong> {caseData.status}</p>
      <p><strong>Priority:</strong> {caseData.priority}</p>
      <p><strong>Country (EN):</strong> {caseData.location.country.en}</p>
      <p><strong>Country (AR):</strong> {caseData.location.country.ar}</p>
      <p><strong>Region (EN):</strong> {caseData.location.region.en}</p>
      <p><strong>Region (AR):</strong> {caseData.location.region.ar}</p>
      <p><strong>Coordinates:</strong> {caseData.location.coordinates.coordinates.join(", ")}</p>
      <p><strong>Date Occurred:</strong> {new Date(caseData.date_occurred).toLocaleDateString()}</p>
      <p><strong>Date Reported:</strong> {new Date(caseData.date_reported).toLocaleDateString()}</p>

      {caseData.evidence && caseData.evidence.length > 0 && (
        <div>
          <h4>Evidence</h4>
          <ul>
            {caseData.evidence.map((item, index) => (
              <li key={index}>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.type} - {item.url}
                </a>
              </li> 
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CaseDetails;
