import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import "./SubmitReportForm.css";

function SubmitReportForm() {
  const { t } = useTranslation();
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [isNewCase, setIsNewCase] = useState(!caseId);
  const [violationOptions, setViolationOptions] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const role = localStorage.getItem("role");

  const [reportData, setReportData] = useState({
    reporter_type: "victim",
    contact_info: { email: "", phone: "", preferred_contact: "email" },
    incident_details: {
      date: "",
      description: "",
      violation_types: [],
      location_str: "",
    },
    pseudonym: "",
    evidence: [],
  });

  useEffect(() => {
    if (role !== "institution") {
      navigate("/login");
      return;
    }
    fetch("http://localhost:8000/case-types")
      .then((res) => res.json())
      .then((data) => setViolationOptions(Array.isArray(data) ? data : []))
      .catch(() => setViolationOptions([]));
  }, [role, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!reportData.incident_details.description) {
      newErrors.description = t("descriptionRequired");
    }
    if (!reportData.incident_details.location_str) {
      newErrors.location = t("locationRequired");
    }
    if (!reportData.incident_details.date) {
      newErrors.date = t("dateRequired");
    }
    if (!isAnonymous && !reportData.contact_info.email) {
      newErrors.email = t("emailRequired");
    }
    if (reportData.incident_details.violation_types.length === 0) {
      newErrors.violation_types = t("violationTypesRequired");
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
      alert(t("maxFiles"));
      return;
    }
    setReportData((prev) => ({ ...prev, evidence: files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const userId = localStorage.getItem("user_id");
    const formData = new FormData();
    formData.append("anonymous", String(isAnonymous));
    formData.append("reporter_type", reportData.reporter_type);
    formData.append("created_by", userId);

    const incident_details = {
      date: reportData.incident_details.date,
      description: reportData.incident_details.description,
      violation_types: reportData.incident_details.violation_types,
    };
    formData.append("incident_details", JSON.stringify(incident_details));
    formData.append("location_str", reportData.incident_details.location_str);

    if (!isAnonymous) {
      const contact_info = {
        email: reportData.contact_info.email,
        phone: reportData.contact_info.phone,
        preferred_contact: reportData.contact_info.preferred_contact,
      };
      formData.append("contact_info", JSON.stringify(contact_info));
    } else if (isAnonymous && reportData.pseudonym) {
      formData.append("pseudonym", reportData.pseudonym);
    }

    if (reportData.evidence && reportData.evidence.length > 0) {
      Array.from(reportData.evidence).forEach((file) =>
        formData.append("evidence", file)
      );
    }

    try {
      const url = isNewCase
        ? "http://localhost:8000/cases/new-with-report/"
        : `http://localhost:8000/reports/?case_id=${caseId}`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` },
      });
      if (response.ok) {
        alert(t("reportSuccess"));
        navigate("/institution-my-cases");
      } else {
        const errorData = await response.json();
        alert(t("reportFailed") + ": " + (errorData.message || response.statusText));
      }
    } catch (err) {
      alert(t("reportError") + ": " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="report-form-container"
      style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}
    >
      <h2>{isNewCase ? t("createNewCase") : t("submitReport")}</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div style={{ marginBottom: "1rem" }}>
          <label>{t("reporterType")}:</label>
          <select
            name="reporter_type"
            onChange={handleChange}
            value={reportData.reporter_type}
            disabled={isSubmitting}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="victim">{t("victim")}</option>
            <option value="witness">{t("witness")}</option>
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={() => setIsAnonymous(!isAnonymous)}
              disabled={isSubmitting}
            />
            {t("anonymousQuestion")}
          </label>
        </div>

        {isAnonymous && (
          <div style={{ marginBottom: "1rem" }}>
            <label>{t("pseudonym")}:</label>
            <input
              type="text"
              name="pseudonym"
              onChange={handleChange}
              placeholder={t("optionalAlias")}
              disabled={isSubmitting}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
        )}

        {!isAnonymous && (
          <>
            <div style={{ marginBottom: "1rem" }}>
              <label>{t("email")}:</label>
              <input
                type="email"
                name="contact_info.email"
                onChange={handleChange}
                placeholder={t("placeholderEmail")}
                disabled={isSubmitting}
                style={{ width: "100%", padding: "0.5rem" }}
              />
              {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>{t("phone")}:</label>
              <input
                type="text"
                name="contact_info.phone"
                onChange={handleChange}
                placeholder={t("placeholderPhone")}
                disabled={isSubmitting}
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>{t("preferredContact")}:</label>
              <select
                name="contact_info.preferred_contact"
                onChange={handleChange}
                value={reportData.contact_info.preferred_contact}
                disabled={isSubmitting}
                style={{ width: "100%", padding: "0.5rem" }}
              >
                <option value="email">{t("email")}</option>
                <option value="phone">{t("phone")}</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
          </>
        )}

        <div style={{ marginBottom: "1rem" }}>
          <label>{t("violationDescription")}:</label>
          <textarea
            name="incident_details.description"
            onChange={handleChange}
            placeholder={t("placeholderDescription")}
            disabled={isSubmitting}
            style={{ width: "100%", padding: "0.5rem", minHeight: "100px" }}
          />
          {errors.description && (
            <p style={{ color: "red" }}>{errors.description}</p>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>{t("violationTypes")}:</label>
          <select
            multiple
            name="incident_details.violation_types"
            onChange={handleViolationTypesChange}
            disabled={isSubmitting}
            style={{ width: "100%", padding: "0.5rem", minHeight: "100px" }}
          >
            {violationOptions.map((type, index) => (
              <option key={index} value={type.name_en}>
                {type.name_en} {/* Changed: Use type.name_en directly or translate if needed */}
              </option>
            ))}
          </select>
          {errors.violation_types && (
            <p style={{ color: "red" }}>{errors.violation_types}</p>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>{t("location")}:</label>
          <input
            type="text"
            name="incident_details.location_str"
            onChange={handleChange}
            placeholder={t("placeholderLocation")}
            disabled={isSubmitting}
            style={{ width: "100%", padding: "0.5rem" }}
          />
          {errors.location && <p style={{ color: "red" }}>{errors.location}</p>}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>{t("date")}:</label>
          <input
            type="date"
            name="incident_details.date"
            onChange={handleChange}
            disabled={isSubmitting}
            style={{ width: "100%", padding: "0.5rem" }}
          />
          {errors.date && <p style={{ color: "red" }}>{errors.date}</p>}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>{t("uploadEvidence")} (Max 5 files):</label>
          <input
            type="file"
            name="evidence"
            multiple
            accept="image/*,video/*,application/pdf"
            onChange={handleFileChange}
            disabled={isSubmitting}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            background: "#2e7d32",
            color: "white",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "4px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? t("submitting") : t("submitButton")}
        </button>
      </form>
    </div>
  );
}

export default SubmitReportForm;