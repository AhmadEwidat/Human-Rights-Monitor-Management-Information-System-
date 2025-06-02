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
      // Simulated API call
      console.log("Form submitted:", formData);
      alert("Case created successfully!");
    } catch (error) {
      console.error("Error creating case:", error);
      alert("Error creating case.");
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    formWrapper: {
      maxWidth: '1200px',
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
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    fullWidth: {
      gridColumn: '1 / -1'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column'
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
    inputFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
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
      backgroundColor: '#f9fafb'
    },
    fileUploadHover: {
      borderColor: '#3b82f6',
      backgroundColor: '#eff6ff'
    },
    fileInput: {
      display: 'none'
    },
    uploadIcon: {
      width: '48px',
      height: '48px',
      color: '#6b7280',
      marginBottom: '1rem'
    },
    uploadText: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    uploadSubtext: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    selectedFile: {
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
    cancelButton: {
      backgroundColor: '#ffffff',
      color: '#374151',
      border: '2px solid #d1d5db'
    },
    submitButton: {
      backgroundColor: '#1e40af',
      color: 'white',
      border: '2px solid #1e40af'
    },
    submitButtonHover: {
      backgroundColor: '#1d4ed8'
    }
  };

  const [focusedInput, setFocusedInput] = useState(null);
  const [isFileHovered, setIsFileHovered] = useState(false);

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create New Case</h1>
          <p style={styles.subtitle}>Fill out the form below to create a new case record</p>
        </div>
        
        <div style={styles.formContent}>
          <div onSubmit={handleSubmit}>
            <div style={styles.grid}>
              <div style={{...styles.inputGroup, ...styles.fullWidth}}>
                <label style={styles.label} htmlFor="case_id">Case ID *</label>
                <input
                  id="case_id"
                  type="text"
                  name="case_id"
                  value={formData.case_id}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('case_id')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'case_id' ? styles.inputFocus : {})
                  }}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="title_en">Title (English) *</label>
                <input
                  id="title_en"
                  type="text"
                  name="title.en"
                  value={formData.title.en}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('title_en')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'title_en' ? styles.inputFocus : {})
                  }}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="title_ar">Title (Arabic) *</label>
                <input
                  id="title_ar"
                  type="text"
                  name="title.ar"
                  value={formData.title.ar}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('title_ar')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'title_ar' ? styles.inputFocus : {})
                  }}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="description_en">Description (English) *</label>
                <textarea
                  id="description_en"
                  name="description.en"
                  value={formData.description.en}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('description_en')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.textarea,
                    ...(focusedInput === 'description_en' ? styles.inputFocus : {})
                  }}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="description_ar">Description (Arabic) *</label>
                <textarea
                  id="description_ar"
                  name="description.ar"
                  value={formData.description.ar}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('description_ar')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.textarea,
                    ...(focusedInput === 'description_ar' ? styles.inputFocus : {})
                  }}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="country_en">Country (English) *</label>
                <input
                  id="country_en"
                  type="text"
                  name="country.en"
                  value={formData.location.country.en}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('country_en')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'country_en' ? styles.inputFocus : {})
                  }}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="country_ar">Country (Arabic) *</label>
                <input
                  id="country_ar"
                  type="text"
                  name="country.ar"
                  value={formData.location.country.ar}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('country_ar')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'country_ar' ? styles.inputFocus : {})
                  }}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="region_en">Region (English) *</label>
                <input
                  id="region_en"
                  type="text"
                  name="region.en"
                  value={formData.location.region.en}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('region_en')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'region_en' ? styles.inputFocus : {})
                  }}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="region_ar">Region (Arabic) *</label>
                <input
                  id="region_ar"
                  type="text"
                  name="region.ar"
                  value={formData.location.region.ar}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('region_ar')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'region_ar' ? styles.inputFocus : {})
                  }}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('status')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.select,
                    ...(focusedInput === 'status' ? styles.inputFocus : {})
                  }}
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('priority')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.select,
                    ...(focusedInput === 'priority' ? styles.inputFocus : {})
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div style={{...styles.inputGroup, ...styles.fullWidth}}>
                <label style={styles.label}>Evidence Upload</label>
                <div
                  style={{
                    ...styles.fileUpload,
                    ...(isFileHovered ? styles.fileUploadHover : {})
                  }}
                  onMouseEnter={() => setIsFileHovered(true)}
                  onMouseLeave={() => setIsFileHovered(false)}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <svg style={styles.uploadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div style={styles.uploadText}>Click to upload evidence</div>
                  <div style={styles.uploadSubtext}>PDF, DOC, JPG, PNG up to 10MB</div>
                  <input
                    id="file-input"
                    type="file"
                    style={styles.fileInput}
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                </div>
                {selectedFile && (
                  <div style={styles.selectedFile}>
                    📎 Selected file: {selectedFile.name}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="button"
                style={{...styles.button, ...styles.cancelButton}}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ffffff';
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                style={{...styles.button, ...styles.submitButton}}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#1e40af';
                }}
              >
                Create Case
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCasePage;