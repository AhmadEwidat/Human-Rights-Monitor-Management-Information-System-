import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./SubmitReportForm.css";

function SubmitReportForm() {
  const { t, i18n } = useTranslation();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [violationOptions, setViolationOptions] = useState([]);

  const [reportData, setReportData] = useState({
    reporter_type: "victim",
    contact_info: {
      email: "",
      phone: "",
      preferred_contact: "email",
    },
    incident_details: {
      date: "",
      country: "",
      city: "",
      coordinates: { lat: "", lng: "" },
      description: "",
      violation_types: [],
    },
    pseudonym: "",
    evidence: [],
  });

  useEffect(() => {
    fetch("http://localhost:8000/case-types")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setViolationOptions(data);
        } else {
          setViolationOptions([]);
        }
      })
      .catch(() => setViolationOptions([]));
  }, []);

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

    const formData = new FormData();

    formData.append("anonymous", String(isAnonymous));
    formData.append("reporter_type", reportData.reporter_type);

    const incident_details = {
      date: reportData.incident_details.date,
      location: {
        country: reportData.incident_details.country,
        city: reportData.incident_details.city,
        coordinates: {
          lat: reportData.incident_details.coordinates.lat,
          lng: reportData.incident_details.coordinates.lng,
          // أو لو تريد GeoJSON (احذف التعليق من السطرين بالأسفل)
          // type: "Point",
          // coordinates: [
          //   Number(reportData.incident_details.coordinates.lng),
          //   Number(reportData.incident_details.coordinates.lat)
          // ]
        }
      },
      description: reportData.incident_details.description,
      violation_types: reportData.incident_details.violation_types,
    };
    formData.append("incident_details", JSON.stringify(incident_details));

    if (!isAnonymous) {
      const contact_info = {
        email: reportData.contact_info.email,
        phone: reportData.contact_info.phone,
        preferred_contact: reportData.contact_info.preferred_contact,
      };
      formData.append("contact_info", JSON.stringify(contact_info));
    }

    if (isAnonymous && reportData.pseudonym) {
      formData.append("pseudonym", reportData.pseudonym);
    }

    if (reportData.evidence && reportData.evidence.length > 0) {
      Array.from(reportData.evidence).forEach((file) => {
        formData.append("evidence", file);
      });
    }

    try {
      const response = await fetch("http://localhost:8000/reports/", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        alert(t("reportSuccess") || "تم إرسال التقرير بنجاح ✅");
      } else {
        const res = await response.json();
        alert(t("reportFailed") + ": " + (res.message || response.statusText));
      }
    } catch (err) {
      alert(t("reportError") + ": " + err.message);
    }
  };

  return (
    <div className="report-form-container">
      <h2 style={{ color: '#b30000' }}>{t("submitTitle")}</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label style={{ marginBottom: "10px", color: "#b30000" }}>
          {t("reporterType")}:
          <select name="reporter_type" onChange={handleChange}>
            <option value="victim">{t("victim")}</option>
            <option value="witness">{t("witness")}</option>
          </select>
        </label>
        <label style={{ marginBottom: "10px", color: "#b30000" }}>
          {t("anonymousQuestion")}
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={() => setIsAnonymous(!isAnonymous)}
          />
        </label>
        {isAnonymous && (
          <label style={{ marginBottom: "10px", color: "#b30000" }}>
            {t("pseudonym")}:
            <input
              type="text"
              name="pseudonym"
              onChange={handleChange}
              placeholder={t("optionalAlias")}
            />
          </label>
        )}
        {!isAnonymous && (
          <>
            <label style={{ marginBottom: "10px", color: "#b30000" }}>
              {t("email")}:
              <input
                type="email"
                name="contact_info.email"
                onChange={handleChange}
                placeholder={t("placeholderEmail")}
              />
            </label>
            <label style={{ marginBottom: "10px", color: "#b30000" }}>
              {t("phone")}:
              <input
                type="text"
                name="contact_info.phone"
                onChange={handleChange}
                placeholder={t("placeholderPhone")}
              />
            </label>
            <label style={{ marginBottom: "10px", color: "#b30000" }}>
              {t("preferredContact")}:
              <select
                name="contact_info.preferred_contact"
                onChange={handleChange}
              >
                <option value="email">{t("email")}</option>
                <option value="phone">{t("phone")}</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </label>
          </>
        )}
        <label style={{ marginBottom: "10px", color: "#b30000" }}>
          {t("violationDescription")}:
          <textarea
            name="incident_details.description"
            onChange={handleChange}
            placeholder={t("placeholderDescription")}
          />
        </label>
        <label style={{ marginBottom: "10px", color: "#b30000" }}>
          {t("violationTypes")}:
          <select
            multiple
            name="incident_details.violation_types"
            onChange={(e) =>
              setReportData((prev) => ({
                ...prev,
                incident_details: {
                  ...prev.incident_details,
                  violation_types: Array.from(
                    e.target.selectedOptions,
                    (opt) => opt.value
                  ),
                },
              }))
            }
          >
            {Array.isArray(violationOptions) &&
              violationOptions.map((type, index) => (
                <option key={index} value={type.name_en}>
                  {type[`name_${i18n.language}`]}
                </option>
              ))}
          </select>
        </label>
        <label style={{ marginBottom: "10px", color: "#b30000" }}>
          {t("country")}:
          <input
            type="text"
            name="incident_details.country"
            onChange={handleChange}
            placeholder={t("placeholderCountry")}
          />
        </label>
        <label style={{ marginBottom: "10px", color: "#b30000" }}>
          {t("city")}:
          <input
            type="text"
            name="incident_details.city"
            onChange={handleChange}
            placeholder={t("placeholderCity")}
          />
        </label>
        <label style={{ marginBottom: "10px", color: "#b30000" }}>
          {t("coordinates")}:
          <input
            type="text"
            placeholder={t("latitude")}
            onChange={(e) =>
              setReportData((prev) => ({
                ...prev,
                incident_details: {
                  ...prev.incident_details,
                  coordinates: {
                    ...prev.incident_details.coordinates,
                    lat: e.target.value,
                  },
                },
              }))
            }
          />
          <input
            type="text"
            placeholder={t("longitude")}
            onChange={(e) =>
              setReportData((prev) => ({
                ...prev,
                incident_details: {
                  ...prev.incident_details,
                  coordinates: {
                    ...prev.incident_details.coordinates,
                    lng: e.target.value,
                  },
                },
              }))
            }
          />
        </label>
        <label style={{ marginBottom: "10px", color: "#b30000" }}>
          {t("uploadEvidence")}:
          <input
            type="file"
            name="evidence"
            multiple
            accept="image/*,video/*,application/pdf"
            onChange={handleFileChange}
          />
        </label>
        <button type="submit">{t("submitButton")}</button>
      </form>
    </div>
  );
}

export default SubmitReportForm;
