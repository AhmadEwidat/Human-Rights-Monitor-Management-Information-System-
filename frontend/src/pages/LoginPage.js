import React, { useEffect } from 'react';
import './LoginPage.css';
import illustration from '../assets/loginLogo.jpg';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

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
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Login failed");
        return;
      }

      // ✅ تخزين التوكن
      localStorage.setItem("jwt_token", data.access_token);

      // ✅ استخراج البيانات من التوكن
      const decoded = jwtDecode(data.access_token);
      const userRole = decoded.role ? decoded.role.toLowerCase() : "";
      const userId = decoded.sub;
      const usernameFromToken = decoded.username;

      // ✅ تخزين البيانات في localStorage
      localStorage.setItem("user_id", userId);
      localStorage.setItem("username", usernameFromToken);
      localStorage.setItem("role", userRole);

      // ✅ التوجيه حسب الدور
      if (userRole === "admin") {
        navigate("/admin-welcome");
      } else if (userRole === "institution") {
        navigate("/institution-welcome");
      } else {
        navigate("/login");
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
          <h1 className="app-name" style={{ textAlign: 'center', color: '#5e9268', marginBottom: '10px' }}>
            Monitor Palestine 360
          </h1>
          <h3 className="login-title" style={{ textAlign: 'center', color: '#888', marginBottom: '25px' }}>
            {t('institutionLogin')}
          </h3>
          <form className="login-form" onSubmit={handleLogin}>
            <input type="text" placeholder={t('username')} required />
            <input type="password" placeholder={t('password')} required />
            <div className="login-options">
              <label><input type="checkbox" /> {t('remember')}</label>
              <a href="#" className="forgot-password">{t('forgot')}</a>
            </div>
            <button
              type="submit"
              style={{
                backgroundColor: '#5e9268',
                color: 'white',
                padding: '15px',
                border: 'none',
                borderRadius: '30px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%',
                transition: 'background-color 0.3s ease'
              }}
            >
              {t('submit')}
            </button>
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
