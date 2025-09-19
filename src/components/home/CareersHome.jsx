import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { collections, subcollections } from '../../firebase/schema';
import Navbar from '../layout/Navbar';
import JobCard from './JobCard';

const CareersHome = () => {
  const { userDetails } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const jobsRef = collection(
        db, 
        collections.VIGEO_HEALTH_CAREERS,
        'config',
        'jobPostings'
      );
      
      const q = query(jobsRef, where('status', '==', 'active'));
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
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && job.type === filter;
  });

  return (
    <div className="careers-home">
      <Navbar />
      
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Welcome back, {userDetails?.firstName}!
              </h1>
              <p className="hero-subtitle">
                Build your healthcare career with VIGEO Health
              </p>
              <p className="hero-description">
                Discover opportunities to make a meaningful impact in home healthcare. 
                We're looking for dedicated professionals who share our commitment to 
                providing exceptional care.
              </p>
            </div>

            <div className="search-section">
              <div className="search-container glass-card">
                <input
                  type="text"
                  placeholder="Search for positions, departments, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button className="search-btn btn-primary">
                  Search Jobs
                </button>
              </div>
            </div>

            <div className="filter-tabs">
              <button 
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Positions
              </button>
              <button 
                className={`filter-tab ${filter === 'full-time' ? 'active' : ''}`}
                onClick={() => setFilter('full-time')}
              >
                Full Time
              </button>
              <button 
                className={`filter-tab ${filter === 'part-time' ? 'active' : ''}`}
                onClick={() => setFilter('part-time')}
              >
                Part Time
              </button>
              <button 
                className={`filter-tab ${filter === 'contract' ? 'active' : ''}`}
                onClick={() => setFilter('contract')}
              >
                Contract
              </button>
            </div>
          </div>

          <div className="hero-decoration">
            <div className="curved-overlay"></div>
            <div className="blob-1"></div>
            <div className="blob-2"></div>
          </div>
        </div>
      </div>

      <div className="jobs-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Open Positions</h2>
            <p className="section-subtitle">
              {loading ? 'Loading positions...' : 
               filteredJobs.length === 0 ? 'No positions available at this time' :
               `${filteredJobs.length} position${filteredJobs.length !== 1 ? 's' : ''} available`}
            </p>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading opportunities...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="empty-state glass-card">
              <div className="empty-state-icon">📋</div>
              <h3>No Positions Available</h3>
              <p>We don't have any open positions matching your criteria at the moment.</p>
              <p>Please check back soon or adjust your filters.</p>
            </div>
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          <div className="careers-benefits">
            <h3 className="benefits-title">Why Join VIGEO Health?</h3>
            <div className="benefits-grid">
              <div className="benefit-card glass-card">
                <div className="benefit-icon">🏥</div>
                <h4>Healthcare Excellence</h4>
                <p>Be part of a team dedicated to providing exceptional home healthcare services</p>
              </div>
              <div className="benefit-card glass-card">
                <div className="benefit-icon">📈</div>
                <h4>Career Growth</h4>
                <p>Continuous learning opportunities and clear pathways for advancement</p>
              </div>
              <div className="benefit-card glass-card">
                <div className="benefit-icon">💰</div>
                <h4>Competitive Benefits</h4>
                <p>Comprehensive health coverage, retirement plans, and competitive compensation</p>
              </div>
              <div className="benefit-card glass-card">
                <div className="benefit-icon">⚖️</div>
                <h4>Work-Life Balance</h4>
                <p>Flexible schedules and supportive policies for your well-being</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareersHome;