import React, { useState } from "react";
import "./LoginPage.css";
import illustration from "../assets/loginLogo.jpg";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
        setError(data.detail || "Login failed. Please try again.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("jwt_token", data.access_token);

      const decoded = jwtDecode(data.access_token);
      const userRole = decoded.role ? decoded.role.toLowerCase() : "";
      const userId = decoded.sub;
      const usernameFromToken = decoded.username;

      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        setError("Token expired. Please log in again.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("user_id", userId);
      localStorage.setItem("username", usernameFromToken);
      localStorage.setItem("role", userRole);

      if (userRole === "admin") {
        navigate("/admin-welcome");
      } else if (userRole === "institution") {
        navigate("/institution-welcome");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
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
            Institution Login
          </h3>
          {error && <p className="error" style={{ color: "red", textAlign: "center" }}>{error}</p>}
          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <div className="login-options">
              <label>
                <input type="checkbox" disabled={isLoading} /> Remember Me
              </label>
              <a href="#" className="forgot-password">
                Forgot Password?
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
              {isLoading ? "Loading..." : "Login"}
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
