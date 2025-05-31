import React, { useEffect, useState } from "react";
import "./LoginPage.css";
import illustration from "../assets/loginLogo.jpg";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || t("loginFailed"));
        setIsLoading(false);
        return;
      }

      // ✅ تخزين التوكن
      localStorage.setItem("jwt_token", data.access_token);

      // ✅ استخراج البيانات من التوكن
      const decoded = jwtDecode(data.access_token);
      const userRole = decoded.role ? decoded.role.toLowerCase() : "";
      const userId = decoded.sub;
      const usernameFromToken = decoded.username;

      // ✅ التحقق من صلاحية التوكن (اختياري)
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        setError(t("tokenExpired"));
        setIsLoading(false);
        return;
      }

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
      setError(t("serverError"));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="login-left">
          <h1 className="app-name" style={{ textAlign: "center", color: "#5e9268", marginBottom: "10px" }}>
            Monitor Palestine 360
          </h1>
          <h3 className="login-title" style={{ textAlign: "center", color: "#888", marginBottom: "25px" }}>
            {t("institutionLogin")}
          </h3>
          {error && <p className="error" style={{ color: "red", textAlign: "center" }}>{error}</p>}
          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="text"
              placeholder={t("username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
            <input
              type="password"
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <div className="login-options">
              <label>
                <input type="checkbox" disabled={isLoading} /> {t("remember")}
              </label>
              <a href="#" className="forgot-password">
                {t("forgot")}
              </a>
            </div>
            <button
              type="submit"
              style={{
                backgroundColor: "#5e9268",
                color: "white",
                padding: "15px",
                border: "none",
                borderRadius: "30px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: isLoading ? "not-allowed" : "pointer",
                width: "100%",
                transition: "background-color 0.3s ease",
                opacity: isLoading ? 0.7 : 1,
              }}
              disabled={isLoading}
            >
              {isLoading ? t("loading") : t("submit")}
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