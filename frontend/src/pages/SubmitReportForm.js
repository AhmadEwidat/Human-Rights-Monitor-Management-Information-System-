import React, { useState, useEffect } from "react";
import 'leaflet/dist/leaflet.css';
import './SubmitReportForm.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

function SubmitReportForm() {
  const [violationOptions, setViolationOptions] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [otherCaseType, setOtherCaseType] = useState("");
  const [reportData, setReportData] = useState({
    reporter_type: "victim",
    contact_info: { email: "", phone: "", preferred_contact: "email" },
    incident_details: {
      date: "",
      description: "",
      violation_types: [],
      location_str: "",
      suggested_case_name: ""
    },
    pseudonym: "",
    evidence: [],
  });

  useEffect(() => {
    fetch("http://localhost:8000/case-types")
      .then(res => res.json())
      .then(data => setViolationOptions(data))
      .catch(err => console.error("Failed to fetch case types:", err));
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!reportData.incident_details.description) newErrors.description = "Description is required";
    if (!reportData.incident_details.location_str) newErrors.location = "Location is required";
    if (!reportData.incident_details.date) newErrors.date = "Date is required";
    if (!isAnonymous && !reportData.contact_info.email) newErrors.email = "Email is required";
    if (reportData.incident_details.violation_types.length === 0 && !reportData.incident_details.suggested_case_name) newErrors.violation_types = "At least one case type or suggestion is required";
    
    // Check if email is valid
    if (reportData.contact_info.email && !/\S+@\S+\.\S+/.test(reportData.contact_info.email)) {
      newErrors.email = "Please provide a valid email address.";
    }

    // Check if phone number is valid
    if (reportData.contact_info.phone && !/^\d{10}$/.test(reportData.contact_info.phone)) {
      newErrors.phone = "Please provide a valid phone number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("contact_info.")) {
      const field = name.split(".")[1];
      setReportData(prev => ({ ...prev, contact_info: { ...prev.contact_info, [field]: value } }));
    } else if (name.startsWith("incident_details.")) {
      const field = name.split(".")[1];
      setReportData(prev => ({ ...prev, incident_details: { ...prev.incident_details, [field]: value } }));
    } else {
      setReportData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleViolationTypesChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, opt => opt.value);
    setReportData(prev => ({
      ...prev,
      incident_details: {
        ...prev.incident_details,
        violation_types: selectedOptions,
        suggested_case_name: selectedOptions.includes("other") ? otherCaseType : ""
      },
    }));
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 5) {
      alert("Maximum 5 files allowed");
      return;
    }
    setReportData(prev => ({ ...prev, evidence: files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Ensure that the case suggestion is not empty if "other" is selected
    if (reportData.incident_details.violation_types.includes("other") && !otherCaseType) {
      alert("Please suggest a valid case type.");
      setIsSubmitting(false);
      return;
    }

    if (reportData.incident_details.violation_types.includes("other") && otherCaseType) {
      try {
        const suggestRes = await fetch("http://localhost:8000/case-types", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: otherCaseType }),
        });

        const suggestResult = await suggestRes.json();
        if (!suggestRes.ok) throw new Error(suggestResult.message || "Suggestion failed");

        console.log("Suggestion submitted:", suggestResult);
      } catch (err) {
        alert("Failed to submit suggestion: " + err.message);
        console.error("Suggestion error:", err);
        setIsSubmitting(false);
        return;
      }
    }

    // Prepare the form data
    const formData = new FormData();
    formData.append("anonymous", isAnonymous);
    formData.append("reporter_type", reportData.reporter_type);
    formData.append("incident_details", JSON.stringify(reportData.incident_details));
    formData.append("created_by", localStorage.getItem("username"));

    if (isAnonymous) {
      formData.append("pseudonym", reportData.pseudonym || "");
    } else {
      formData.append("contact_info", JSON.stringify(reportData.contact_info));
    }

    if (reportData.evidence && reportData.evidence.length > 0) {
      Array.from(reportData.evidence).forEach((file) => {
        formData.append("evidence", file);
      });
    }

    formData.append("location_str", reportData.incident_details.location_str);

    try {
      const token = localStorage.getItem("jwt_token");
      const res = await fetch("http://localhost:8000/reports/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Submission failed");

      alert("Report submitted successfully!");
      console.log("Report ID:", result.report_id);
    } catch (err) {
      alert("Submission failed: " + err.message);
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  function LocationPicker({ onChange }) {
    const [position, setPosition] = useState([31.9, 35.2]);

    function LocationMarker() {
      useMapEvents({
        click(e) {
          const coords = [e.latlng.lat, e.latlng.lng];
          setPosition(coords);
          reverseGeocode(coords);
        }
      });
      return <Marker position={position} />;
    }

    const reverseGeocode = ([lat, lng]) => {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          const address = data.display_name;
          setReportData(prev => ({
            ...prev,
            incident_details: {
              ...prev.incident_details,
              location_str: address,
            }
          }));
          onChange([lat, lng]);
        })
        .catch(err => {
          console.error("Failed to fetch address:", err);
          setReportData(prev => ({
            ...prev,
            incident_details: {
              ...prev.incident_details,
              location_str: `${lat}, ${lng}`,
            }
          }));
          onChange([lat, lng]);
        });
    };

    return (
      <MapContainer
        center={position}
        zoom={8}
        scrollWheelZoom={true}
        style={{ height: "300px", width: "100%", marginBottom: "24px", borderRadius: "12px", border: "2px solid #1976d2" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker />
      </MapContainer>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, direction: "ltr", textAlign: "left" }}>
      <h2 style={{ marginBottom: 16 }}>Create New Report</h2>

      <label>Reporter Type</label>
      <select name="reporter_type" value={reportData.reporter_type} onChange={handleChange}>
        <option value="victim">Victim</option>
        <option value="witness">Witness</option>
      </select>

      <div>
        <label>
          <input type="checkbox" checked={isAnonymous} onChange={() => setIsAnonymous(!isAnonymous)} />
          Submit Anonymously
        </label>
      </div>

      {isAnonymous ? (
        <input type="text" name="pseudonym" value={reportData.pseudonym} onChange={handleChange} placeholder="Pseudonym" />
      ) : (
        <>
          <input type="email" name="contact_info.email" value={reportData.contact_info.email} onChange={handleChange} placeholder="Email" />
          <input type="tel" name="contact_info.phone" value={reportData.contact_info.phone} onChange={handleChange} placeholder="Phone" />
          <select name="contact_info.preferred_contact" value={reportData.contact_info.preferred_contact} onChange={handleChange}>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </>
      )}

      <textarea name="incident_details.description" value={reportData.incident_details.description} onChange={handleChange} placeholder="Describe the incident"></textarea>

      <input type="date" name="incident_details.date" value={reportData.incident_details.date} onChange={handleChange} />

      <label>Click on the map to select the location</label>
      <LocationPicker onChange={() => {}} />

      <input type="text" name="incident_details.location_str" value={reportData.incident_details.location_str} onChange={handleChange} placeholder="Location description (e.g., Gaza City)" />

      <label>Case Types</label>
      <select name="incident_details.violation_types" multiple value={reportData.incident_details.violation_types} onChange={handleViolationTypesChange}>
        {violationOptions.map((type, idx) => (
          <option key={idx} value={type._id}>{type.name || "Unnamed Type"}</option>
        ))}
        <option value="other">Other (suggest a new type)</option>
      </select>

      {reportData.incident_details.violation_types.includes("other") && (
        <input type="text" placeholder="Suggest a new case type" value={otherCaseType} onChange={(e) => {
          setOtherCaseType(e.target.value);
          setReportData(prev => ({
            ...prev,
            incident_details: {
              ...prev.incident_details,
              suggested_case_name: e.target.value
            }
          }));
        }} />
      )}

      <label>Upload Evidence</label>
      <input type="file" multiple accept="image/*,video/*,application/pdf" onChange={handleFileChange} />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Report"}
      </button>
    </form>
  );
}

export default SubmitReportForm;
