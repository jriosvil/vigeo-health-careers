import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { collections } from '../../firebase/schema';
import Navbar from '../layout/Navbar';
import SetupAdmin from './SetupAdmin';

const JobDetails = () => {
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
        navigate('/jobs');
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      alert('Error loading job details');
      navigate('/jobs');
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
      navigate('/login');
      return;
    }
    navigate(`/apply/${jobId}`, { state: { jobTitle: job.title } });
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
      <div className="job-details-page">
        <Navbar />
        <div className="container" style={{ paddingTop: 'var(--nav-height)' }}>
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-details-page">
        <Navbar />
        <div className="container" style={{ paddingTop: 'var(--nav-height)' }}>
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>Job Not Found</h2>
            <p style={{ margin: '1rem 0 2rem' }}>The job you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => navigate('/jobs')}
              className="btn btn-primary"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="job-details-page">
      <Navbar />
      {currentUser?.email === 'jriosvil@gmail.com' && <SetupAdmin />}
      
      <div className="container" style={{ paddingTop: 'var(--nav-height)', paddingBottom: '2rem' }}>
        {/* Back Button */}
        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={() => navigate('/jobs')}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>←</span>
            Back to Jobs
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Main Content */}
          <div>
            {/* Job Header */}
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', lineHeight: '1.2' }}>
                      {job.title}
                    </h1>
                    <span className="job-type-badge" style={{ 
                      background: 'var(--secondary)', 
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '1rem',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {job.type}
                    </span>
                  </div>
                </div>

                {/* Location and Department */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ 
                    fontSize: '1.125rem',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.25rem' }}>📍</span>
                    <strong>{job.location?.city}, {job.location?.state}</strong>
                  </p>
                  {job.department && (
                    <p style={{ 
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--text-muted)'
                    }}>
                      <span style={{ fontSize: '1.25rem' }}>🏢</span>
                      {job.department}
                    </p>
                  )}
                </div>

                {/* Application Status */}
                {userApplicationStatus && (
                  <div style={{ 
                    background: '#f8fafc',
                    border: `2px solid ${getStatusColor(userApplicationStatus)}`,
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: getStatusColor(userApplicationStatus)
                      }}></div>
                      <span style={{ 
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: getStatusColor(userApplicationStatus)
                      }}>
                        {getStatusText(userApplicationStatus)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Job Meta */}
                <div style={{ 
                  display: 'flex',
                  gap: '2rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)'
                }}>
                  <div>
                    <strong>Posted:</strong> {job.createdAt ? new Date(job.createdAt.toDate()).toLocaleDateString() : 'Recently'}
                  </div>
                  {job.applicationsCount > 0 && (
                    <div>
                      <strong>Applicants:</strong> {job.applicationsCount}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Job Description */}
            {job.body && (
              <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <div style={{ padding: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                    Job Description
                  </h2>
                  <div style={{ 
                    fontSize: '1rem',
                    lineHeight: '1.7',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {job.body}
                  </div>
                </div>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <div style={{ padding: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                    Key Responsibilities
                  </h2>
                  <ul style={{ 
                    fontSize: '1rem',
                    lineHeight: '1.7',
                    paddingLeft: '1.5rem',
                    margin: 0
                  }}>
                    {job.responsibilities.map((responsibility, index) => (
                      <li key={index} style={{ marginBottom: '0.75rem' }}>
                        {responsibility}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <div style={{ padding: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                    Requirements
                  </h2>
                  <ul style={{ 
                    fontSize: '1rem',
                    lineHeight: '1.7',
                    paddingLeft: '1.5rem',
                    margin: 0
                  }}>
                    {job.requirements.map((requirement, index) => (
                      <li key={index} style={{ marginBottom: '0.75rem' }}>
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="glass-card">
                <div style={{ padding: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                    Benefits & Perks
                  </h2>
                  <ul style={{ 
                    fontSize: '1rem',
                    lineHeight: '1.7',
                    paddingLeft: '1.5rem',
                    margin: 0
                  }}>
                    {job.benefits.map((benefit, index) => (
                      <li key={index} style={{ marginBottom: '0.75rem' }}>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Salary */}
            {job.salary?.min > 0 && (
              <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ 
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: 'var(--primary)'
                  }}>
                    Salary Range
                  </h3>
                  <p style={{ 
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    marginBottom: '0.5rem'
                  }}>
                    ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    per year
                  </p>
                </div>
              </div>
            )}

            {/* Apply Button */}
            <div className="glass-card">
              <div style={{ padding: '1.5rem' }}>
                {userApplicationStatus && userApplicationStatus !== 'draft' ? (
                  <button 
                    disabled
                    className="btn btn-full"
                    style={{ 
                      background: getStatusColor(userApplicationStatus),
                      borderColor: getStatusColor(userApplicationStatus),
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
                    className="btn btn-secondary btn-full"
                  >
                    Continue Application
                  </button>
                ) : (
                  <button 
                    onClick={handleApply}
                    className="btn btn-primary btn-full"
                  >
                    Apply for This Position
                  </button>
                )}
                
                {!currentUser && (
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-muted)', 
                    textAlign: 'center', 
                    marginTop: '1rem' 
                  }}>
                    Please sign in to apply
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;