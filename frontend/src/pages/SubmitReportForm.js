import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import "./SubmitReportForm.css";

function SubmitReportForm() {
  const { t, i18n } = useTranslation();
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [isNewCase, setIsNewCase] = useState(!caseId);
  const [violationOptions, setViolationOptions] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleFileChange = (e) => {
    setReportData((prev) => ({ ...prev, evidence: e.target.files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      Array.from(reportData.evidence).forEach((file) => formData.append("evidence", file));
    }

    try {
      const url = isNewCase
        ? "http://localhost:8000/cases/new-with-report/"
        : `http://localhost:8000/reports/?case_id=${caseId}`
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` },
      });
      if (response.ok) {
        alert(t("reportSuccess") || "تم إرسال التقرير بنجاح ✅");
        navigate("/institution-cases");
      } else {
        const res = await response.json();
        alert(t("reportFailed") + ": " + (res.message || response.statusText));
      }
    } catch (err) {
      alert(t("reportError") + ": " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-form-container">
      <h2>{t("submitTitle")}</h2>
      {isNewCase && <h3>{t("newCaseTitle") || "إنشاء قضية جديدة"}</h3>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>
          {t("reporterType")}:
          <select
            name="reporter_type"
            onChange={handleChange}
            value={reportData.reporter_type}
            disabled={isSubmitting}
          >
            <option value="victim">{t("victim")}</option>
            <option value="witness">{t("witness")}</option>
          </select>
        </label>

        <label>
          {t("anonymousQuestion")}
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={() => setIsAnonymous(!isAnonymous)}
            disabled={isSubmitting}
          />
        </label>

        {isAnonymous && (
          <label>
            {t("pseudonym")}:
            <input
              type="text"
              name="pseudonym"
              onChange={handleChange}
              placeholder={t("optionalAlias")}
              disabled={isSubmitting}
            />
          </label>
        )}

        {!isAnonymous && (
          <>
            <label>
              {t("email")}:
              <input
                type="email"
                name="contact_info.email"
                onChange={handleChange}
                placeholder={t("placeholderEmail")}
                disabled={isSubmitting}
              />
            </label>
            <label>
              {t("phone")}:
              <input
                type="text"
                name="contact_info.phone"
                onChange={handleChange}
                placeholder={t("placeholderPhone")}
                disabled={isSubmitting}
              />
            </label>
            <label>
              {t("preferredContact")}:
              <select
                name="contact_info.preferred_contact"
                onChange={handleChange}
                value={reportData.contact_info.preferred_contact}
                disabled={isSubmitting}
              >
                <option value="email">{t("email")}</option>
                <option value="phone">{t("phone")}</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </label>
          </>
        )}

        <label>
          {t("violationDescription")}:
          <textarea
            name="incident_details.description"
            onChange={handleChange}
            placeholder={t("placeholderDescription")}
            disabled={isSubmitting}
          />
        </label>

        <label>
          {t("violationTypes")}:
          <select
            multiple
            name="incident_details.violation_types"
            onChange={(e) =>
              setReportData((prev) => ({
                ...prev,
                incident_details: {
                  ...prev.incident_details,
                  violation_types: Array.from(e.target.selectedOptions, (opt) => opt.value),
                },
              }))
            }
            disabled={isSubmitting}
          >
            {Array.isArray(violationOptions) &&
              violationOptions.map((type, index) => (
                <option key={index} value={type.name_en}>
                  {type[`name_${i18n.language}`]}
                </option>
              ))}
          </select>
        </label>

        <label>
          {t("location")}:
          <input
            type="text"
            name="incident_details.location_str"
            onChange={handleChange}
            placeholder={t("placeholderLocation")}
            disabled={isSubmitting}
          />
        </label>

        <label>
          {t("date")}:
          <input
            type="date"
            name="incident_details.date"
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </label>

        <label>
          {t("uploadEvidence")}:
          <input
            type="file"
            name="evidence"
            multiple
            accept="image/*,video/*,application/pdf"
            onChange={handleFileChange}
            disabled={isSubmitting}
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("submitting") || "جارٍ الإرسال..." : t("submitButton")}
        </button>
      </form>
    </div>
  );
}

export default SubmitReportForm;