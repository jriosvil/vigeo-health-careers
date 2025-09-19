import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, query, where, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { collections } from '../../firebase/schema';
import Navbar from '../layout/Navbar';

const MyApplications = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchApplications();
  }, [currentUser]);

  const fetchApplications = async () => {
    try {
      const appsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications');
      const q = query(
        appsCollection, 
        where('applicantId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const appsList = [];
      
      querySnapshot.forEach((doc) => {
        appsList.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by createdAt descending
      appsList.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return dateB - dateA;
      });
      
      setApplications(appsList);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'gray',
      'new': 'blue', 
      'under_review': 'yellow',
      'interview_scheduled': 'purple',
      'hired': 'green',
      'not_hired': 'red'
    };
    return colors[status] || 'gray';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'draft': 'Draft - Not Submitted',
      'new': 'Submitted - Pending Review',
      'under_review': 'Under Review',
      'interview_scheduled': 'Interview Scheduled',
      'hired': 'Hired!',
      'not_hired': 'Not Selected'
    };
    return statusTexts[status] || status;
  };

  const handleContinueApplication = (jobId, jobTitle) => {
    navigate(`/apply/${jobId}`, { state: { jobTitle } });
  };

  const handleDeleteApplication = async (appId, status) => {
    const confirmMessage = status === 'draft' 
      ? 'Are you sure you want to delete this draft application?'
      : 'Are you sure you want to withdraw this application?';
    
    if (window.confirm(confirmMessage)) {
      try {
        const appsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications');
        await deleteDoc(doc(appsCollection, appId));
        
        // Remove from local state
        setApplications(prev => prev.filter(app => app.id !== appId));
        
        alert(status === 'draft' ? 'Draft deleted successfully' : 'Application withdrawn successfully');
      } catch (error) {
        console.error('Error deleting application:', error);
        alert('Error deleting application. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="my-applications-page">
      <Navbar />
      
      <div className="applications-container">
        <div className="applications-header">
          <h1>My Applications</h1>
          <button 
            onClick={() => navigate('/jobs')}
            className="btn btn-primary"
          >
            Browse Jobs
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="empty-state glass-card">
            <h3>No Applications Yet</h3>
            <p>You haven't started any job applications.</p>
            <button 
              onClick={() => navigate('/jobs')}
              className="btn btn-primary"
            >
              Browse Available Positions
            </button>
          </div>
        ) : (
          <div className="applications-grid">
            {applications.map(app => (
              <div key={app.id} className="application-card glass-card">
                <div className="application-header">
                  <h3>{app.jobTitle}</h3>
                  <span className={`status-badge ${getStatusColor(app.status)}`}>
                    {getStatusText(app.status)}
                  </span>
                </div>

                <div className="application-details">
                  <p className="application-date">
                    <strong>Started:</strong> {new Date(app.createdAt.toDate()).toLocaleDateString()}
                  </p>
                  
                  {app.submittedAt && (
                    <p className="application-date">
                      <strong>Submitted:</strong> {new Date(app.submittedAt.toDate()).toLocaleDateString()}
                    </p>
                  )}

                  {app.status === 'interview_scheduled' && app.interviewScheduledDate && (
                    <div className="interview-info">
                      <p className="interview-date">
                        <strong>Interview Date:</strong> {new Date(app.interviewScheduledDate.toDate()).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {app.reviewedAt && (
                    <p className="reviewed-info">
                      <strong>Last Updated:</strong> {new Date(app.reviewedAt.toDate()).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="application-actions">
                  {app.status === 'draft' ? (
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleContinueApplication(app.jobId, app.jobTitle)}
                        className="btn btn-primary"
                      >
                        Continue Application
                      </button>
                      <button 
                        onClick={() => handleDeleteApplication(app.id, app.status)}
                        className="btn btn-danger"
                      >
                        Delete Draft
                      </button>
                    </div>
                  ) : (
                    <div className="status-message">
                      {app.status === 'new' && (
                        <p>Your application has been received and is pending review.</p>
                      )}
                      {app.status === 'under_review' && (
                        <p>Your application is being reviewed by our team.</p>
                      )}
                      {app.status === 'interview_scheduled' && (
                        <p>Congratulations! An interview has been scheduled.</p>
                      )}
                      {app.status === 'hired' && (
                        <p className="success-message">🎉 Congratulations! You've been hired!</p>
                      )}
                      {app.status === 'not_hired' && (
                        <p>Thank you for your interest. We've decided to move forward with other candidates.</p>
                      )}
                      {(app.status === 'new' || app.status === 'under_review') && (
                        <button 
                          onClick={() => handleDeleteApplication(app.id, app.status)}
                          className="btn btn-danger btn-sm"
                          style={{ marginTop: '10px' }}
                        >
                          Withdraw Application
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;