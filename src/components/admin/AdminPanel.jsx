import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { collections, subcollections } from '../../firebase/schema';
import Navbar from '../layout/Navbar';

const AdminPanel = () => {
  const { userDetails } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full-time',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    salaryMin: '',
    salaryMax: '',
    status: 'active'
  });

  useEffect(() => {
    // Check if user is admin
    if (userDetails?.role !== 'admin') {
      navigate('/');
    }
    fetchJobs();
  }, [userDetails, navigate]);

  const fetchJobs = async () => {
    try {
      const jobsRef = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'jobPostings');
      const querySnapshot = await getDocs(jobsRef);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const jobData = {
      title: formData.title,
      department: formData.department,
      location: formData.location,
      type: formData.type,
      description: formData.description,
      requirements: formData.requirements.split('\n').filter(r => r.trim()),
      responsibilities: formData.responsibilities.split('\n').filter(r => r.trim()),
      benefits: formData.benefits.split('\n').filter(b => b.trim()),
      salary: {
        min: parseInt(formData.salaryMin) || 0,
        max: parseInt(formData.salaryMax) || 0,
        currency: 'USD',
        period: 'annual'
      },
      status: formData.status,
      postedBy: userDetails?.email || 'Admin',
      postedAt: new Date(),
      applicationsCount: 0
    };

    try {
      if (editingJob) {
        // Update existing job
        const jobsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'jobPostings');
        const jobRef = doc(jobsCollection, editingJob.id);
        await updateDoc(jobRef, jobData);
      } else {
        // Add new job
        const jobsRef = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'jobPostings');
        await addDoc(jobsRef, jobData);
      }
      
      // Reset form
      setFormData({
        title: '',
        department: '',
        location: '',
        type: 'full-time',
        description: '',
        requirements: '',
        responsibilities: '',
        benefits: '',
        salaryMin: '',
        salaryMax: '',
        status: 'active'
      });
      setShowAddForm(false);
      setEditingJob(null);
      fetchJobs();
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      department: job.department || '',
      location: job.location || '',
      type: job.type || 'full-time',
      description: job.description || '',
      requirements: job.requirements?.join('\n') || '',
      responsibilities: job.responsibilities?.join('\n') || '',
      benefits: job.benefits?.join('\n') || '',
      salaryMin: job.salary?.min || '',
      salaryMax: job.salary?.max || '',
      status: job.status || 'active'
    });
    setShowAddForm(true);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        const jobsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'jobPostings');
        await deleteDoc(doc(jobsCollection, jobId));
        fetchJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const handleMakeAdmin = async () => {
    // Update current user to admin role
    try {
      const usersCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'users');
      const userRef = doc(usersCollection, userDetails.uid);
      await updateDoc(userRef, { role: 'admin' });
      alert('You are now an admin! Please refresh the page.');
      window.location.reload();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="admin-panel">
      <Navbar />
      
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Panel</h1>
          {userDetails?.role !== 'admin' && (
            <button onClick={handleMakeAdmin} className="btn btn-warning">
              Make Me Admin
            </button>
          )}
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="btn btn-primary"
          >
            {showAddForm ? 'Cancel' : 'Add New Job'}
          </button>
        </div>

        {showAddForm && (
          <div className="job-form glass-card">
            <h3>{editingJob ? 'Edit Job Posting' : 'Add New Job Posting'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Job Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Requirements (one per line)</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  className="form-input"
                  rows="4"
                  placeholder="Bachelor's degree in Nursing&#10;2+ years experience&#10;Valid RN license"
                />
              </div>

              <div className="form-group">
                <label>Responsibilities (one per line)</label>
                <textarea
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleInputChange}
                  className="form-input"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Benefits (one per line)</label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleInputChange}
                  className="form-input"
                  rows="4"
                  placeholder="Health insurance&#10;401k matching&#10;Paid time off"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Salary (Annual USD)</label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Maximum Salary (Annual USD)</label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingJob ? 'Update Job' : 'Add Job'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingJob(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="jobs-table">
          <h3>Current Job Postings ({jobs.length})</h3>
          {jobs.length === 0 ? (
            <p>No job postings yet. Add your first job above!</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Applications</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>{job.department}</td>
                    <td>{job.location}</td>
                    <td>{job.type}</td>
                    <td>
                      <span className={`status-badge ${job.status}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{job.applicationsCount || 0}</td>
                    <td className="actions">
                      <button 
                        onClick={() => handleEdit(job)}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;