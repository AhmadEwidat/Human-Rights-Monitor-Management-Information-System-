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
        const data = res.data;

        // Flatten localized fields
        setCaseData({
          ...data,
          title: data.title?.en || "",
          description: data.description?.en || "",
          location: {
            ...data.location,
            country: data.location?.country?.en || "",
            region: data.location?.region?.en || "",
            coordinates: data.location?.coordinates?.coordinates || [0, 0],
          }
        });
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

  const handleLocationChange = (field, value) => {
    setCaseData((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
  };

  const handleCoordinatesChange = (index, value) => {
    const coords = [...caseData.location.coordinates];
    coords[index] = parseFloat(value);
    setCaseData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: coords,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...caseData,
        title: { en: caseData.title },
        description: { en: caseData.description },
        location: {
          ...caseData.location,
          country: { en: caseData.location.country },
          region: { en: caseData.location.region },
          coordinates: {
            type: "Point",
            coordinates: caseData.location.coordinates,
          }
        }
      };
      delete payload._id;
      delete payload.case_id;

      await axios.patch(`http://localhost:8000/cases/${caseId}`, payload);
      navigate("/admin/cases");
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
        <label>Title: <input value={caseData.title} onChange={(e) => handleChange("title", e.target.value)} /></label><br />
        <label>Description: <textarea value={caseData.description} onChange={(e) => handleChange("description", e.target.value)} /></label><br />
        <label>Status: <input value={caseData.status} onChange={(e) => handleChange("status", e.target.value)} /></label><br />
        <label>Priority: <input value={caseData.priority} onChange={(e) => handleChange("priority", e.target.value)} /></label><br />
        <label>Country: <input value={caseData.location.country} onChange={(e) => handleLocationChange("country", e.target.value)} /></label><br />
        <label>Region: <input value={caseData.location.region} onChange={(e) => handleLocationChange("region", e.target.value)} /></label><br />
        <label>Coordinates [0]: <input type="number" value={caseData.location.coordinates[0]} onChange={(e) => handleCoordinatesChange(0, e.target.value)} /></label><br />
        <label>Coordinates [1]: <input type="number" value={caseData.location.coordinates[1]} onChange={(e) => handleCoordinatesChange(1, e.target.value)} /></label><br />
        <button type="submit" className="btn btn-primary mt-2">Update Case</button>
      </form>
    </div>
  );
};

export default UpdateCase;
