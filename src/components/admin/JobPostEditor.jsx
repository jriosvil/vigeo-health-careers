import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { collections } from '../../firebase/schema';
import Navbar from '../layout/Navbar';

const JobPostEditor = () => {
  const { id } = useParams(); // If editing existing job
  const { userDetails } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    location: {
      city: '',
      state: ''
    },
    department: '',
    type: 'full-time',
    status: 'active',
    requirements: '',
    responsibilities: '',
    benefits: '',
    salaryMin: '',
    salaryMax: ''
  });

  useEffect(() => {
    if (id) {
      loadJobPost();
    }
  }, [id]);

  const loadJobPost = async () => {
    setLoading(true);
    try {
      const jobsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'jobPostings');
      const jobDoc = await getDoc(doc(jobsCollection, id));
      
      if (jobDoc.exists()) {
        const data = jobDoc.data();
        setFormData({
          title: data.title || '',
          body: data.body || '',
          location: data.location || { city: '', state: '' },
          department: data.department || '',
          type: data.type || 'full-time',
          status: data.status || 'active',
          requirements: Array.isArray(data.requirements) ? data.requirements.join('\n') : '',
          responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities.join('\n') : '',
          benefits: Array.isArray(data.benefits) ? data.benefits.join('\n') : '',
          salaryMin: data.salary?.min || '',
          salaryMax: data.salary?.max || ''
        });
      }
    } catch (error) {
      console.error('Error loading job post:', error);
      alert('Error loading job post');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const jobsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'jobPostings');
      
      const jobData = {
        title: formData.title,
        body: formData.body,
        location: formData.location,
        department: formData.department,
        type: formData.type,
        status: formData.status,
        requirements: formData.requirements.split('\n').filter(r => r.trim()),
        responsibilities: formData.responsibilities.split('\n').filter(r => r.trim()),
        benefits: formData.benefits.split('\n').filter(b => b.trim()),
        salary: {
          min: parseInt(formData.salaryMin) || 0,
          max: parseInt(formData.salaryMax) || 0,
          currency: 'USD',
          period: 'annual'
        },
        updatedAt: new Date(),
        updatedBy: userDetails?.email || 'Admin'
      };

      if (id) {
        // Update existing job
        await updateDoc(doc(jobsCollection, id), jobData);
        alert('Job post updated successfully!');
      } else {
        // Create new job
        jobData.createdAt = new Date();
        jobData.createdBy = userDetails?.email || 'Admin';
        jobData.applicationsCount = 0;
        
        const newJobRef = doc(jobsCollection);
        await setDoc(newJobRef, jobData);
        alert('Job post created successfully!');
      }
      
      navigate('/admin/jobs');
    } catch (error) {
      console.error('Error saving job post:', error);
      alert('Error saving job post: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }

    try {
      const jobsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'jobPostings');
      await deleteDoc(doc(jobsCollection, id));
      alert('Job post deleted successfully!');
      navigate('/admin/jobs');
    } catch (error) {
      console.error('Error deleting job post:', error);
      alert('Error deleting job post');
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="admin-panel">
      <Navbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1>{id ? 'Edit Job Post' : 'Create New Job Post'}</h1>
          <button 
            onClick={() => navigate('/admin/jobs')}
            className="btn btn-secondary"
          >
            Back to Jobs
          </button>
        </div>

        <form onSubmit={handleSubmit} className="job-editor-form glass-card">
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label>Job Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Physical Therapist (PT/DPT)"
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Chicago"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleChange}
                  required
                  placeholder="e.g., IL"
                  maxLength="2"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g., Rehabilitation Services"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Job Description</h3>
            <div className="form-group">
              <label>Job Description (Rich Text) *</label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                required
                rows="10"
                placeholder="Enter the full job description here. You can use markdown formatting."
                className="form-input"
              />
              <small className="form-hint">
                Tip: You can use **bold**, *italic*, and other markdown formatting
              </small>
            </div>
          </div>

          <div className="form-section">
            <h3>Additional Details (Optional)</h3>
            
            <div className="form-group">
              <label>Requirements (one per line)</label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows="5"
                placeholder="Current PT license&#10;2+ years experience&#10;Home health experience preferred"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Responsibilities (one per line)</label>
              <textarea
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                rows="5"
                placeholder="Evaluate patients' physical conditions&#10;Develop treatment plans&#10;Provide therapy services"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Benefits (one per line)</label>
              <textarea
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                rows="5"
                placeholder="Health insurance&#10;401k matching&#10;Paid time off"
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Minimum Salary (Annual USD)</label>
                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  placeholder="e.g., 75000"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Maximum Salary (Annual USD)</label>
                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  placeholder="e.g., 95000"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : (id ? 'Update Job Post' : 'Create Job Post')}
            </button>
            
            {id && (
              <button 
                type="button"
                onClick={handleDelete}
                className="btn btn-danger"
              >
                Delete Job Post
              </button>
            )}
            
            <button 
              type="button"
              onClick={() => navigate('/admin/jobs')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobPostEditor;