import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { collections } from '../../firebase/schema';
import Navbar from '../layout/Navbar';
import { generateApplicationPDF } from '../../utils/brandedPdfGenerator';

const ApplicationsManager = () => {
  const { userDetails } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const appsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications');
      const q = query(appsCollection, orderBy('submittedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const appsList = [];
      querySnapshot.forEach((doc) => {
        appsList.push({ id: doc.id, ...doc.data() });
      });
      
      setApplications(appsList);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const appsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications');
      await updateDoc(doc(appsCollection, applicationId), {
        status: newStatus,
        reviewedBy: userDetails?.email,
        reviewedAt: new Date(),
        updatedAt: new Date()
      });
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus, reviewedBy: userDetails?.email, reviewedAt: new Date() }
          : app
      ));
      
      alert(`Application status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Error updating status');
    }
  };

  const deleteApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      const appsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications');
      await deleteDoc(doc(appsCollection, applicationId));
      
      // Update local state
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      
      // Close modal if this was the selected application
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication(null);
      }
      
      alert('Application deleted successfully');
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Error deleting application');
    }
  };

  const downloadApplication = async (application) => {
    try {
      // Generate professional PDF
      await generateApplicationPDF(application);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Downloading as text file instead.');
      
      // Fallback to text download if PDF fails
      const content = formatApplicationForDownload(application);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `application_${application.personal?.lastName}_${application.personal?.firstName}_${application.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatApplicationForDownload = (app) => {
    return `
APPLICATION DETAILS
==================
Job: ${app.jobTitle}
Application ID: ${app.id}
Status: ${app.status}
Submitted: ${app.submittedAt ? new Date(app.submittedAt.toDate()).toLocaleString() : 'Not submitted'}

PERSONAL INFORMATION
====================
Name: ${app.personal?.firstName} ${app.personal?.middleName || ''} ${app.personal?.lastName}
Email: ${app.personal?.email}
Phone: ${app.personal?.phone}
Date of Birth: ${app.personal?.dateOfBirth}
SSN: ${app.personal?.ssn ? '***-**-' + app.personal.ssn.slice(-4) : 'Not provided'}
Available Date: ${app.personal?.dateAvailable}

Address:
${app.personal?.address?.street}
${app.personal?.address?.city}, ${app.personal?.address?.state} ${app.personal?.address?.zipCode}

Driver's License:
Number: ${app.personal?.driversLicense?.number}
State: ${app.personal?.driversLicense?.state}
Expiration: ${app.personal?.driversLicense?.expirationDate}

EMERGENCY CONTACTS
==================
Primary Contact:
Name: ${app.emergency?.primary?.name}
Relationship: ${app.emergency?.primary?.relationship}
Phone: ${app.emergency?.primary?.phone}
Address: ${app.emergency?.primary?.address?.street}, ${app.emergency?.primary?.address?.city}, ${app.emergency?.primary?.address?.state} ${app.emergency?.primary?.address?.zipCode}

Secondary Contact:
Name: ${app.emergency?.secondary?.name || 'Not provided'}
Relationship: ${app.emergency?.secondary?.relationship || ''}
Phone: ${app.emergency?.secondary?.phone || ''}

EDUCATION
=========
${app.education?.length > 0 ? app.education.map((edu, i) => `
School ${i + 1}:
Degree: ${edu.degree || edu.highestDegree}
Field of Study: ${edu.fieldOfStudy}
School: ${edu.schoolName || edu.institutionName}
Graduation Date: ${edu.graduationDate}
`).join('\n') : 'No education provided'}

LICENSES/CERTIFICATIONS
=======================
${app.licenses?.length > 0 ? app.licenses.map(lic => `
- ${lic.name}
  Issuing Authority: ${lic.issuingAuthority}
  Number: ${lic.number}
  Expiration: ${lic.expirationDate}
`).join('\n') : 'No licenses provided'}

SUPPORTING DOCUMENTS
====================
${app.documents?.length > 0 ? app.documents.map(doc => `
- ${doc.displayName || doc.name}
  Type: ${doc.documentType || 'Document'}
  Original File: ${doc.originalName || doc.name}
  Size: ${(doc.size / 1024).toFixed(2)} KB
  Status: ${doc.fileData ? 'File included in application' : doc.url && doc.url !== 'pending-upload' ? 'Uploaded to storage' : 'To be provided at onboarding'}
`).join('\n') : 'No documents uploaded'}

EMPLOYMENT HISTORY
==================
${app.employment?.map((emp, i) => `
Employment ${i + 1}:
Company: ${emp.employerName}
Position: ${emp.positionTitle}
Phone: ${emp.phone}
Location: ${emp.address?.city}, ${emp.address?.state}
Duration: ${emp.startDate} to ${emp.endDate || 'Present'}
Current: ${emp.currentEmployment ? 'Yes' : 'No'}
`).join('\n') || 'No employment history provided'}

ADMIN NOTES
===========
Reviewed By: ${app.reviewedBy || 'Not yet reviewed'}
Reviewed At: ${app.reviewedAt ? new Date(app.reviewedAt.toDate()).toLocaleString() : 'Not yet reviewed'}
Notes: ${app.adminNotes || 'No notes'}
`;
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusBadgeColor = (status) => {
    const colors = {
      'draft': 'gray',
      'submitted': 'blue',
      'new': 'green',
      'under_review': 'yellow',
      'interview_scheduled': 'purple',
      'hired': 'teal',
      'not_hired': 'red'
    };
    return colors[status] || 'gray';
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="admin-panel">
      <Navbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1>Applications Manager</h1>
          <div className="header-stats">
            <span className="stat-badge">Total: {applications.length}</span>
            <span className="stat-badge">New: {applications.filter(a => a.status === 'new').length}</span>
            <span className="stat-badge">Under Review: {applications.filter(a => a.status === 'under_review').length}</span>
          </div>
        </div>

        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Applications
          </button>
          <button 
            className={`filter-tab ${filter === 'new' ? 'active' : ''}`}
            onClick={() => setFilter('new')}
          >
            New
          </button>
          <button 
            className={`filter-tab ${filter === 'under_review' ? 'active' : ''}`}
            onClick={() => setFilter('under_review')}
          >
            Under Review
          </button>
          <button 
            className={`filter-tab ${filter === 'interview_scheduled' ? 'active' : ''}`}
            onClick={() => setFilter('interview_scheduled')}
          >
            Interview Scheduled
          </button>
          <button 
            className={`filter-tab ${filter === 'hired' ? 'active' : ''}`}
            onClick={() => setFilter('hired')}
          >
            Hired
          </button>
          <button 
            className={`filter-tab ${filter === 'not_hired' ? 'active' : ''}`}
            onClick={() => setFilter('not_hired')}
          >
            Not Hired
          </button>
        </div>

        <div className="applications-table glass-card">
          {filteredApplications.length === 0 ? (
            <div className="empty-state">
              <p>No applications found</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Applicant Name</th>
                  <th>Job Title</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map(app => (
                  <tr key={app.id}>
                    <td>
                      <strong>
                        {app.personal?.firstName} {app.personal?.lastName}
                      </strong>
                    </td>
                    <td>{app.jobTitle}</td>
                    <td>{app.personal?.email}</td>
                    <td>{app.personal?.phone}</td>
                    <td>
                      {app.submittedAt 
                        ? new Date(app.submittedAt.toDate()).toLocaleDateString()
                        : 'Draft'}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeColor(app.status)}`}>
                        {app.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="actions">
                      <button 
                        onClick={() => setSelectedApplication(app)}
                        className="btn btn-sm btn-primary"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => downloadApplication(app)}
                        className="btn btn-sm btn-secondary"
                      >
                        Download
                      </button>
                      <button 
                        onClick={() => deleteApplication(app.id)}
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

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Application Details</h2>
                <button 
                  onClick={() => setSelectedApplication(null)}
                  className="close-btn"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="application-detail">
                  <h3>Status Management</h3>
                  <div className="status-buttons">
                    <button 
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'new')}
                      className={`btn btn-sm ${selectedApplication.status === 'new' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      New
                    </button>
                    <button 
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'under_review')}
                      className={`btn btn-sm ${selectedApplication.status === 'under_review' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Under Review
                    </button>
                    <button 
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'interview_scheduled')}
                      className={`btn btn-sm ${selectedApplication.status === 'interview_scheduled' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Interview Scheduled
                    </button>
                    <button 
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'hired')}
                      className={`btn btn-sm btn-success ${selectedApplication.status === 'hired' ? 'active' : ''}`}
                    >
                      Hired
                    </button>
                    <button 
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'not_hired')}
                      className={`btn btn-sm btn-danger ${selectedApplication.status === 'not_hired' ? 'active' : ''}`}
                    >
                      Not Hired
                    </button>
                  </div>

                  <div className="detail-section">
                    <h3>Personal Information</h3>
                    <p><strong>Name:</strong> {selectedApplication.personal?.firstName} {selectedApplication.personal?.middleName} {selectedApplication.personal?.lastName}</p>
                    <p><strong>Email:</strong> {selectedApplication.personal?.email}</p>
                    <p><strong>Phone:</strong> {selectedApplication.personal?.phone}</p>
                    <p><strong>Date of Birth:</strong> {selectedApplication.personal?.dateOfBirth}</p>
                    <p><strong>SSN:</strong> {selectedApplication.personal?.ssn ? '***-**-' + selectedApplication.personal.ssn.slice(-4) : 'Not provided'}</p>
                    <p><strong>Address:</strong> {selectedApplication.personal?.address?.street}, {selectedApplication.personal?.address?.city}, {selectedApplication.personal?.address?.state} {selectedApplication.personal?.address?.zipCode}</p>
                    <p><strong>Driver's License:</strong> {selectedApplication.personal?.driversLicense?.number} (State: {selectedApplication.personal?.driversLicense?.state}, Exp: {selectedApplication.personal?.driversLicense?.expirationDate})</p>
                    <p><strong>Available to Start:</strong> {selectedApplication.personal?.dateAvailable}</p>
                  </div>

                  <div className="detail-section">
                    <h3>Emergency Contacts</h3>
                    <div style={{ marginBottom: '1rem' }}>
                      <p><strong>Primary Contact:</strong></p>
                      <p>{selectedApplication.emergency?.primary?.name} ({selectedApplication.emergency?.primary?.relationship})</p>
                      <p>Phone: {selectedApplication.emergency?.primary?.phone}</p>
                      {selectedApplication.emergency?.primary?.address && (
                        <p>Address: {selectedApplication.emergency?.primary?.address?.street}, {selectedApplication.emergency?.primary?.address?.city}, {selectedApplication.emergency?.primary?.address?.state} {selectedApplication.emergency?.primary?.address?.zipCode}</p>
                      )}
                    </div>
                    {selectedApplication.emergency?.secondary?.name && (
                      <div>
                        <p><strong>Secondary Contact:</strong></p>
                        <p>{selectedApplication.emergency?.secondary?.name} ({selectedApplication.emergency?.secondary?.relationship})</p>
                        <p>Phone: {selectedApplication.emergency?.secondary?.phone}</p>
                      </div>
                    )}
                  </div>

                  <div className="detail-section">
                    <h3>Education</h3>
                    {selectedApplication.education?.length > 0 ? (
                      selectedApplication.education.map((edu, i) => (
                        <div key={i} style={{ marginBottom: '1rem' }}>
                          <p><strong>School {i + 1}:</strong></p>
                          <p>{edu.degree || edu.highestDegree} in {edu.fieldOfStudy}</p>
                          <p>{edu.schoolName || edu.institutionName}</p>
                          <p>Graduated: {edu.graduationDate}</p>
                        </div>
                      ))
                    ) : (
                      <p>No education information provided</p>
                    )}
                  </div>

                  <div className="detail-section">
                    <h3>Professional Licenses & Certifications</h3>
                    {selectedApplication.licenses?.length > 0 ? (
                      selectedApplication.licenses.map((lic, i) => (
                        <div key={i} className="license-item" style={{ marginBottom: '0.5rem' }}>
                          <p><strong>{lic.name}</strong></p>
                          <p>Issuing Authority: {lic.issuingAuthority}</p>
                          <p>License #: {lic.number} | Expires: {lic.expirationDate}</p>
                        </div>
                      ))
                    ) : (
                      <p>No licenses or certifications provided</p>
                    )}
                  </div>

                  <div className="detail-section">
                    <h3>Employment History</h3>
                    {selectedApplication.employment?.length > 0 ? (
                      selectedApplication.employment.map((emp, i) => (
                        <div key={i} style={{ marginBottom: '1rem' }}>
                          <p><strong>{emp.positionTitle}</strong> at {emp.employerName}</p>
                          <p>Duration: {emp.startDate} to {emp.currentEmployment ? 'Present' : emp.endDate}</p>
                          <p>Phone: {emp.phone}</p>
                          <p>Location: {emp.address?.city}, {emp.address?.state}</p>
                        </div>
                      ))
                    ) : (
                      <p>No employment history provided</p>
                    )}
                  </div>

                  <div className="detail-section">
                    <h3>Supporting Documents</h3>
                    {selectedApplication.documents?.length > 0 ? (
                      <div className="documents-list">
                        {selectedApplication.documents.map((doc, i) => (
                          <div key={i} style={{ marginBottom: '0.75rem', padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px' }}>
                            <p><strong>{doc.displayName || doc.name}</strong></p>
                            <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                              Type: {doc.documentType ? doc.documentType.replace('_', ' ').charAt(0).toUpperCase() + doc.documentType.slice(1).replace('_', ' ') : 'Document'}
                            </p>
                            <p style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                              Original File: {doc.originalName || doc.name} ({(doc.size / 1024).toFixed(2)} KB)
                            </p>
                            {doc.fileData ? (
                              <div style={{ marginTop: '0.5rem' }}>
                                <button 
                                  onClick={() => {
                                    // Create a blob from base64 data and download
                                    const base64Data = doc.fileData.split(',')[1];
                                    const byteCharacters = atob(base64Data);
                                    const byteNumbers = new Array(byteCharacters.length);
                                    for (let i = 0; i < byteCharacters.length; i++) {
                                      byteNumbers[i] = byteCharacters.charCodeAt(i);
                                    }
                                    const byteArray = new Uint8Array(byteNumbers);
                                    const blob = new Blob([byteArray], { type: doc.type || 'application/octet-stream' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = doc.originalName || doc.name;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                  }}
                                  className="btn btn-sm btn-primary"
                                  style={{ marginRight: '0.5rem' }}
                                >
                                  Download File
                                </button>
                                {doc.type && doc.type.startsWith('image/') && (
                                  <button 
                                    onClick={() => {
                                      // Open image in new tab
                                      const w = window.open('', '_blank');
                                      w.document.write(`
                                        <html>
                                          <head><title>${doc.displayName || doc.name}</title></head>
                                          <body style="margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0;">
                                            <img src="${doc.fileData}" style="max-width: 100%; max-height: 100vh; object-fit: contain;" />
                                          </body>
                                        </html>
                                      `);
                                      w.document.close();
                                    }}
                                    className="btn btn-sm btn-secondary"
                                  >
                                    View Image
                                  </button>
                                )}
                                {doc.type === 'application/pdf' && (
                                  <button 
                                    onClick={() => {
                                      // Open PDF in new tab
                                      const w = window.open('', '_blank');
                                      w.document.write(`
                                        <html>
                                          <head><title>${doc.displayName || doc.name}</title></head>
                                          <body style="margin: 0;">
                                            <iframe src="${doc.fileData}" style="width: 100%; height: 100vh; border: none;"></iframe>
                                          </body>
                                        </html>
                                      `);
                                      w.document.close();
                                    }}
                                    className="btn btn-sm btn-secondary"
                                  >
                                    View PDF
                                  </button>
                                )}
                              </div>
                            ) : doc.url && doc.url !== 'pending-upload' ? (
                              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary" style={{ marginTop: '0.5rem' }}>
                                View Document
                              </a>
                            ) : (
                              <span style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#6c757d' }}>File to be provided at onboarding</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No documents uploaded</p>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button 
                      onClick={() => downloadApplication(selectedApplication)}
                      className="btn btn-primary"
                    >
                      Download Full Application
                    </button>
                    <button 
                      onClick={() => deleteApplication(selectedApplication.id)}
                      className="btn btn-danger"
                    >
                      Delete Application
                    </button>
                    <button 
                      onClick={() => setSelectedApplication(null)}
                      className="btn btn-secondary"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsManager;