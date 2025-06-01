import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import Navbar from './components/Navbar';
import InstitutionNavbar from './components/InstitutionNavbar';
import AdminNavbar from './components/AdminNavbar';

import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminWelcome from './pages/AdminWelcome';
import InstitutionWelcome from './pages/InstitutionWelcome';
import CaseDetails from './pages/CaseDetails';
import SubmitReportForm from './pages/SubmitReportForm';
import CasesList from './pages/CasesList';
import AdminReports from './pages/AdminReports';
import Statistics from './pages/Statistics';
import ReportsPage from './pages/ReportsPage';
import ManageCases from './pages/ManageCases';
import CreateCasePage from './pages/CreateNewCase';
import UpdateCase from './pages/UpdateCase';

import './index.css';

function AppLayout() {
  const location = useLocation();
  const { pathname } = location;

  const token = localStorage.getItem('jwt_token');
  let role = '';

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = payload?.role?.toLowerCase() || '';
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  const hideNavbarPaths = ['/login'];

  return (
    <>
      {!hideNavbarPaths.includes(pathname) && (
        role === 'admin' ? <AdminNavbar /> : role === 'institution' ? <InstitutionNavbar /> : <Navbar />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-welcome" element={<AdminWelcome />} />
        <Route path="/institution-dashboard" element={<InstitutionWelcome />} />
        <Route path="/institution-my-cases" element={<CasesList />} />
        <Route path="/institution-create-new-case" element={<SubmitReportForm />} />
        <Route path="/institution-create-report/:caseId" element={<SubmitReportForm />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/admin-reports" element={<AdminReports />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/admin/cases" element={<ManageCases />} />
        <Route path="/admin/cases/create" element={<CreateCasePage />} />
        <Route path="/cases/:caseId" element={<CaseDetails />} />
        <Route path="/cases/:caseId/update" element={<UpdateCase />} />
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
