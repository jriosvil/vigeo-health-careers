import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { collections } from '../../firebase/schema';
import Navbar from '../layout/Navbar';

const AdminJobsManager = () => {
  const { userDetails } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (userDetails?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchJobs();
  }, [userDetails, navigate]);

  const fetchJobs = async () => {
    try {
      const jobsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'jobPostings');
      const querySnapshot = await getDocs(jobsCollection);
      
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

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        const jobsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'jobPostings');
        await deleteDoc(doc(jobsCollection, jobId));
        fetchJobs(); // Refresh the list
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Error deleting job post');
      }
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="admin-panel">
      <Navbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1>Manage Job Posts</h1>
          <button 
            onClick={() => navigate('/admin/jobs/new')}
            className="btn btn-primary"
          >
            Create New Job Post
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="empty-state glass-card">
            <h3>No Job Posts</h3>
            <p>Create your first job posting to get started.</p>
            <button 
              onClick={() => navigate('/admin/jobs/new')}
              className="btn btn-primary"
            >
              Create Job Post
            </button>
          </div>
        ) : (
          <div className="jobs-table glass-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Applications</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id}>
                    <td><strong>{job.title}</strong></td>
                    <td>{job.location?.city}, {job.location?.state}</td>
                    <td>{job.department || '-'}</td>
                    <td>{job.type}</td>
                    <td>
                      <span className={`status-badge ${job.status}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{job.applicationsCount || 0}</td>
                    <td>
                      {job.createdAt 
                        ? new Date(job.createdAt.toDate()).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="actions">
                      <button 
                        onClick={() => navigate(`/admin/jobs/edit/${job.id}`)}
                        className="btn btn-sm btn-secondary"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(job.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobsManager;