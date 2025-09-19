import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { collections } from '../../firebase/schema';
import Navbar from '../layout/Navbar';
import SetupAdmin from './SetupAdmin';

const JobListings = () => {
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
      navigate('/login');
      return;
    }
    navigate(`/apply/${jobId}`, { state: { jobTitle } });
  };

  return (
    <div className="job-listings-page">
      <Navbar />
      {currentUser?.email === 'jriosvil@gmail.com' && <SetupAdmin />}
      
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to VIGEO Health Careers</h1>
            <p className="hero-subtitle">
              Find your next opportunity in home healthcare
            </p>
            
            <div className="search-container glass-card">
              <input
                type="text"
                placeholder="Search by job title, location, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button className="search-btn btn-primary">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="jobs-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Available Positions</h2>
            <p className="section-subtitle">
              {loading ? 'Loading positions...' : 
               filteredJobs.length === 0 ? 'No positions available at this time' :
               `${filteredJobs.length} position${filteredJobs.length !== 1 ? 's' : ''} available`}
            </p>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="empty-state glass-card">
              <h3>No Positions Available</h3>
              <p>Please check back soon for new opportunities.</p>
            </div>
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map(job => (
                <div key={job.id} className="job-card glass-card">
                  <div className="job-card-header">
                    <h3 className="job-title">{job.title}</h3>
                    <span className="job-type-badge">{job.type}</span>
                  </div>
                  
                  <div className="job-card-details">
                    <p className="job-location">
                      📍 {job.location?.city}, {job.location?.state}
                    </p>
                    {job.department && (
                      <p className="job-department">
                        🏢 {job.department}
                      </p>
                    )}
                  </div>

                  <div className="job-description">
                    <p>{job.body?.substring(0, 150)}...</p>
                  </div>

                  {job.salary?.min > 0 && (
                    <div className="job-salary">
                      <strong className="salary-range">
                        ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                      </strong>
                      <span className="salary-period"> per year</span>
                    </div>
                  )}

                  <div className="job-meta">
                    <span className="posted-date">
                      Posted: {job.createdAt ? new Date(job.createdAt.toDate()).toLocaleDateString() : 'Recently'}
                    </span>
                    {job.applicationsCount > 0 && (
                      <span className="applications-count">
                        {job.applicationsCount} applicant{job.applicationsCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {userApplications[job.id] && userApplications[job.id] !== 'draft' ? (
                    <button 
                      disabled
                      className="btn btn-secondary btn-full"
                      style={{ cursor: 'not-allowed', opacity: 0.7 }}
                    >
                      Already Applied ({userApplications[job.id].replace('_', ' ')})
                    </button>
                  ) : userApplications[job.id] === 'draft' ? (
                    <button 
                      onClick={() => handleApply(job.id, job.title)}
                      className="btn btn-warning btn-full"
                    >
                      Continue Application
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleApply(job.id, job.title)}
                      className="btn btn-primary btn-full"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListings;