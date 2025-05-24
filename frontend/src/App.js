import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// استيراد المكونات والصفحات
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminWelcome from './pages/AdminWelcome';          // صفحة ترحيب الأدمن
import InvestigatorWelcome from './pages/InvestigatorWelcome'; // صفحة ترحيب المحقق

// هذا الكمبوننت يحدد متى يظهر الـ Navbar (يخفيه في صفحة اللوجين فقط)
function AppLayout() {
  const location = useLocation();
  const hideNavbarPaths = ['/login'];

  return (
    <>
      {/* إذا لم يكن في صفحة اللوجين، أظهر الـ Navbar */}
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-welcome" element={<AdminWelcome />} />              {/* أدمن */}
        <Route path="/investigator-welcome" element={<InvestigatorWelcome />} /> {/* محقق */}
      </Routes>
    </>
  );
}

// نقطة البداية للتطبيق
function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
