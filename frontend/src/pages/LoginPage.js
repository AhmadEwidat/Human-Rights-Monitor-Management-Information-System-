import React, { useEffect } from 'react';
import './LoginPage.css';
import illustration from '../assets/loginLogo.jpg'; // عدّل حسب اسم الصورة
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);
const handleLogin = async (e) => {
  e.preventDefault();
  const username = e.target[0].value;
  const password = e.target[1].value;

  try {
    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role: "" })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || "Login failed");
      return;
    }

    localStorage.setItem("role", data.role);
    localStorage.setItem("username", username);

    // 🟢 التوجيه حسب الدور
    if (data.role.toLowerCase() === "admin") {
      navigate("/admin-welcome");
    } else if (data.role.toLowerCase() === "investigator") {
      navigate("/investigator-welcome");
    } else {
      navigate("/dashboard");
    }
  } catch (err) {
    alert("Error connecting to server");
    console.error(err);
  }
};

  return (
    <div className="login-wrapper">
    

      <div className="login-box">
        <div className="login-left">
          <h2 className="login-title">{t('loginTitle')}</h2>
          <p className="login-subtitle">{t('loginSubtitle')}</p>
          <form className="login-form" onSubmit={handleLogin}>
            <input type="text" placeholder={t('username')} required />
            <input type="password" placeholder={t('password')} required />
            <div className="login-options">
              <label><input type="checkbox" /> {t('remember')}</label>
              <a href="#" className="forgot-password">{t('forgot')}</a>
            </div>
            <button type="submit" className="submit-btn">{t('submit')}</button>
          </form>
        </div>

        <div className="login-right">
          <img src={illustration} alt="Security Illustration" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
