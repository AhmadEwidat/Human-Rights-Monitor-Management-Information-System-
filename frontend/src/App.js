import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminWelcome from './pages/AdminWelcome';
import InvestigatorWelcome from './pages/InvestigatorWelcome';
import SubmitReportForm from './pages/SubmitReportForm';

// ✅ لازم نفتح الدالة هنا
function AppLayout() {
  const location = useLocation();
  const hideNavbarPaths = ['/login'];

  return (
    <>
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-welcome" element={<AdminWelcome />} />
        <Route path="/investigator-welcome" element={<InvestigatorWelcome />} />
        <Route path="/submit-report" element={<SubmitReportForm />} />
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
