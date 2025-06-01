import React from 'react';
import ManageCases from './pages/ManageCases';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import Navbar from './components/Navbar';
import InstitutionNavbar from './components/InstitutionNavbar';
import AdminNavbar from './components/AdminNavbar';
import CreateCasePage from './pages/CreateNewCase';

import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminWelcome from './pages/AdminWelcome';
import InstitutionWelcome from './pages/InstitutionWelcome';
import CaseDetails from "./pages/CaseDetails";
import SubmitReportForm from './pages/SubmitReportForm';
import UpdateCase from "./pages/UpdateCase";


function AppLayout() {
  const location = useLocation();
  const { pathname } = location;

  // استخرج التوكن
  const token = localStorage.getItem('jwt_token');
  let role = '';

  // إذا موجود، فك تشفير الـ role من التوكن
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = payload?.role?.toLowerCase() || '';
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  // المسارات التي لا يظهر فيها أي Navbar
  const hideNavbarPaths = ['/login'];

  return (
    <>
      {!hideNavbarPaths.includes(pathname) && (
        role === 'admin' ? <AdminNavbar />
        : role === 'institution' ? <InstitutionNavbar />
        : <Navbar />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-welcome" element={<AdminWelcome />} />
        <Route path="/institution-welcome" element={<InstitutionWelcome />} />
        <Route path="/admin/cases" element={<ManageCases />} />;
        <Route path="/admin/cases/create" element={<CreateCasePage />} />
        <Route path="/admin/cases/create" element={<CreateCasePage />} />
        <Route path="/cases/:caseId" element={<CaseDetails />} />
        <Route path="/cases/:caseId/update" element={<UpdateCase />} />

        

        {/* تأكد أن هذا هو الرابط المستخدم في NavLink */}
        <Route path="/institution-create-case" element={<SubmitReportForm />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
