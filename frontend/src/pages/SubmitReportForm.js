import React, { useState, useEffect } from "react";
import 'leaflet/dist/leaflet.css';
import './SubmitReportForm.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '2rem 1rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  formWrapper: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden'
  },
  header: {
    backgroundColor: '#1e40af',
    color: 'white',
    padding: '2rem',
    borderBottom: '1px solid #e5e7eb'
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '700',
    margin: '0',
    letterSpacing: '-0.025em'
  },
  subtitle: {
    fontSize: '1rem',
    opacity: '0.9',
    margin: '0.5rem 0 0 0',
    fontWeight: '400'
  },
  formContent: {
    padding: '2rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '1.5rem'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  input: {
    padding: '0.75rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    backgroundColor: '#ffffff'
  },
  textarea: {
    padding: '0.75rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    backgroundColor: '#ffffff',
    resize: 'vertical',
    minHeight: '100px'
  },
  select: {
    padding: '0.75rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    marginBottom: '1.5rem'
  },
  checkbox: {
    width: '1.25rem',
    height: '1.25rem',
    cursor: 'pointer'
  },
  checkboxLabel: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer'
  },
  errorText: {
    fontSize: '0.875rem',
    color: '#ef4444',
    marginTop: '0.25rem'
  },
  fileUpload: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    padding: '2rem',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    backgroundColor: '#f9fafb',
    marginBottom: '1.5rem'
  },
  fileInput: {
    display: 'none'
  },
  selectedFiles: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '6px',
    fontSize: '0.875rem',
    color: '#0c4a6e'
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    paddingTop: '2rem',
    borderTop: '1px solid #e5e7eb'
  },
  button: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    outline: 'none'
  },
  submitButton: {
    backgroundColor: '#1e40af',
    color: 'white',
    border: '2px solid #1e40af'
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    borderColor: '#9ca3af',
    cursor: 'not-allowed'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1.5rem'
  },
  mapContainer: {
    height: '300px',
    width: '100%',
    marginBottom: '24px',
    borderRadius: '12px',
    border: '2px solid #1e40af'
  }
};

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
        style={styles.mapContainer}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker />
      </MapContainer>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>Submit Report</h1>
          <p style={styles.subtitle}>Report a human rights violation or incident</p>
        </div>
        <div style={styles.formContent}>
          <form onSubmit={handleSubmit}>
            <div style={styles.grid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Reporter Type</label>
                <select 
                  style={styles.select}
                  name="reporter_type" 
                  value={reportData.reporter_type} 
                  onChange={handleChange}
                >
                  <option value="victim">Victim</option>
                  <option value="witness">Witness</option>
                </select>
              </div>

              <div style={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  style={styles.checkbox}
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous(!isAnonymous)}
                  id="anonymous"
                />
                <label style={styles.checkboxLabel} htmlFor="anonymous">
                  Submit Anonymously
                </label>
              </div>

              {isAnonymous ? (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Pseudonym</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="pseudonym"
                    value={reportData.pseudonym}
                    onChange={handleChange}
                    placeholder="Enter a pseudonym"
                  />
                </div>
              ) : (
                <>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Email</label>
                    <input
                      style={styles.input}
                      type="email"
                      name="contact_info.email"
                      value={reportData.contact_info.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                    />
                    {errors.email && <div style={styles.errorText}>{errors.email}</div>}
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Phone</label>
                    <input
                      style={styles.input}
                      type="tel"
                      name="contact_info.phone"
                      value={reportData.contact_info.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && <div style={styles.errorText}>{errors.phone}</div>}
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Preferred Contact Method</label>
                    <select
                      style={styles.select}
                      name="contact_info.preferred_contact"
                      value={reportData.contact_info.preferred_contact}
                      onChange={handleChange}
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                </>
              )}

              <div style={styles.inputGroup}>
                <label style={styles.label}>Incident Date</label>
                <input
                  style={styles.input}
                  type="date"
                  name="incident_details.date"
                  value={reportData.incident_details.date}
                  onChange={handleChange}
                  required
                />
                {errors.date && <div style={styles.errorText}>{errors.date}</div>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={styles.textarea}
                  name="incident_details.description"
                  value={reportData.incident_details.description}
                  onChange={handleChange}
                  placeholder="Describe the incident in detail"
                  required
                />
                {errors.description && <div style={styles.errorText}>{errors.description}</div>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Violation Types</label>
                <select
                  style={styles.select}
                  multiple
                  name="violation_types"
                  value={reportData.incident_details.violation_types}
                  onChange={handleViolationTypesChange}
                  required
                >
                  {violationOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                  <option value="other">Other (Please specify)</option>
                </select>
                {errors.violation_types && <div style={styles.errorText}>{errors.violation_types}</div>}
              </div>

              {reportData.incident_details.violation_types.includes("other") && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Specify Other Violation Type</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={otherCaseType}
                    onChange={(e) => setOtherCaseType(e.target.value)}
                    placeholder="Enter the violation type"
                  />
                </div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Location</label>
              <LocationPicker onChange={(coords) => console.log(coords)} />
              <input
                style={styles.input}
                type="text"
                name="incident_details.location_str"
                value={reportData.incident_details.location_str}
                onChange={handleChange}
                placeholder="Location will be set from the map"
                required
              />
              {errors.location && <div style={styles.errorText}>{errors.location}</div>}
            </div>

            <div style={styles.fileUpload}>
              <input
                type="file"
                style={styles.fileInput}
                onChange={handleFileChange}
                multiple
                id="file-upload"
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Click to upload evidence files
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Maximum 5 files allowed
                </div>
              </label>
              {reportData.evidence && reportData.evidence.length > 0 && (
                <div style={styles.selectedFiles}>
                  Selected files: {Array.from(reportData.evidence).map(file => file.name).join(', ')}
                </div>
              )}
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="submit"
                style={{
                  ...styles.button,
                  ...styles.submitButton,
                  ...(isSubmitting && styles.submitButtonDisabled)
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SubmitReportForm;
