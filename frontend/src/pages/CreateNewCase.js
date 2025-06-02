import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateCasePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    case_id: "",
    title: { ar: "", en: "" },
    description: { ar: "", en: "" },
    violation_types: [{ name_ar: "", name_en: "" }],
    status: "new",
    priority: "medium",
    location: {
      country: { ar: "", en: "" },
      region: { ar: "", en: "" },
      coordinates: { type: "Point", coordinates: [0, 0] },
    },
    date_occurred: new Date().toISOString(),
    date_reported: new Date().toISOString(),
    evidence: [],
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [key, subkey] = name.split(".");

    if (key === "title" || key === "description") {
      setFormData({ ...formData, [key]: { ...formData[key], [subkey]: value } });
    } else if (key === "country" || key === "region") {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [key]: { ...formData.location[key], [subkey]: value },
        },
      });
    } else if (name === "lat" || name === "lng") {
      const index = name === "lat" ? 1 : 0;
      const newCoords = [...formData.location.coordinates.coordinates];
      newCoords[index] = parseFloat(value);
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          coordinates: { ...formData.location.coordinates, coordinates: newCoords },
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/cases/", formData);
      const caseId = res.data.id;

      if (selectedFile) {
        const fileData = new FormData();
        fileData.append("file", selectedFile);
        await axios.post(`http://localhost:8000/cases/${caseId}/upload`, fileData);
      }

      alert("Case created successfully!");
      navigate("/cases-list");
    } catch (error) {
      console.error("Error creating case:", error);
      alert("Error creating case.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Create New Case</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="case_id" placeholder="Case ID" onChange={handleChange} className="form-control mb-2" />

        <input type="text" name="title.en" placeholder="Title (EN)" onChange={handleChange} className="form-control mb-2" />
        <input type="text" name="title.ar" placeholder="Title (AR)" onChange={handleChange} className="form-control mb-2" />

        <input type="text" name="description.en" placeholder="Description (EN)" onChange={handleChange} className="form-control mb-2" />
        <input type="text" name="description.ar" placeholder="Description (AR)" onChange={handleChange} className="form-control mb-2" />

        <input type="text" name="country.en" placeholder="Country (EN)" onChange={handleChange} className="form-control mb-2" />
        <input type="text" name="country.ar" placeholder="Country (AR)" onChange={handleChange} className="form-control mb-2" />

        <input type="text" name="region.en" placeholder="Region (EN)" onChange={handleChange} className="form-control mb-2" />
        <input type="text" name="region.ar" placeholder="Region (AR)" onChange={handleChange} className="form-control mb-2" />

        <input type="number" step="any" name="lng" placeholder="Longitude" onChange={handleChange} className="form-control mb-2" />
        <input type="number" step="any" name="lat" placeholder="Latitude" onChange={handleChange} className="form-control mb-2" />

        <select name="priority" onChange={handleChange} className="form-control mb-2">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="form-control mb-2" />

        <button type="submit" className="btn btn-primary">Submit Case</button>
      </form>
    </div>
  );
};

export default CreateCasePage;
