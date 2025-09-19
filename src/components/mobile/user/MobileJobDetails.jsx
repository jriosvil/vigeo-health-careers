import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { collections } from '../../../firebase/schema';
import MobileNavbar from '../layout/MobileNavbar';

const MobileJobDetails = () => {
  const { jobId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userApplicationStatus, setUserApplicationStatus] = useState(null);

  useEffect(() => {
    fetchJobDetails();
    if (currentUser) {
      fetchUserApplicationStatus();
    }
  }, [jobId, currentUser]);

  const fetchJobDetails = async () => {
    try {
      const jobRef = doc(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'jobPostings', jobId);
      const jobDoc = await getDoc(jobRef);
      
      if (jobDoc.exists()) {
        setJob({ id: jobDoc.id, ...jobDoc.data() });
      } else {
        alert('Job not found');
        navigate('/mobile/jobs');
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      alert('Error loading job details');
      navigate('/mobile/jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplicationStatus = async () => {
    try {
      const appsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications');
      const q = query(appsCollection, 
        where('jobId', '==', jobId),
        where('applicantId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const appData = querySnapshot.docs[0].data();
        setUserApplicationStatus(appData.status);
      }
    } catch (error) {
      console.error('Error fetching application status:', error);
    }
  };

  const handleApply = () => {
    if (!currentUser) {
      alert('Please sign in to apply for jobs');
      navigate('/mobile/login');
      return;
    }
    navigate(`/mobile/apply/${jobId}`, { state: { jobTitle: job.title } });
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
      case 'draft': return 'Draft Application';
      case 'submitted': case 'new': return 'Application Submitted';
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
            <p className="mobile-loading-text">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mobile-page">
        <MobileNavbar />
        <div className="mobile-content">
          <div className="mobile-container">
            <div className="mobile-card">
              <div className="mobile-card-body" style={{ textAlign: 'center', padding: 'var(--mobile-spacing-2xl)' }}>
                <h3>Job Not Found</h3>
                <button 
                  onClick={() => navigate('/mobile/jobs')}
                  className="mobile-btn mobile-btn-primary"
                  style={{ marginTop: 'var(--mobile-spacing-lg)' }}
                >
                  Back to Jobs
                </button>
              </div>
            </div>
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
          {/* Back Button */}
          <div style={{ marginBottom: 'var(--mobile-spacing-lg)', paddingTop: 'var(--mobile-spacing-lg)' }}>
            <button 
              onClick={() => navigate('/mobile/jobs')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--mobile-primary)',
                fontSize: 'var(--mobile-text-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--mobile-spacing-xs)'
              }}
            >
              <span style={{ fontSize: '16px' }}>←</span>
              Back to Jobs
            </button>
          </div>

          {/* Job Header */}
          <div className="mobile-card mobile-fade-in">
            <div className="mobile-card-header">
              <h1 style={{ 
                fontSize: 'var(--mobile-text-xl)', 
                fontWeight: '700',
                marginBottom: 'var(--mobile-spacing-sm)',
                lineHeight: '1.3'
              }}>
                {job.title}
              </h1>
              <div style={{
                display: 'inline-block',
                background: 'var(--mobile-secondary)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: 'var(--mobile-text-sm)',
                fontWeight: '600'
              }}>
                {job.type}
              </div>
            </div>

            <div className="mobile-card-body">
              {/* Location and Department */}
              <div style={{ marginBottom: 'var(--mobile-spacing-lg)' }}>
                <p style={{ 
                  fontSize: 'var(--mobile-text-base)',
                  marginBottom: 'var(--mobile-spacing-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--mobile-spacing-sm)'
                }}>
                  <span style={{ fontSize: '18px' }}>📍</span>
                  <strong>{job.location?.city}, {job.location?.state}</strong>
                </p>
                {job.department && (
                  <p style={{ 
                    fontSize: 'var(--mobile-text-base)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--mobile-spacing-sm)',
                    color: 'var(--mobile-gray)'
                  }}>
                    <span style={{ fontSize: '18px' }}>🏢</span>
                    {job.department}
                  </p>
                )}
              </div>

              {/* Salary */}
              {job.salary?.min > 0 && (
                <div style={{ 
                  background: '#f0f9ff',
                  border: '1px solid #0ea5e9',
                  padding: 'var(--mobile-spacing-lg)',
                  borderRadius: 'var(--mobile-border-radius)',
                  marginBottom: 'var(--mobile-spacing-lg)'
                }}>
                  <h3 style={{ 
                    fontSize: 'var(--mobile-text-base)',
                    fontWeight: '600',
                    marginBottom: 'var(--mobile-spacing-xs)',
                    color: '#0c4a6e'
                  }}>
                    Salary Range
                  </h3>
                  <p style={{ 
                    fontSize: 'var(--mobile-text-lg)',
                    fontWeight: '700',
                    color: '#0c4a6e'
                  }}>
                    ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} per year
                  </p>
                </div>
              )}

              {/* Application Status */}
              {userApplicationStatus && (
                <div style={{ 
                  background: '#f8fafc',
                  border: `2px solid ${getStatusColor(userApplicationStatus)}`,
                  padding: 'var(--mobile-spacing-lg)',
                  borderRadius: 'var(--mobile-border-radius)',
                  marginBottom: 'var(--mobile-spacing-lg)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--mobile-spacing-sm)' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: getStatusColor(userApplicationStatus)
                    }}></div>
                    <span style={{ 
                      fontSize: 'var(--mobile-text-base)',
                      fontWeight: '600',
                      color: getStatusColor(userApplicationStatus)
                    }}>
                      {getStatusText(userApplicationStatus)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Job Description */}
          {job.body && (
            <div className="mobile-card mobile-fade-in">
              <div className="mobile-card-header">
                <h2 style={{ fontSize: 'var(--mobile-text-lg)', fontWeight: '600' }}>
                  Job Description
                </h2>
              </div>
              <div className="mobile-card-body">
                <div style={{ 
                  fontSize: 'var(--mobile-text-base)',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {job.body}
                </div>
              </div>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="mobile-card mobile-fade-in">
              <div className="mobile-card-header">
                <h2 style={{ fontSize: 'var(--mobile-text-lg)', fontWeight: '600' }}>
                  Key Responsibilities
                </h2>
              </div>
              <div className="mobile-card-body">
                <ul style={{ 
                  fontSize: 'var(--mobile-text-base)',
                  lineHeight: '1.6',
                  paddingLeft: 'var(--mobile-spacing-lg)',
                  margin: 0
                }}>
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} style={{ marginBottom: 'var(--mobile-spacing-sm)' }}>
                      {responsibility}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="mobile-card mobile-fade-in">
              <div className="mobile-card-header">
                <h2 style={{ fontSize: 'var(--mobile-text-lg)', fontWeight: '600' }}>
                  Requirements
                </h2>
              </div>
              <div className="mobile-card-body">
                <ul style={{ 
                  fontSize: 'var(--mobile-text-base)',
                  lineHeight: '1.6',
                  paddingLeft: 'var(--mobile-spacing-lg)',
                  margin: 0
                }}>
                  {job.requirements.map((requirement, index) => (
                    <li key={index} style={{ marginBottom: 'var(--mobile-spacing-sm)' }}>
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="mobile-card mobile-fade-in">
              <div className="mobile-card-header">
                <h2 style={{ fontSize: 'var(--mobile-text-lg)', fontWeight: '600' }}>
                  Benefits & Perks
                </h2>
              </div>
              <div className="mobile-card-body">
                <ul style={{ 
                  fontSize: 'var(--mobile-text-base)',
                  lineHeight: '1.6',
                  paddingLeft: 'var(--mobile-spacing-lg)',
                  margin: 0
                }}>
                  {job.benefits.map((benefit, index) => (
                    <li key={index} style={{ marginBottom: 'var(--mobile-spacing-sm)' }}>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Job Meta */}
          <div className="mobile-card mobile-fade-in">
            <div className="mobile-card-body">
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--mobile-spacing-lg)',
                fontSize: 'var(--mobile-text-sm)',
                color: 'var(--mobile-gray)'
              }}>
                <div>
                  <strong>Posted:</strong><br />
                  {job.createdAt ? new Date(job.createdAt.toDate()).toLocaleDateString() : 'Recently'}
                </div>
                {job.applicationsCount > 0 && (
                  <div>
                    <strong>Applicants:</strong><br />
                    {job.applicationsCount} so far
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <div style={{ 
            position: 'sticky',
            bottom: 'calc(var(--mobile-nav-height) + var(--mobile-spacing-md))',
            backgroundColor: 'var(--mobile-light)',
            padding: 'var(--mobile-spacing-md) 0',
            marginTop: 'var(--mobile-spacing-xl)'
          }}>
            {userApplicationStatus && userApplicationStatus !== 'draft' ? (
              <button 
                disabled
                className="mobile-btn"
                style={{ 
                  background: getStatusColor(userApplicationStatus),
                  color: 'white',
                  cursor: 'not-allowed', 
                  opacity: 0.7 
                }}
              >
                {getStatusText(userApplicationStatus)}
              </button>
            ) : userApplicationStatus === 'draft' ? (
              <button 
                onClick={handleApply}
                className="mobile-btn mobile-btn-secondary"
              >
                Continue Application
              </button>
            ) : (
              <button 
                onClick={handleApply}
                className="mobile-btn mobile-btn-primary"
              >
                Apply for This Position
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileJobDetails;