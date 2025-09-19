import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import JobListings from './components/user/JobListings';
import ApplicationFormV2 from './components/user/ApplicationFormV2';
import MyApplications from './components/user/MyApplications';
import AdminJobsManager from './components/admin/AdminJobsManager';
import JobPostEditor from './components/admin/JobPostEditor';
import ApplicationsManager from './components/admin/ApplicationsManager';
import DatabaseSetup from './components/admin/DatabaseSetup';
import PrivateRoute from './components/PrivateRoute';
import './styles/main.css';
import './styles/application.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* User Routes */}
          <Route path="/" element={<JobListings />} />
          <Route path="/jobs" element={<JobListings />} />
          <Route 
            path="/apply/:jobId" 
            element={
              <PrivateRoute>
                <ApplicationFormV2 />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/my-applications" 
            element={
              <PrivateRoute>
                <MyApplications />
              </PrivateRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <PrivateRoute>
                <ApplicationsManager />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/jobs" 
            element={
              <PrivateRoute>
                <AdminJobsManager />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/jobs/new" 
            element={
              <PrivateRoute>
                <JobPostEditor />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/jobs/edit/:id" 
            element={
              <PrivateRoute>
                <JobPostEditor />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/applications" 
            element={
              <PrivateRoute>
                <ApplicationsManager />
              </PrivateRoute>
            } 
          />
          <Route path="/setup" element={<DatabaseSetup />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;