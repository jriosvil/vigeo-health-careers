import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { collections } from '../../../firebase/schema';
import MobileNavbar from '../layout/MobileNavbar';

const MobileJobListings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userApplications, setUserApplications] = useState({});

  useEffect(() => {
    fetchJobs();
    if (currentUser) {
      fetchUserApplications();
    }
  }, [currentUser]);

  const fetchUserApplications = async () => {
    try {
      const appsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications');
      const q = query(appsCollection, where('applicantId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const appliedJobs = {};
      querySnapshot.forEach((doc) => {
        const appData = doc.data();
        appliedJobs[appData.jobId] = appData.status;
      });
      
      setUserApplications(appliedJobs);
    } catch (error) {
      console.error('Error fetching user applications:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const jobsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'jobPostings');
      const q = query(jobsCollection, where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);
      
      const jobsList = [];
      querySnapshot.forEach((doc) => {
        jobsList.push({ id: doc.id, ...doc.data() });
      });
      
      setJobs(jobsList);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const searchLower = searchTerm.toLowerCase();
    return job.title?.toLowerCase().includes(searchLower) ||
           job.location?.city?.toLowerCase().includes(searchLower) ||
           job.location?.state?.toLowerCase().includes(searchLower) ||
           job.department?.toLowerCase().includes(searchLower);
  });

  const handleApply = (jobId, jobTitle) => {
    if (!currentUser) {
      alert('Please sign in to apply for jobs');
      navigate('/mobile/login');
      return;
    }
    navigate(`/mobile/apply/${jobId}`, { state: { jobTitle } });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return '#3b82f6';
      case 'under_review': return '#f59e0b';
      case 'hired': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div className="mobile-page">
      <MobileNavbar />
      
      <div className="mobile-content">
        <div className="mobile-container">
          {/* Hero Section */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: 'var(--mobile-spacing-2xl)',
            paddingTop: 'var(--mobile-spacing-lg)'
          }}>
            <h1 style={{ 
              fontSize: 'var(--mobile-text-2xl)', 
              fontWeight: '700',
              color: 'var(--mobile-primary)',
              marginBottom: 'var(--mobile-spacing-sm)'
            }}>
              Available Positions
            </h1>
            <p style={{ 
              fontSize: 'var(--mobile-text-base)',
              color: 'var(--mobile-gray)',
              marginBottom: 'var(--mobile-spacing-xl)'
            }}>
              Find your next opportunity in home healthcare
            </p>

            {/* Search Bar */}
            <div className="mobile-card" style={{ marginBottom: 'var(--mobile-spacing-xl)' }}>
              <div className="mobile-card-body" style={{ padding: 'var(--mobile-spacing-md)' }}>
                <div className="mobile-form-group" style={{ marginBottom: 0 }}>
                  <input
                    type="text"
                    placeholder="Search jobs, locations, departments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mobile-form-input"
                    style={{ fontSize: 'var(--mobile-text-sm)' }}
                  />
                </div>
              </div>
            </div>

            {/* Results Count */}
            <p style={{ 
              fontSize: 'var(--mobile-text-sm)',
              color: 'var(--mobile-gray)',
              marginBottom: 'var(--mobile-spacing-lg)'
            }}>
              {loading ? 'Loading positions...' : 
               filteredJobs.length === 0 ? 'No positions available' :
               `${filteredJobs.length} position${filteredJobs.length !== 1 ? 's' : ''} available`}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="mobile-loading-container">
              <div className="mobile-spinner"></div>
              <p className="mobile-loading-text">Loading positions...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredJobs.length === 0 && (
            <div className="mobile-card mobile-fade-in">
              <div className="mobile-card-body" style={{ textAlign: 'center', padding: 'var(--mobile-spacing-2xl)' }}>
                <h3 style={{ 
                  fontSize: 'var(--mobile-text-lg)', 
                  fontWeight: '600',
                  marginBottom: 'var(--mobile-spacing-sm)'
                }}>
                  No Positions Available
                </h3>
                <p style={{ color: 'var(--mobile-gray)' }}>
                  Please check back soon for new opportunities.
                </p>
              </div>
            </div>
          )}

          {/* Job Listings */}
          {!loading && filteredJobs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--mobile-spacing-lg)' }}>
              {filteredJobs.map(job => (
                <div 
                  key={job.id} 
                  className="mobile-card mobile-fade-in"
                  onClick={() => navigate(`/mobile/jobs/${job.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Job Header */}
                  <div className="mobile-card-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontSize: 'var(--mobile-text-lg)', 
                          fontWeight: '600',
                          marginBottom: 'var(--mobile-spacing-xs)',
                          lineHeight: '1.3'
                        }}>
                          {job.title}
                        </h3>
                        <div style={{
                          display: 'inline-block',
                          background: 'var(--mobile-secondary)',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: 'var(--mobile-text-xs)',
                          fontWeight: '600'
                        }}>
                          {job.type}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="mobile-card-body">
                    {/* Location and Department */}
                    <div style={{ marginBottom: 'var(--mobile-spacing-md)' }}>
                      <p style={{ 
                        fontSize: 'var(--mobile-text-sm)',
                        color: 'var(--mobile-gray)',
                        marginBottom: 'var(--mobile-spacing-xs)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--mobile-spacing-xs)'
                      }}>
                        <span style={{ fontSize: '14px' }}>📍</span>
                        {job.location?.city}, {job.location?.state}
                      </p>
                      {job.department && (
                        <p style={{ 
                          fontSize: 'var(--mobile-text-sm)',
                          color: 'var(--mobile-gray)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--mobile-spacing-xs)'
                        }}>
                          <span style={{ fontSize: '14px' }}>🏢</span>
                          {job.department}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <p style={{ 
                      fontSize: 'var(--mobile-text-sm)',
                      lineHeight: '1.5',
                      color: 'var(--mobile-dark)',
                      marginBottom: 'var(--mobile-spacing-md)'
                    }}>
                      {job.body?.substring(0, 120)}...
                    </p>

                    {/* Salary */}
                    {job.salary?.min > 0 && (
                      <div style={{ 
                        background: '#f8fafc',
                        padding: 'var(--mobile-spacing-sm)',
                        borderRadius: '8px',
                        marginBottom: 'var(--mobile-spacing-md)'
                      }}>
                        <p style={{ 
                          fontSize: 'var(--mobile-text-sm)',
                          fontWeight: '600',
                          color: 'var(--mobile-primary)'
                        }}>
                          ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} per year
                        </p>
                      </div>
                    )}

                    {/* Meta Info */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 'var(--mobile-spacing-lg)'
                    }}>
                      <span style={{ 
                        fontSize: 'var(--mobile-text-xs)',
                        color: 'var(--mobile-gray)'
                      }}>
                        Posted: {job.createdAt ? new Date(job.createdAt.toDate()).toLocaleDateString() : 'Recently'}
                      </span>
                      {job.applicationsCount > 0 && (
                        <span style={{ 
                          fontSize: 'var(--mobile-text-xs)',
                          color: 'var(--mobile-gray)'
                        }}>
                          {job.applicationsCount} applicant{job.applicationsCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Application Status Indicator */}
                    {userApplications[job.id] && (
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--mobile-spacing-xs)',
                        marginBottom: 'var(--mobile-spacing-sm)'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: getStatusColor(userApplications[job.id])
                        }}></div>
                        <span style={{ 
                          fontSize: 'var(--mobile-text-sm)',
                          fontWeight: '600',
                          color: getStatusColor(userApplications[job.id])
                        }}>
                          {userApplications[job.id] === 'draft' ? 'Draft Application' : 
                           `Application ${userApplications[job.id].replace('_', ' ')}`}
                        </span>
                      </div>
                    )}

                    {/* View Details Indicator */}
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: 'var(--mobile-primary)',
                      fontSize: 'var(--mobile-text-sm)',
                      fontWeight: '600'
                    }}>
                      <span>View Details</span>
                      <span style={{ fontSize: '16px' }}>→</span>
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

export default MobileJobListings;