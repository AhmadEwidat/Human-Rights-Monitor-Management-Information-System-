import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Fix for default marker icon
const icon = L.icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationPicker({ value, onChange }) {
  const [position, setPosition] = useState(value || [31.5, 34.47]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setPosition(coords);
          if (onChange) onChange(coords);
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const newPosition = [e.latlng.lat, e.latlng.lng];
        setPosition(newPosition);
        if (onChange) onChange(newPosition);
      },
    });
    return position ? <Marker position={position} icon={icon} /> : null;
  }

  return (
    <div style={{ margin: "24px 0" }}>
      <MapContainer
        center={position}
        zoom={8}
        style={{ height: 300, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
      <div style={{ marginTop: 8, fontSize: 14, color: "#374151" }}>
        الإحداثيات: {position[0].toFixed(6)}, {position[1].toFixed(6)}
      </div>
    </div>
  );
}

function SubmitReportForm() {
  const navigate = useNavigate();
  const [isNewCase, setIsNewCase] = useState(true); // Simulated
  const [violationOptions, setViolationOptions] = useState([
    { name_en: "Physical Violence" },
    { name_en: "Harassment" },
    { name_en: "Discrimination" },
    { name_en: "Verbal Abuse" },
    { name_en: "Property Damage" }
  ]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedInput, setFocusedInput] = useState(null);
  const [isFileHovered, setIsFileHovered] = useState(false);

  const [reportData, setReportData] = useState({
    reporter_type: "victim",
    contact_info: { email: "", phone: "", preferred_contact: "email" },
    incident_details: {
      date: "",
      description: "",
      violation_types: [],
      location_str: "",
      coordinates: [31.5, 34.47],
    },
    pseudonym: "",
    evidence: [],
  });

  const validateForm = () => {
    const newErrors = {};
    if (!reportData.incident_details.description) {
      newErrors.description = "Description is required";
    }
    if (!reportData.incident_details.location_str) {
      newErrors.location = "Location is required";
    }
    if (!reportData.incident_details.date) {
      newErrors.date = "Date is required";
    }
    if (!isAnonymous && !reportData.contact_info.email) {
      newErrors.email = "Email is required";
    }
    if (reportData.incident_details.violation_types.length === 0) {
      newErrors.violation_types = "At least one violation type is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("contact_info.")) {
      const field = name.split(".")[1];
      setReportData((prev) => ({
        ...prev,
        contact_info: { ...prev.contact_info, [field]: value },
      }));
    } else if (name.startsWith("incident_details.")) {
      const field = name.split(".")[1];
      setReportData((prev) => ({
        ...prev,
        incident_details: { ...prev.incident_details, [field]: value },
      }));
    } else {
      setReportData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleViolationTypesChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (opt) => opt.value
    );
    setReportData((prev) => ({
      ...prev,
      incident_details: {
        ...prev.incident_details,
        violation_types: selectedOptions,
      },
    }));
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 5) {
      alert("Maximum 5 files allowed");
      return;
    }
    setReportData((prev) => ({ ...prev, evidence: files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // تحضير البيانات للإرسال
      const formData = new FormData();
      
      // إضافة البيانات الأساسية
      formData.append('reporter_type', reportData.reporter_type);
      formData.append('anonymous', isAnonymous);
      if (isAnonymous && reportData.pseudonym) {
        formData.append('pseudonym', reportData.pseudonym);
      }
      
      // إضافة معلومات الاتصال إذا لم يكن التقرير مجهولاً
      if (!isAnonymous) {
        formData.append('contact_info', JSON.stringify(reportData.contact_info));
      }
      
      // إضافة تفاصيل الحادثة
      const incidentDetails = {
        ...reportData.incident_details,
        coordinates: reportData.incident_details.coordinates
      };
      formData.append('incident_details', JSON.stringify(incidentDetails));
      
      // إضافة الموقع النصي
      formData.append('location_str', reportData.incident_details.location_str);
      
      // إضافة الملفات
      if (reportData.evidence && reportData.evidence.length > 0) {
        Array.from(reportData.evidence).forEach(file => {
          formData.append('evidence', file);
        });
      }

      // إضافة معرف المستخدم (يمكن تعديله حسب احتياجاتك)
      formData.append('created_by', 'anonymous_user');

      // إرسال البيانات إلى الخادم
      const response = await axios.post('/api/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        toast.success('تم إرسال التقرير بنجاح');
        // إعادة توجيه المستخدم إلى صفحة التأكيد
        navigate('/reports/success');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(error.response?.data?.detail || 'حدث خطأ أثناء إرسال التقرير');
    } finally {
      setIsSubmitting(false);
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
    inputFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    inputError: {
      borderColor: '#ef4444'
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
    multiSelect: {
      padding: '0.75rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'all 0.2s ease',
      outline: 'none',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      minHeight: '120px'
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
    fullWidth: {
      gridColumn: '1 / -1'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            {isNewCase ? "Create New Case" : "Submit Report"}
          </h1>
          <p style={styles.subtitle}>
            Fill out the form below to submit your report
          </p>
        </div>
        
        <div style={styles.formContent}>
          <div>
            {/* Reporter Type */}
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="reporter_type">Reporter Type</label>
              <select
                id="reporter_type"
                name="reporter_type"
                value={reportData.reporter_type}
                onChange={handleChange}
                disabled={isSubmitting}
                onFocus={() => setFocusedInput('reporter_type')}
                onBlur={() => setFocusedInput(null)}
                style={{
                  ...styles.select,
                  ...(focusedInput === 'reporter_type' ? styles.inputFocus : {})
                }}
              >
                <option value="victim">Victim</option>
                <option value="witness">Witness</option>
              </select>
            </div>

            {/* Anonymous Checkbox */}
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={() => setIsAnonymous(!isAnonymous)}
                disabled={isSubmitting}
                style={styles.checkbox}
              />
              <label htmlFor="anonymous" style={styles.checkboxLabel}>
                Would you like to submit this report anonymously?
              </label>
            </div>

            {/* Pseudonym for Anonymous */}
            {isAnonymous && (
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="pseudonym">Pseudonym (Optional)</label>
                <input
                  id="pseudonym"
                  type="text"
                  name="pseudonym"
                  value={reportData.pseudonym}
                  onChange={handleChange}
                  placeholder="Optional alias"
                  disabled={isSubmitting}
                  onFocus={() => setFocusedInput('pseudonym')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'pseudonym' ? styles.inputFocus : {})
                  }}
                />
              </div>
            )}

            {/* Contact Information for Non-Anonymous */}
            {!isAnonymous && (
              <div style={styles.grid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label} htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    name="contact_info.email"
                    value={reportData.contact_info.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    disabled={isSubmitting}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    style={{
                      ...styles.input,
                      ...(focusedInput === 'email' ? styles.inputFocus : {}),
                      ...(errors.email ? styles.inputError : {})
                    }}
                  />
                  {errors.email && <div style={styles.errorText}>{errors.email}</div>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label} htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    name="contact_info.phone"
                    value={reportData.contact_info.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    disabled={isSubmitting}
                    onFocus={() => setFocusedInput('phone')}
                    onBlur={() => setFocusedInput(null)}
                    style={{
                      ...styles.input,
                      ...(focusedInput === 'phone' ? styles.inputFocus : {})
                    }}
                  />
                </div>

                <div style={{...styles.inputGroup, ...styles.fullWidth}}>
                  <label style={styles.label} htmlFor="preferred_contact">Preferred Contact Method</label>
                  <select
                    id="preferred_contact"
                    name="contact_info.preferred_contact"
                    value={reportData.contact_info.preferred_contact}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    onFocus={() => setFocusedInput('preferred_contact')}
                    onBlur={() => setFocusedInput(null)}
                    style={{
                      ...styles.select,
                      ...(focusedInput === 'preferred_contact' ? styles.inputFocus : {})
                    }}
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
              </div>
            )}

            {/* Incident Details */}
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="description">Violation Description *</label>
              <textarea
                id="description"
                name="incident_details.description"
                value={reportData.incident_details.description}
                onChange={handleChange}
                placeholder="Please describe what happened in detail..."
                disabled={isSubmitting}
                onFocus={() => setFocusedInput('description')}
                onBlur={() => setFocusedInput(null)}
                style={{
                  ...styles.textarea,
                  ...(focusedInput === 'description' ? styles.inputFocus : {}),
                  ...(errors.description ? styles.inputError : {})
                }}
              />
              {errors.description && <div style={styles.errorText}>{errors.description}</div>}
            </div>

            <div style={styles.grid}>
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="violation_types">Violation Types *</label>
                <select
                  id="violation_types"
                  name="incident_details.violation_types"
                  multiple
                  value={reportData.incident_details.violation_types}
                  onChange={handleViolationTypesChange}
                  disabled={isSubmitting}
                  onFocus={() => setFocusedInput('violation_types')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.multiSelect,
                    ...(focusedInput === 'violation_types' ? styles.inputFocus : {}),
                    ...(errors.violation_types ? styles.inputError : {})
                  }}
                >
                  {violationOptions.map((type, index) => (
                    <option key={index} value={type.name_en}>
                      {type.name_en}
                    </option>
                  ))}
                </select>
                {errors.violation_types && <div style={styles.errorText}>{errors.violation_types}</div>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="location">Location *</label>
                <input
                  id="location"
                  type="text"
                  name="incident_details.location_str"
                  value={reportData.incident_details.location_str}
                  onChange={handleChange}
                  placeholder="Where did this incident occur?"
                  disabled={isSubmitting}
                  onFocus={() => setFocusedInput('location')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'location' ? styles.inputFocus : {}),
                    ...(errors.location ? styles.inputError : {})
                  }}
                />
                {errors.location && <div style={styles.errorText}>{errors.location}</div>}
              </div>

              <div style={{...styles.inputGroup, ...styles.fullWidth}}>
                <label style={styles.label} htmlFor="date">Date of Incident *</label>
                <input
                  id="date"
                  type="date"
                  name="incident_details.date"
                  value={reportData.incident_details.date}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  onFocus={() => setFocusedInput('date')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'date' ? styles.inputFocus : {}),
                    ...(errors.date ? styles.inputError : {})
                  }}
                />
                {errors.date && <div style={styles.errorText}>{errors.date}</div>}
              </div>
            </div>

            {/* Evidence Upload */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Upload Evidence (Max 5 files)</label>
              <div
                style={{
                  ...styles.fileUpload,
                  ...(isFileHovered ? styles.fileUploadHover : {})
                }}
                onMouseEnter={() => setIsFileHovered(true)}
                onMouseLeave={() => setIsFileHovered(false)}
                onClick={() => document.getElementById('evidence-input').click()}
              >
                <svg style={styles.uploadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div style={styles.uploadText}>Click to upload evidence</div>
                <div style={styles.uploadSubtext}>Images, videos, PDF files up to 10MB each</div>
                <input
                  id="evidence-input"
                  type="file"
                  name="evidence"
                  multiple
                  accept="image/*,video/*,application/pdf"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  style={styles.fileInput}
                />
              </div>
              {reportData.evidence && reportData.evidence.length > 0 && (
                <div style={styles.selectedFiles}>
                  📎 Selected files: {Array.from(reportData.evidence).map(f => f.name).join(', ')}
                </div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>اختر الموقع على الخريطة</label>
              <LocationPicker
                value={reportData.incident_details.coordinates}
                onChange={(coords) =>
                  setReportData((prev) => ({
                    ...prev,
                    incident_details: { ...prev.incident_details, coordinates: coords },
                  }))
                }
              />
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
                disabled={isSubmitting}
                style={{
                  ...styles.button,
                  ...styles.submitButton,
                  ...(isSubmitting ? styles.submitButtonDisabled : {})
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = '#1d4ed8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = '#1e40af';
                  }
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubmitReportForm;