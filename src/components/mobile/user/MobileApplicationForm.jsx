import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { collections } from '../../../firebase/schema';
import MobileNavbar from '../layout/MobileNavbar';

const MobileApplicationForm = () => {
  const { jobId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const jobTitle = location.state?.jobTitle || 'Position';
  const isSubmitting = useRef(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [applicationId, setApplicationId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stagedFile, setStagedFile] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('license');
  const fileInputRef = useRef(null);

  // Form data state
  const [formData, setFormData] = useState({
    personal: {
      firstName: '',
      lastName: '',
      middleName: '',
      email: currentUser?.email || '',
      phone: '',
      ssn: '',
      dateOfBirth: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      driversLicense: {
        number: '',
        state: '',
        expirationDate: ''
      },
      dateAvailable: ''
    },
    emergency: {
      primary: {
        name: '',
        relationship: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        }
      },
      secondary: {
        name: '',
        relationship: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        }
      }
    },
    education: [],
    licenses: [],
    employment: [],
    documents: []
  });

  const steps = [
    'Summary',
    'Personal',
    'Emergency',
    'Education', 
    'Licenses',
    'Employment',
    'Documents',
    'Review'
  ];

  useEffect(() => {
    loadOrCreateApplication();
  }, []);

  const loadOrCreateApplication = async () => {
    if (!currentUser) {
      navigate('/mobile/login');
      return;
    }

    try {
      const appsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications');
      
      // Check for existing submitted application
      const submittedQuery = query(appsCollection, 
        where('jobId', '==', jobId),
        where('applicantId', '==', currentUser.uid),
        where('status', 'in', ['submitted', 'new', 'under_review', 'interview_scheduled', 'hired', 'not_hired'])
      );
      
      const submittedSnapshot = await getDocs(submittedQuery);
      
      if (!submittedSnapshot.empty) {
        alert('You have already submitted an application for this position.');
        navigate('/mobile/applications');
        return;
      }
      
      // Check for existing draft application
      const draftQuery = query(appsCollection, 
        where('jobId', '==', jobId),
        where('applicantId', '==', currentUser.uid),
        where('status', '==', 'draft')
      );
      
      const draftSnapshot = await getDocs(draftQuery);
      
      if (!draftSnapshot.empty) {
        // Load existing draft
        const existingApp = draftSnapshot.docs[0];
        setApplicationId(existingApp.id);
        const appData = existingApp.data();
        
        if (appData.personal) setFormData(prev => ({ ...prev, personal: { ...prev.personal, ...appData.personal } }));
        if (appData.emergency) setFormData(prev => ({ ...prev, emergency: { ...prev.emergency, ...appData.emergency } }));
        if (appData.education) setFormData(prev => ({ ...prev, education: appData.education }));
        if (appData.licenses) setFormData(prev => ({ ...prev, licenses: appData.licenses }));
        if (appData.employment) setFormData(prev => ({ ...prev, employment: appData.employment }));
        if (appData.documents) setFormData(prev => ({ ...prev, documents: appData.documents }));
      }
      // Don't create anything in Firestore yet - only create when explicitly saving
    } catch (error) {
      console.error('Error loading application:', error);
      alert('Error loading application. Please try again.');
      navigate('/mobile/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [parent]: {
            ...prev[section][parent],
            [child]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  const saveProgress = async () => {
    if (!applicationId) return;
    
    setSaving(true);
    try {
      const appRef = doc(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications', applicationId);
      await updateDoc(appRef, {
        ...formData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
    setSaving(false);
  };

  const saveAndExit = async () => {
    setSaving(true);
    try {
      const appsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications');
      
      if (applicationId) {
        // Update existing draft
        const appRef = doc(appsCollection, applicationId);
        await updateDoc(appRef, {
          ...formData,
          updatedAt: new Date()
        });
      } else {
        // Create new draft application
        const newAppRef = doc(appsCollection);
        const newAppData = {
          jobId,
          jobTitle,
          applicantId: currentUser.uid,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
          ...formData
        };
        
        await setDoc(newAppRef, newAppData);
        setApplicationId(newAppRef.id);
      }
      
      alert('Application saved successfully! You can continue it later from My Applications.');
      navigate('/mobile/jobs');
    } catch (error) {
      console.error('Error saving application:', error);
      alert('Error saving application. Please try again.');
    }
    setSaving(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    try {
      const appsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications');
      
      if (applicationId) {
        // Update existing application to submitted
        const appRef = doc(appsCollection, applicationId);
        await updateDoc(appRef, {
          ...formData,
          status: 'submitted',
          submittedAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Create new submitted application
        const newAppRef = doc(appsCollection);
        const newAppData = {
          jobId,
          jobTitle,
          applicantId: currentUser.uid,
          status: 'submitted',
          createdAt: new Date(),
          submittedAt: new Date(),
          updatedAt: new Date(),
          ...formData
        };
        
        await setDoc(newAppRef, newAppData);
      }
      
      alert('Application submitted successfully!');
      navigate('/mobile/applications');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    }
    
    isSubmitting.current = false;
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '',
        school: '',
        graduationDate: '',
        city: '',
        state: ''
      }]
    }));
  };

  const addLicense = () => {
    setFormData(prev => ({
      ...prev,
      licenses: [...prev.licenses, {
        type: '',
        number: '',
        state: '',
        expirationDate: ''
      }]
    }));
  };

  const addEmployment = () => {
    setFormData(prev => ({
      ...prev,
      employment: [...prev.employment, {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        supervisor: '',
        phone: '',
        reason: ''
      }]
    }));
  };

  const handleAddDocument = async () => {
    if (!stagedFile || !documentName.trim()) {
      alert('Please select a file and enter a document name');
      return;
    }

    try {
      const reader = new FileReader();
      const fileData = await new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(stagedFile);
      });

      const newDocument = {
        displayName: documentName.trim(),
        documentType: documentType,
        fileData: fileData,
        uploadedAt: new Date()
      };

      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, newDocument]
      }));

      setStagedFile(null);
      setDocumentName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error adding document:', error);
      alert('Error adding document. Please try again.');
    }
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="mobile-page">
        <MobileNavbar />
        <div className="mobile-content">
          <div className="mobile-loading-container">
            <div className="mobile-spinner"></div>
            <p className="mobile-loading-text">Loading application...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Summary
        return (
          <div className="mobile-card">
            <div className="mobile-card-header">
              <h3 style={{ fontSize: 'var(--mobile-text-lg)', fontWeight: '600' }}>
                Application Summary
              </h3>
            </div>
            <div className="mobile-card-body">
              <p style={{ marginBottom: 'var(--mobile-spacing-lg)', color: 'var(--mobile-gray)' }}>
                You are applying for: <strong>{jobTitle}</strong>
              </p>
              <p style={{ marginBottom: 'var(--mobile-spacing-lg)', lineHeight: '1.5' }}>
                This application consists of several sections. You can save your progress at any time and continue later.
              </p>
              <div style={{ background: '#f8fafc', padding: 'var(--mobile-spacing-md)', borderRadius: '8px' }}>
                <h4 style={{ fontSize: 'var(--mobile-text-sm)', fontWeight: '600', marginBottom: 'var(--mobile-spacing-sm)' }}>
                  Required Information:
                </h4>
                <ul style={{ fontSize: 'var(--mobile-text-sm)', color: 'var(--mobile-gray)', paddingLeft: '1rem' }}>
                  <li>Personal Information</li>
                  <li>Emergency Contacts</li>
                  <li>Education History</li>
                  <li>Professional Licenses</li>
                  <li>Employment History</li>
                  <li>Supporting Documents</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 1: // Personal
        return (
          <div className="mobile-card">
            <div className="mobile-card-header">
              <h3 style={{ fontSize: 'var(--mobile-text-lg)', fontWeight: '600' }}>
                Personal Information
              </h3>
            </div>
            <div className="mobile-card-body">
              <div className="mobile-form-group">
                <label className="mobile-form-label">First Name *</label>
                <input
                  type="text"
                  className="mobile-form-input"
                  value={formData.personal.firstName}
                  onChange={(e) => handleInputChange('personal', 'firstName', e.target.value)}
                  required
                />
              </div>

              <div className="mobile-form-group">
                <label className="mobile-form-label">Middle Name</label>
                <input
                  type="text"
                  className="mobile-form-input"
                  value={formData.personal.middleName}
                  onChange={(e) => handleInputChange('personal', 'middleName', e.target.value)}
                />
              </div>

              <div className="mobile-form-group">
                <label className="mobile-form-label">Last Name *</label>
                <input
                  type="text"
                  className="mobile-form-input"
                  value={formData.personal.lastName}
                  onChange={(e) => handleInputChange('personal', 'lastName', e.target.value)}
                  required
                />
              </div>

              <div className="mobile-form-group">
                <label className="mobile-form-label">Email *</label>
                <input
                  type="email"
                  className="mobile-form-input"
                  value={formData.personal.email}
                  onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                  required
                />
              </div>

              <div className="mobile-form-group">
                <label className="mobile-form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="mobile-form-input"
                  value={formData.personal.phone}
                  onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
                  required
                />
              </div>

              <div className="mobile-form-group">
                <label className="mobile-form-label">Date of Birth *</label>
                <input
                  type="date"
                  className="mobile-form-input"
                  value={formData.personal.dateOfBirth}
                  onChange={(e) => handleInputChange('personal', 'dateOfBirth', e.target.value)}
                  required
                />
              </div>

              <div className="mobile-form-group">
                <label className="mobile-form-label">Street Address *</label>
                <input
                  type="text"
                  className="mobile-form-input"
                  value={formData.personal.address.street}
                  onChange={(e) => handleInputChange('personal', 'address.street', e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--mobile-spacing-md)' }}>
                <div className="mobile-form-group">
                  <label className="mobile-form-label">City *</label>
                  <input
                    type="text"
                    className="mobile-form-input"
                    value={formData.personal.address.city}
                    onChange={(e) => handleInputChange('personal', 'address.city', e.target.value)}
                    required
                  />
                </div>

                <div className="mobile-form-group">
                  <label className="mobile-form-label">State *</label>
                  <input
                    type="text"
                    className="mobile-form-input"
                    value={formData.personal.address.state}
                    onChange={(e) => handleInputChange('personal', 'address.state', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mobile-form-group">
                <label className="mobile-form-label">ZIP Code *</label>
                <input
                  type="text"
                  className="mobile-form-input"
                  value={formData.personal.address.zipCode}
                  onChange={(e) => handleInputChange('personal', 'address.zipCode', e.target.value)}
                  required
                />
              </div>

              <div className="mobile-form-group">
                <label className="mobile-form-label">Date Available *</label>
                <input
                  type="date"
                  className="mobile-form-input"
                  value={formData.personal.dateAvailable}
                  onChange={(e) => handleInputChange('personal', 'dateAvailable', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 7: // Review
        return (
          <div className="mobile-card">
            <div className="mobile-card-header">
              <h3 style={{ fontSize: 'var(--mobile-text-lg)', fontWeight: '600' }}>
                Review & Submit
              </h3>
            </div>
            <div className="mobile-card-body">
              <p style={{ marginBottom: 'var(--mobile-spacing-lg)', color: 'var(--mobile-gray)' }}>
                Please review your application before submitting. You can go back to make changes if needed.
              </p>
              
              <div style={{ background: '#f8fafc', padding: 'var(--mobile-spacing-md)', borderRadius: '8px', marginBottom: 'var(--mobile-spacing-lg)' }}>
                <h4 style={{ fontSize: 'var(--mobile-text-sm)', fontWeight: '600', marginBottom: 'var(--mobile-spacing-sm)' }}>
                  Application Summary:
                </h4>
                <p style={{ fontSize: 'var(--mobile-text-sm)', marginBottom: 'var(--mobile-spacing-xs)' }}>
                  <strong>Name:</strong> {formData.personal.firstName} {formData.personal.lastName}
                </p>
                <p style={{ fontSize: 'var(--mobile-text-sm)', marginBottom: 'var(--mobile-spacing-xs)' }}>
                  <strong>Email:</strong> {formData.personal.email}
                </p>
                <p style={{ fontSize: 'var(--mobile-text-sm)', marginBottom: 'var(--mobile-spacing-xs)' }}>
                  <strong>Education Records:</strong> {formData.education.length}
                </p>
                <p style={{ fontSize: 'var(--mobile-text-sm)', marginBottom: 'var(--mobile-spacing-xs)' }}>
                  <strong>Licenses:</strong> {formData.licenses.length}
                </p>
                <p style={{ fontSize: 'var(--mobile-text-sm)', marginBottom: 'var(--mobile-spacing-xs)' }}>
                  <strong>Employment History:</strong> {formData.employment.length}
                </p>
                <p style={{ fontSize: 'var(--mobile-text-sm)' }}>
                  <strong>Documents:</strong> {formData.documents.length}
                </p>
              </div>

              <button 
                onClick={handleSubmit}
                className="mobile-btn mobile-btn-primary"
                style={{ marginBottom: 'var(--mobile-spacing-md)' }}
              >
                Submit Application
              </button>

              <p style={{ fontSize: 'var(--mobile-text-xs)', color: 'var(--mobile-gray)', textAlign: 'center' }}>
                By submitting this application, you confirm that all information provided is accurate and complete.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="mobile-card">
            <div className="mobile-card-body" style={{ textAlign: 'center', padding: 'var(--mobile-spacing-2xl)' }}>
              <p>This section is under development for mobile.</p>
              <p style={{ fontSize: 'var(--mobile-text-sm)', color: 'var(--mobile-gray)', marginTop: 'var(--mobile-spacing-md)' }}>
                Please use the desktop version to complete these sections.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mobile-page">
      <MobileNavbar />
      
      <div className="mobile-content">
        <div className="mobile-container">
          {/* Header */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: 'var(--mobile-spacing-xl)',
            paddingTop: 'var(--mobile-spacing-lg)'
          }}>
            <h1 style={{ 
              fontSize: 'var(--mobile-text-xl)', 
              fontWeight: '700',
              marginBottom: 'var(--mobile-spacing-sm)'
            }}>
              Job Application
            </h1>
            <p style={{ 
              fontSize: 'var(--mobile-text-sm)',
              color: 'var(--mobile-gray)'
            }}>
              {jobTitle}
            </p>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: 'var(--mobile-spacing-xl)' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 'var(--mobile-spacing-sm)'
            }}>
              <span style={{ fontSize: 'var(--mobile-text-sm)', fontWeight: '600' }}>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span style={{ fontSize: 'var(--mobile-text-sm)', color: 'var(--mobile-gray)' }}>
                {steps[currentStep]}
              </span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '4px', 
              background: '#e2e8f0', 
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${((currentStep + 1) / steps.length) * 100}%`, 
                height: '100%', 
                background: 'var(--mobile-primary)',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Navigation Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: 'var(--mobile-spacing-md)',
            marginTop: 'var(--mobile-spacing-xl)'
          }}>
            {currentStep > 0 && (
              <button 
                onClick={handlePrevious}
                className="mobile-btn mobile-btn-outline"
                style={{ flex: 1 }}
              >
                Previous
              </button>
            )}
            
            {currentStep < steps.length - 1 && (
              <button 
                onClick={handleNext}
                className="mobile-btn mobile-btn-primary"
                style={{ flex: currentStep > 0 ? 1 : 'none' }}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Next'}
              </button>
            )}
          </div>

          {/* Save Progress */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: 'var(--mobile-spacing-lg)',
            paddingBottom: 'var(--mobile-spacing-xl)'
          }}>
            <button 
              onClick={saveAndExit}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--mobile-primary)',
                fontSize: 'var(--mobile-text-sm)',
                textDecoration: 'underline'
              }}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save for Later'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileApplicationForm;