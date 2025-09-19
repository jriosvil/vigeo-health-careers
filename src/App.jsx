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
// Mobile Components
import MobileLogin from './components/mobile/auth/MobileLogin';
import MobileSignup from './components/mobile/auth/MobileSignup';
import MobileJobListings from './components/mobile/user/MobileJobListings';
import MobileApplicationForm from './components/mobile/user/MobileApplicationForm';
import MobileMyApplications from './components/mobile/user/MobileMyApplications';
import MobileProfile from './components/mobile/user/MobileProfile';
import MobileJobDetails from './components/mobile/user/MobileJobDetails';
import MobileDetector from './components/mobile/shared/MobileDetector';
import JobDetails from './components/user/JobDetails';
import PrivateRoute from './components/PrivateRoute';
import './styles/main.css';
import './styles/application.css';
import './styles/mobile/mobile.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <MobileDetector>
          <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Mobile Auth Routes */}
          <Route path="/mobile/login" element={<MobileLogin />} />
          <Route path="/mobile/signup" element={<MobileSignup />} />
          
          {/* User Routes */}
          <Route path="/" element={<JobListings />} />
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/jobs/:jobId" element={<JobDetails />} />
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

          {/* Mobile User Routes */}
          <Route path="/mobile" element={<Navigate to="/mobile/jobs" replace />} />
          <Route 
            path="/mobile/jobs" 
            element={
              <PrivateRoute>
                <MobileJobListings />
              </PrivateRoute>
            } 
          />
          <Route path="/mobile/jobs/:jobId" element={<MobileJobDetails />} />
          <Route 
            path="/mobile/apply/:jobId" 
            element={
              <PrivateRoute>
                <MobileApplicationForm />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/mobile/applications" 
            element={
              <PrivateRoute>
                <MobileMyApplications />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/mobile/profile" 
            element={
              <PrivateRoute>
                <MobileProfile />
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
        </MobileDetector>
      </AuthProvider>
    </Router>
  );
}

export default App;