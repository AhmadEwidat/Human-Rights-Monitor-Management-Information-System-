import React, { useState } from "react";

const CreateCasePage = () => {
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
      console.log("Form submitted:", formData);
      alert("Case created successfully!");
    } catch (error) {
      console.error("Error creating case:", error);
      alert("Error creating case.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create New Case</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="case_id"
          value={formData.case_id}
          onChange={handleChange}
          placeholder="Case ID"
          required
        />
        <input
          name="title.en"
          value={formData.title.en}
          onChange={handleChange}
          placeholder="Title (EN)"
          required
        />
        <input
          name="title.ar"
          value={formData.title.ar}
          onChange={handleChange}
          placeholder="Title (AR)"
          required
        />
        <textarea
          name="description.en"
          value={formData.description.en}
          onChange={handleChange}
          placeholder="Description (EN)"
          required
        />
        <textarea
          name="description.ar"
          value={formData.description.ar}
          onChange={handleChange}
          placeholder="Description (AR)"
          required
        />
        <input
          name="country.en"
          value={formData.location.country.en}
          onChange={handleChange}
          placeholder="Country (EN)"
          required
        />
        <input
          name="country.ar"
          value={formData.location.country.ar}
          onChange={handleChange}
          placeholder="Country (AR)"
          required
        />
        <input
          name="region.en"
          value={formData.location.region.en}
          onChange={handleChange}
          placeholder="Region (EN)"
          required
        />
        <input
          name="region.ar"
          value={formData.location.region.ar}
          onChange={handleChange}
          placeholder="Region (AR)"
          required
        />
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
        <select name="priority" value={formData.priority} onChange={handleChange}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
        {selectedFile && <p>Selected: {selectedFile.name}</p>}
        <button type="submit">Create Case</button>
      </form>
    </div>
  );
};

export default CreateCasePage;
