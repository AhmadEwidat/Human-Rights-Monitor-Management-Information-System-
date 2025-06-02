import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const UpdateCase = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("jwt_token");
  const userRole = token ? JSON.parse(atob(token.split(".")[1]))?.role : null;

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/cases/${caseId}`);
        setCaseData(res.data);
      } catch (err) {
        console.error("Failed to fetch case", err);
        setError("Failed to load case.");
      }
    };
    fetchCase();
  }, [caseId]);

  const handleChange = (field, value) => {
    setCaseData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setCaseData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const handleCoordinatesChange = (index, value) => {
    setCaseData((prev) => {
      const coords = [...prev.location.coordinates.coordinates];
      coords[index] = parseFloat(value);
      return {
        ...prev,
        location: {
          ...prev.location,
          coordinates: { ...prev.location.coordinates, coordinates: coords },
        },
      };
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const { _id, case_id, ...payload } = caseData;  // استبعد الحقول التي لا تُعدل مباشرة
    await axios.patch(`http://localhost:8000/cases/${caseId}`, payload);
    navigate("/admin/cases"); // إعادة التوجيه بعد النجاح فقط
  } catch (err) {
    console.error("Failed to update case", err);
    setError("Failed to update case.");
  }
};

  if (!caseData) return <p>Loading...</p>;
  if (userRole !== "admin") return <p>Unauthorized. Only admins can edit cases.</p>;

  return (
    <div className="container mt-4">
      <h2>Update Case</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Title (EN): <input value={caseData.title.en} onChange={(e) => handleNestedChange("title", "en", e.target.value)} /></label><br />
        <label>Title (AR): <input value={caseData.title.ar} onChange={(e) => handleNestedChange("title", "ar", e.target.value)} /></label><br />
        <label>Description (EN): <textarea value={caseData.description.en} onChange={(e) => handleNestedChange("description", "en", e.target.value)} /></label><br />
        <label>Description (AR): <textarea value={caseData.description.ar} onChange={(e) => handleNestedChange("description", "ar", e.target.value)} /></label><br />
        <label>Status: <input value={caseData.status} onChange={(e) => handleChange("status", e.target.value)} /></label><br />
        <label>Priority: <input value={caseData.priority} onChange={(e) => handleChange("priority", e.target.value)} /></label><br />
        <label>Country (EN): <input value={caseData.location.country.en} onChange={(e) => setCaseData((prev) => ({ ...prev, location: { ...prev.location, country: { ...prev.location.country, en: e.target.value }}}))} /></label><br />
        <label>Country (AR): <input value={caseData.location.country.ar} onChange={(e) => setCaseData((prev) => ({ ...prev, location: { ...prev.location, country: { ...prev.location.country, ar: e.target.value }}}))} /></label><br />
        <label>Region (EN): <input value={caseData.location.region.en} onChange={(e) => setCaseData((prev) => ({ ...prev, location: { ...prev.location, region: { ...prev.location.region, en: e.target.value }}}))} /></label><br />
        <label>Region (AR): <input value={caseData.location.region.ar} onChange={(e) => setCaseData((prev) => ({ ...prev, location: { ...prev.location, region: { ...prev.location.region, ar: e.target.value }}}))} /></label><br />
        <label>Coordinates [0]: <input type="number" value={caseData.location.coordinates.coordinates[0]} onChange={(e) => handleCoordinatesChange(0, e.target.value)} /></label><br />
        <label>Coordinates [1]: <input type="number" value={caseData.location.coordinates.coordinates[1]} onChange={(e) => handleCoordinatesChange(1, e.target.value)} /></label><br />
        <button type="submit" className="btn btn-primary mt-2">Update Case</button>
      </form>
    </div>
  );
};

export default UpdateCase;
