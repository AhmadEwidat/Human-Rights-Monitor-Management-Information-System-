// src/pages/InstitutionDashboard.js

import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  FaPlusSquare, // أيقونة لإضافة بلاغ جديد
  FaSignOutAlt, // أيقونة لتسجيل الخروج
} from "react-icons/fa";

const InstitutionDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // فقط عنصر قائمة واحد لـ "Add New Report"
  const menuItems = [
    { label: "Add New Report", path: "/institution/reports/new", icon: <FaPlusSquare /> },
    { label: "Logout", path: "/login", icon: <FaSignOutAlt /> },
  ];

  const sidebarStyle = {
    width: "240px",
    background: "#1e293b", // خلفية داكنة للشريط الجانبي
    color: "#fff",
    padding: "2rem 1rem",
    boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "sticky", // Make it sticky so it stays in place
    top: 0, // Align to the top of the viewport
    alignSelf: "flex-start", // Ensures it takes its own height
  };

  const menuItemStyle = (path) => ({
    padding: "12px 16px",
    marginBottom: "12px",
    borderRadius: "8px",
    // ✅ تم تغيير لون الخلفية للعنصر النشط ليطابق لون لوحة تحكم المشرف
    backgroundColor: location.pathname.startsWith(path) ? "#ff9800" : "transparent",
    color: location.pathname.startsWith(path) ? "#fff" : "#cbd5e1",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  });

  const handleNavigation = (path) => navigate(path);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* الشريط الجانبي */}
      <aside style={sidebarStyle}>
        <div>
          <h2 style={{ marginBottom: "2rem", textAlign: "center", fontSize: "20px" }}>
            Institution Panel
          </h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {menuItems.map((item, index) => (
              <li
                key={index}
                style={menuItemStyle(item.path)}
                onClick={() => handleNavigation(item.path)}
                onMouseEnter={e => {
                    if (!location.pathname.startsWith(item.path))
                        e.currentTarget.style.backgroundColor = '#374151';
                }}
                onMouseLeave={e => {
                    if (!location.pathname.startsWith(item.path))
                        e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.icon}
                {item.label}
              </li>
            ))}
          </ul>
        </div>
        <footer style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8" }}>
          © 2025 HRMIS
        </footer>
      </aside>

      {/* المحتوى الرئيسي */}
      <main style={{ flex: 1, padding: "3rem", background: "#f9fafb" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default InstitutionDashboard;