import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { collections } from '../../../firebase/schema';
import { generateApplicationPDF } from '../../../utils/brandedPdfGenerator';
import MobileNavbar from '../layout/MobileNavbar';

const MobileMyApplications = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchUserApplications();
    }
  }, [currentUser]);

  const fetchUserApplications = async () => {
    try {
      const appsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications');
      const q = query(appsCollection, where('applicantId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const userApps = [];
      querySnapshot.forEach((doc) => {
        userApps.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by most recent
      userApps.sort((a, b) => {
        const dateA = a.updatedAt?.toDate() || a.createdAt?.toDate() || new Date(0);
        const dateB = b.updatedAt?.toDate() || b.createdAt?.toDate() || new Date(0);
        return dateB - dateA;
      });
      
      setApplications(userApps);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueApplication = (appId, jobTitle) => {
    const application = applications.find(app => app.id === appId);
    if (application) {
      navigate(`/mobile/apply/${application.jobId}`, { state: { jobTitle } });
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      const appRef = doc(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications', appId);
      await deleteDoc(appRef);
      
      // Remove from local state
      setApplications(prev => prev.filter(app => app.id !== appId));
      alert('Application deleted successfully.');
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Error deleting application. Please try again.');
    }
  };

  const downloadApplication = async (application) => {
    try {
      await generateApplicationPDF(application);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return '#64748b';
      case 'submitted': case 'new': return '#3b82f6';
      case 'under_review': return '#f59e0b';
      case 'interview_scheduled': return '#8b5cf6';
      case 'hired': return '#10b981';
      case 'not_hired': case 'rejected': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'submitted': case 'new': return 'Submitted';
      case 'under_review': return 'Under Review';
      case 'interview_scheduled': return 'Interview Scheduled';
      case 'hired': return 'Hired';
      case 'not_hired': case 'rejected': return 'Not Selected';
      default: return status?.replace('_', ' ') || 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="mobile-page">
        <MobileNavbar />
        <div className="mobile-content">
          <div className="mobile-loading-container">
            <div className="mobile-spinner"></div>
            <p className="mobile-loading-text">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-page">
      <MobileNavbar />
      
      <div className="mobile-content">
        <div className="mobile-container">
          {/* Header */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: 'var(--mobile-spacing-xl)',
            paddingTop: 'var(--mobile-spacing-lg)'
          }}>
            <h1 style={{ 
              fontSize: 'var(--mobile-text-2xl)', 
              fontWeight: '700',
              color: 'var(--mobile-primary)',
              marginBottom: 'var(--mobile-spacing-sm)'
            }}>
              My Applications
            </h1>
            <p style={{ 
              fontSize: 'var(--mobile-text-base)',
              color: 'var(--mobile-gray)'
            }}>
              {applications.length === 0 ? 'No applications yet' : 
               `${applications.length} application${applications.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Empty State */}
          {applications.length === 0 && (
            <div className="mobile-card mobile-fade-in">
              <div className="mobile-card-body" style={{ textAlign: 'center', padding: 'var(--mobile-spacing-2xl)' }}>
                <h3 style={{ 
                  fontSize: 'var(--mobile-text-lg)', 
                  fontWeight: '600',
                  marginBottom: 'var(--mobile-spacing-sm)'
                }}>
                  No Applications Yet
                </h3>
                <p style={{ 
                  color: 'var(--mobile-gray)', 
                  marginBottom: 'var(--mobile-spacing-lg)'
                }}>
                  Start your career journey by browsing our available positions.
                </p>
                <button 
                  onClick={() => navigate('/mobile/jobs')}
                  className="mobile-btn mobile-btn-primary"
                >
                  Browse Jobs
                </button>
              </div>
            </div>
          )}

          {/* Applications List */}
          {applications.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--mobile-spacing-lg)' }}>
              {applications.map(application => (
                <div key={application.id} className="mobile-card mobile-fade-in">
                  {/* Application Header */}
                  <div className="mobile-card-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontSize: 'var(--mobile-text-lg)', 
                          fontWeight: '600',
                          marginBottom: 'var(--mobile-spacing-xs)',
                          lineHeight: '1.3'
                        }}>
                          {application.jobTitle}
                        </h3>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 'var(--mobile-spacing-xs)',
                          background: getStatusColor(application.status),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: 'var(--mobile-text-xs)',
                          fontWeight: '600'
                        }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'white'
                          }}></div>
                          {getStatusText(application.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="mobile-card-body">
                    {/* Dates */}
                    <div style={{ marginBottom: 'var(--mobile-spacing-md)' }}>
                      <p style={{ 
                        fontSize: 'var(--mobile-text-sm)',
                        color: 'var(--mobile-gray)',
                        marginBottom: 'var(--mobile-spacing-xs)'
                      }}>
                        <strong>Applied:</strong> {application.createdAt ? 
                          new Date(application.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
                      </p>
                      {application.submittedAt && (
                        <p style={{ 
                          fontSize: 'var(--mobile-text-sm)',
                          color: 'var(--mobile-gray)',
                          marginBottom: 'var(--mobile-spacing-xs)'
                        }}>
                          <strong>Submitted:</strong> {new Date(application.submittedAt.toDate()).toLocaleDateString()}
                        </p>
                      )}
                      <p style={{ 
                        fontSize: 'var(--mobile-text-sm)',
                        color: 'var(--mobile-gray)'
                      }}>
                        <strong>Last Updated:</strong> {application.updatedAt ? 
                          new Date(application.updatedAt.toDate()).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>

                    {/* Progress Summary */}
                    {application.status === 'draft' && (
                      <div style={{ 
                        background: '#fef3c7',
                        border: '1px solid #fcd34d',
                        padding: 'var(--mobile-spacing-sm)',
                        borderRadius: '8px',
                        marginBottom: 'var(--mobile-spacing-md)'
                      }}>
                        <p style={{ 
                          fontSize: 'var(--mobile-text-sm)',
                          color: '#92400e',
                          fontWeight: '600'
                        }}>
                          Application in progress - Complete and submit when ready
                        </p>
                      </div>
                    )}

                    {/* Application Stats */}
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 'var(--mobile-spacing-md)',
                      marginBottom: 'var(--mobile-spacing-lg)',
                      fontSize: 'var(--mobile-text-sm)'
                    }}>
                      <div>
                        <span style={{ color: 'var(--mobile-gray)' }}>Education:</span>
                        <strong> {application.education?.length || 0}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--mobile-gray)' }}>Licenses:</span>
                        <strong> {application.licenses?.length || 0}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--mobile-gray)' }}>Employment:</span>
                        <strong> {application.employment?.length || 0}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--mobile-gray)' }}>Documents:</span>
                        <strong> {application.documents?.length || 0}</strong>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--mobile-spacing-sm)' }}>
                      {application.status === 'draft' ? (
                        <>
                          <button 
                            onClick={() => handleContinueApplication(application.id, application.jobTitle)}
                            className="mobile-btn mobile-btn-primary"
                          >
                            Continue Application
                          </button>
                          <button 
                            onClick={() => handleDeleteApplication(application.id)}
                            className="mobile-btn mobile-btn-outline"
                            style={{ 
                              borderColor: '#ef4444', 
                              color: '#ef4444',
                              fontSize: 'var(--mobile-text-sm)'
                            }}
                          >
                            Delete Draft
                          </button>
                        </>
                      ) : (
                        <div style={{ display: 'flex', gap: 'var(--mobile-spacing-sm)' }}>
                          <button 
                            onClick={() => downloadApplication(application)}
                            className="mobile-btn mobile-btn-outline"
                            style={{ flex: 1, fontSize: 'var(--mobile-text-sm)' }}
                          >
                            Download PDF
                          </button>
                          <button 
                            onClick={() => handleDeleteApplication(application.id)}
                            className="mobile-btn mobile-btn-outline"
                            style={{ 
                              borderColor: '#ef4444', 
                              color: '#ef4444',
                              fontSize: 'var(--mobile-text-sm)',
                              flex: 1
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMyApplications;