import React from 'react';
import { useNavigate } from 'react-router-dom';

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  const formatSalary = (salary) => {
    if (!salary.min && !salary.max) return 'Competitive';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary.currency || 'USD',
      minimumFractionDigits: 0
    });
    
    if (salary.min && salary.max) {
      return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
    }
    return salary.min ? `From ${formatter.format(salary.min)}` : `Up to ${formatter.format(salary.max)}`;
  };

  const getTypeLabel = (type) => {
    const labels = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      'contract': 'Contract'
    };
    return labels[type] || type;
  };

  const handleViewDetails = () => {
    navigate(`/job/${job.id}`);
  };

  return (
    <div className="job-card glass-card">
      <div className="job-card-header">
        <h3 className="job-title">{job.title}</h3>
        <span className={`job-type-badge ${job.type}`}>
          {getTypeLabel(job.type)}
        </span>
      </div>
      
      <div className="job-card-body">
        <div className="job-meta">
          <div className="job-meta-item">
            <span className="meta-icon">🏢</span>
            <span>{job.department}</span>
          </div>
          <div className="job-meta-item">
            <span className="meta-icon">📍</span>
            <span>{job.location}</span>
          </div>
          <div className="job-meta-item">
            <span className="meta-icon">💰</span>
            <span>{formatSalary(job.salary)}</span>
          </div>
        </div>
        
        <p className="job-description">
          {job.description.length > 150 
            ? `${job.description.substring(0, 150)}...` 
            : job.description}
        </p>
        
        {job.benefits && job.benefits.length > 0 && (
          <div className="job-benefits">
            {job.benefits.slice(0, 3).map((benefit, index) => (
              <span key={index} className="benefit-tag">{benefit}</span>
            ))}
            {job.benefits.length > 3 && (
              <span className="benefit-tag more">+{job.benefits.length - 3} more</span>
            )}
          </div>
        )}
      </div>
      
      <div className="job-card-footer">
        <div className="job-posted">
          Posted {new Date(job.postedAt?.seconds * 1000 || job.postedAt).toLocaleDateString()}
        </div>
        <button onClick={handleViewDetails} className="btn btn-primary btn-sm">
          View Details
        </button>
      </div>
    </div>
  );
};

export default JobCard;