import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { collections } from '../../firebase/schema';
import Navbar from '../layout/Navbar';

const ApplicationFormV2 = () => {
  const { jobId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const jobTitle = location.state?.jobTitle || 'Position';
  const isSubmitting = useRef(false); // Prevent double submission

  const [currentStep, setCurrentStep] = useState(0);
  const [applicationId, setApplicationId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stagedFile, setStagedFile] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('license');
  const fileInputRef = useRef(null);

  // Form data state with cleaner structure
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
    education: [], // Array of schools
    licenses: [], // Array of licenses
    employment: [], // Array of jobs
    documents: [] // Array of uploaded documents
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
      navigate('/login');
      return;
    }

    try {
      const appsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications');
      
      // First check if user has already submitted an application for this job
      const submittedQuery = query(appsCollection, 
        where('jobId', '==', jobId),
        where('applicantId', '==', currentUser.uid),
        where('status', 'in', ['submitted', 'new', 'under_review', 'interview_scheduled', 'hired', 'not_hired'])
      );
      
      const submittedSnapshot = await getDocs(submittedQuery);
      
      if (!submittedSnapshot.empty) {
        // User has already applied for this job
        alert('You have already submitted an application for this position. You can view your application status in My Applications.');
        navigate('/my-applications');
        return;
      }
      
      // Try to find existing draft application
      const draftQuery = query(appsCollection, 
        where('jobId', '==', jobId),
        where('applicantId', '==', currentUser.uid),
        where('status', '==', 'draft')
      );
      
      const draftSnapshot = await getDocs(draftQuery);
      
      if (!draftSnapshot.empty) {
        // Load existing draft application
        const existingApp = draftSnapshot.docs[0];
        setApplicationId(existingApp.id);
        const appData = existingApp.data();
        
        // Load form data if exists
        if (appData.personal) setFormData(prev => ({ ...prev, personal: { ...prev.personal, ...appData.personal } }));
        if (appData.emergency) setFormData(prev => ({ ...prev, emergency: { ...prev.emergency, ...appData.emergency } }));
        if (appData.education) setFormData(prev => ({ ...prev, education: appData.education }));
        if (appData.licenses) setFormData(prev => ({ ...prev, licenses: appData.licenses }));
        if (appData.employment) setFormData(prev => ({ ...prev, employment: appData.employment }));
        if (appData.documents) setFormData(prev => ({ ...prev, documents: appData.documents }));
      } else {
        // Create new application with unique ID
        const newAppRef = doc(appsCollection);
        const newAppData = {
          jobId,
          jobTitle,
          applicantId: currentUser.uid,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
          personal: formData.personal,
          emergency: formData.emergency,
          education: [],
          licenses: [],
          employment: []
        };
        
        await setDoc(newAppRef, newAppData);
        setApplicationId(newAppRef.id);
      }
    } catch (error) {
      console.error('Error loading/creating application:', error);
      alert('Error loading application. Please try again.');
      navigate('/jobs');
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

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '',
        fieldOfStudy: '',
        schoolName: '',
        graduationDate: ''
      }]
    }));
  };

  const updateEducation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addLicense = () => {
    setFormData(prev => ({
      ...prev,
      licenses: [...prev.licenses, {
        name: '',
        issuingAuthority: '',
        number: '',
        expirationDate: ''
      }]
    }));
  };

  const updateLicense = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      licenses: prev.licenses.map((lic, i) => 
        i === index ? { ...lic, [field]: value } : lic
      )
    }));
  };

  const removeLicense = (index) => {
    setFormData(prev => ({
      ...prev,
      licenses: prev.licenses.filter((_, i) => i !== index)
    }));
  };

  const addEmployment = () => {
    setFormData(prev => ({
      ...prev,
      employment: [...prev.employment, {
        employerName: '',
        positionTitle: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        startDate: '',
        endDate: '',
        currentEmployment: false
      }]
    }));
  };

  const updateEmployment = (index, field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        employment: prev.employment.map((emp, i) => 
          i === index ? {
            ...emp,
            [parent]: {
              ...emp[parent],
              [child]: value
            }
          } : emp
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        employment: prev.employment.map((emp, i) => 
          i === index ? { ...emp, [field]: value } : emp
        )
      }));
    }
  };

  const removeEmployment = (index) => {
    setFormData(prev => ({
      ...prev,
      employment: prev.employment.filter((_, i) => i !== index)
    }));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      event.target.value = '';
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload PDF, JPEG, or PNG files only');
      event.target.value = '';
      return;
    }

    setStagedFile(file);
    setDocumentName(file.name.split('.')[0]); // Pre-fill with file name without extension
  };

  const handleAddDocument = async () => {
    if (!stagedFile || !documentName.trim()) {
      alert('Please select a file and provide a document name');
      return;
    }

    try {
      // Convert file to base64 for storage in Firestore (due to CORS issues with Firebase Storage)
      const reader = new FileReader();
      const fileData = await new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(stagedFile);
      });
      
      const timestamp = Date.now();
      const fileName = `${currentUser.uid}/${applicationId}/${timestamp}_${stagedFile.name}`;
      
      // Add to documents array with file data
      const newDocument = {
        displayName: documentName.trim(),
        documentType: documentType,
        originalName: stagedFile.name,
        type: stagedFile.type,
        size: stagedFile.size,
        fileData: fileData, // Store the base64 data
        url: 'pending-upload', // Keep for compatibility
        uploadedAt: new Date(),
        storagePath: fileName || 'pending'
      };
      
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, newDocument]
      }));
      
      // Save to Firestore immediately
      if (applicationId) {
        try {
          const appsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications');
          await updateDoc(doc(appsCollection, applicationId), {
            documents: [...formData.documents, newDocument],
            updatedAt: new Date()
          });
        } catch (saveError) {
          console.error('Error saving document to database:', saveError);
        }
      }
      
      // Clear the staging area completely
      setStagedFile(null);
      setDocumentName('');
      setDocumentType('license');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Always show the same success message since we're not uploading files yet
      alert('Document information saved successfully! You can add more documents or proceed to the next step.');
    } catch (error) {
      console.error('Error processing document:', error);
      alert('Error processing document. Please try again.');
    }
  };

  const cancelStagedFile = () => {
    setStagedFile(null);
    setDocumentName('');
    setDocumentType('license');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDocument = async (index) => {
    try {
      const docToRemove = formData.documents[index];
      
      // Try to delete from storage if it was uploaded
      if (docToRemove.storagePath && docToRemove.storagePath !== 'pending' && docToRemove.url !== 'pending-upload') {
        try {
          const storageRef = ref(storage, `applications/${docToRemove.storagePath}`);
          await deleteObject(storageRef);
        } catch (storageError) {
          console.log('Could not delete from storage (may not exist or CORS issue), continuing with removal from database');
        }
      }
      
      // Remove from local form data
      const updatedDocuments = formData.documents.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        documents: updatedDocuments
      }));
      
      // Update in Firestore
      if (applicationId) {
        try {
          const appsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications');
          await updateDoc(doc(appsCollection, applicationId), {
            documents: updatedDocuments,
            updatedAt: new Date()
          });
        } catch (saveError) {
          console.error('Error updating database:', saveError);
        }
      }
      
      alert('Document removed successfully');
    } catch (error) {
      console.error('Error removing document:', error);
      alert('Document removed from your application');
    }
  };

  const saveForLater = async () => {
    if (!applicationId || saving) return;
    
    setSaving(true);
    try {
      const appsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications');
      await updateDoc(doc(appsCollection, applicationId), {
        ...formData,
        status: 'draft',
        updatedAt: new Date()
      });
      
      alert('Application saved! You can continue later.');
      navigate('/my-applications');
    } catch (error) {
      console.error('Error saving application:', error);
      alert('Error saving application');
    } finally {
      setSaving(false);
    }
  };

  const submitApplication = async () => {
    if (!applicationId || saving || isSubmitting.current) return;
    
    // Prevent double submission
    isSubmitting.current = true;
    setSaving(true);
    
    try {
      const appsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications');
      await updateDoc(doc(appsCollection, applicationId), {
        ...formData,
        status: 'new',
        submittedAt: new Date(),
        updatedAt: new Date()
      });
      
      alert('Application submitted successfully!');
      navigate('/my-applications');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application');
      isSubmitting.current = false;
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="application-form-page">
      <Navbar />
      
      <div className="application-container">
        <div className="application-header">
          <h1>Application for {jobTitle}</h1>
        </div>

        <div className="application-layout">
          {/* Side Navigation */}
          <div className="application-sidebar glass-card">
            <div className="sidebar-steps">
              {steps.map((step, index) => (
                <div 
                  key={step}
                  className={`sidebar-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(index)}
                >
                  <span className="step-number">{index + 1}</span>
                  <span className="step-name">{step}</span>
                  {index < currentStep && <span className="checkmark">✓</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="application-content glass-card">
          {/* Summary Step */}
          {currentStep === 0 && (
            <div className="form-step">
              <h2>Application Overview</h2>
              <p>Welcome to the VIGEO Health application process for <strong>{jobTitle}</strong>.</p>
              <p>This application consists of the following sections:</p>
              <ul>
                <li>Personal Information</li>
                <li>Emergency Contacts</li>
                <li>Educational Background</li>
                <li>Professional Licenses/Certifications (Optional)</li>
                <li>Employment History</li>
                <li>Supporting Documents (Optional)</li>
                <li>Review and Submit</li>
              </ul>
              <p>You can save your progress at any time and return later to complete your application.</p>
            </div>
          )}

          {/* Personal Information Step */}
          {currentStep === 1 && (
            <div className="form-step">
              <h2>Personal Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={formData.personal.firstName}
                    onChange={(e) => handleInputChange('personal', 'firstName', e.target.value)}
                    placeholder="e.g., John"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={formData.personal.lastName}
                    onChange={(e) => handleInputChange('personal', 'lastName', e.target.value)}
                    placeholder="e.g., Doe"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Middle Name</label>
                  <input
                    type="text"
                    value={formData.personal.middleName}
                    onChange={(e) => handleInputChange('personal', 'middleName', e.target.value)}
                    placeholder="(Optional)"
                    className="form-input"
                  />
                </div>
              </div>

              <h3>Home Address</h3>
              <div className="form-group">
                <label>Street Address *</label>
                <input
                  type="text"
                  value={formData.personal.address.street}
                  onChange={(e) => handleInputChange('personal', 'address.street', e.target.value)}
                  placeholder="e.g., 1234 Main St."
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    value={formData.personal.address.city}
                    onChange={(e) => handleInputChange('personal', 'address.city', e.target.value)}
                    placeholder="e.g., Springfield"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    value={formData.personal.address.state}
                    onChange={(e) => handleInputChange('personal', 'address.state', e.target.value)}
                    placeholder="e.g., IL"
                    maxLength="2"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Zip Code *</label>
                  <input
                    type="text"
                    value={formData.personal.address.zipCode}
                    onChange={(e) => handleInputChange('personal', 'address.zipCode', e.target.value)}
                    placeholder="e.g., 62704"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={formData.personal.email}
                    onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                    placeholder="e.g., john.doe@example.com"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.personal.phone}
                    onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
                    placeholder="e.g., (555) 555-1234"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Social Security Number *</label>
                  <input
                    type="text"
                    value={formData.personal.ssn}
                    onChange={(e) => handleInputChange('personal', 'ssn', e.target.value)}
                    placeholder="e.g., 123-45-6789"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.personal.dateOfBirth}
                    onChange={(e) => handleInputChange('personal', 'dateOfBirth', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date Available for Employment *</label>
                  <input
                    type="date"
                    value={formData.personal.dateAvailable}
                    onChange={(e) => handleInputChange('personal', 'dateAvailable', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <h3>Driver's License Details (Optional)</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>License Number</label>
                  <input
                    type="text"
                    value={formData.personal.driversLicense.number}
                    onChange={(e) => handleInputChange('personal', 'driversLicense.number', e.target.value)}
                    placeholder="e.g., D123-4567-8901"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Issuing State</label>
                  <input
                    type="text"
                    value={formData.personal.driversLicense.state}
                    onChange={(e) => handleInputChange('personal', 'driversLicense.state', e.target.value)}
                    placeholder="e.g., IL"
                    maxLength="2"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Expiration Date</label>
                  <input
                    type="date"
                    value={formData.personal.driversLicense.expirationDate}
                    onChange={(e) => handleInputChange('personal', 'driversLicense.expirationDate', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact Step */}
          {currentStep === 2 && (
            <div className="form-step">
              <h2>Emergency Contact Information</h2>
              
              <h3>Primary Emergency Contact</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.emergency.primary.name}
                    onChange={(e) => handleInputChange('emergency', 'primary.name', e.target.value)}
                    placeholder="e.g., Jane Doe"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Relationship *</label>
                  <input
                    type="text"
                    value={formData.emergency.primary.relationship}
                    onChange={(e) => handleInputChange('emergency', 'primary.relationship', e.target.value)}
                    placeholder="e.g., Spouse"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.emergency.primary.phone}
                    onChange={(e) => handleInputChange('emergency', 'primary.phone', e.target.value)}
                    placeholder="e.g., (555) 555-1234"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  value={formData.emergency.primary.address.street}
                  onChange={(e) => handleInputChange('emergency', 'primary.address.street', e.target.value)}
                  placeholder="Street Address"
                  className="form-input"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={formData.emergency.primary.address.city}
                    onChange={(e) => handleInputChange('emergency', 'primary.address.city', e.target.value)}
                    placeholder="City"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={formData.emergency.primary.address.state}
                    onChange={(e) => handleInputChange('emergency', 'primary.address.state', e.target.value)}
                    placeholder="State"
                    maxLength="2"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    value={formData.emergency.primary.address.zipCode}
                    onChange={(e) => handleInputChange('emergency', 'primary.address.zipCode', e.target.value)}
                    placeholder="Zip Code"
                    className="form-input"
                  />
                </div>
              </div>

              <h3>Secondary Emergency Contact (Optional)</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.emergency.secondary.name}
                    onChange={(e) => handleInputChange('emergency', 'secondary.name', e.target.value)}
                    placeholder="(Optional)"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Relationship</label>
                  <input
                    type="text"
                    value={formData.emergency.secondary.relationship}
                    onChange={(e) => handleInputChange('emergency', 'secondary.relationship', e.target.value)}
                    placeholder="Relationship"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.emergency.secondary.phone}
                    onChange={(e) => handleInputChange('emergency', 'secondary.phone', e.target.value)}
                    placeholder="(Optional)"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Education Step */}
          {currentStep === 3 && (
            <div className="form-step">
              <h2>Educational Background</h2>
              <p className="form-hint">Add your educational qualifications. You can add multiple schools.</p>
              
              {formData.education.map((edu, index) => (
                <div key={index} className="education-item glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3>School {index + 1}</h3>
                    <button 
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="btn btn-sm btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Degree/Certificate *</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        placeholder="e.g., Bachelor's in Nursing"
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Field of Study *</label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
                        placeholder="e.g., Nursing"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>School Name *</label>
                      <input
                        type="text"
                        value={edu.schoolName}
                        onChange={(e) => updateEducation(index, 'schoolName', e.target.value)}
                        placeholder="e.g., State University"
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Graduation Date *</label>
                      <input
                        type="date"
                        value={edu.graduationDate}
                        onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {formData.education.length === 0 && (
                <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px', marginBottom: '1rem' }}>
                  <p>No schools added yet. Click below to add your educational background.</p>
                </div>
              )}
              
              <button 
                type="button"
                onClick={addEducation}
                className="btn btn-secondary"
                style={{ marginTop: '1rem' }}
              >
                + Add School
              </button>
            </div>
          )}

          {/* Licenses Step */}
          {currentStep === 4 && (
            <div className="form-step">
              <h2>Professional Licenses/Certificates (Optional)</h2>
              <p className="form-hint">Add any professional licenses or certifications. This section is optional.</p>
              
              {formData.licenses.map((license, index) => (
                <div key={index} className="license-item glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3>License/Certificate {index + 1}</h3>
                    <button 
                      type="button"
                      onClick={() => removeLicense(index)}
                      className="btn btn-sm btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>License/Certificate Name</label>
                      <input
                        type="text"
                        value={license.name}
                        onChange={(e) => updateLicense(index, 'name', e.target.value)}
                        placeholder="e.g., RN License"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Issuing Authority</label>
                      <input
                        type="text"
                        value={license.issuingAuthority}
                        onChange={(e) => updateLicense(index, 'issuingAuthority', e.target.value)}
                        placeholder="e.g., State Board of Nursing"
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>License/Certificate Number</label>
                      <input
                        type="text"
                        value={license.number}
                        onChange={(e) => updateLicense(index, 'number', e.target.value)}
                        placeholder="e.g., RN-1234567"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Expiration Date</label>
                      <input
                        type="date"
                        value={license.expirationDate}
                        onChange={(e) => updateLicense(index, 'expirationDate', e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {formData.licenses.length === 0 && (
                <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px', marginBottom: '1rem' }}>
                  <p>No licenses or certificates added. This section is optional.</p>
                  <p>Click below if you want to add any professional licenses or certifications.</p>
                </div>
              )}
              
              <button 
                type="button"
                onClick={addLicense}
                className="btn btn-secondary"
                style={{ marginTop: '1rem' }}
              >
                + Add License/Certificate
              </button>
            </div>
          )}

          {/* Employment Step */}
          {currentStep === 5 && (
            <div className="form-step">
              <h2>Employment History</h2>
              <p className="form-hint">Add your last three positions or recent employment history.</p>
              
              {formData.employment.map((emp, index) => (
                <div key={index} className="employment-item glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3>Employment {index + 1}</h3>
                    <button 
                      type="button"
                      onClick={() => removeEmployment(index)}
                      className="btn btn-sm btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Employer Name *</label>
                      <input
                        type="text"
                        value={emp.employerName}
                        onChange={(e) => updateEmployment(index, 'employerName', e.target.value)}
                        placeholder="e.g., ABC Healthcare"
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Position Title *</label>
                      <input
                        type="text"
                        value={emp.positionTitle}
                        onChange={(e) => updateEmployment(index, 'positionTitle', e.target.value)}
                        placeholder="e.g., Registered Nurse"
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={emp.phone}
                        onChange={(e) => updateEmployment(index, 'phone', e.target.value)}
                        placeholder="(555) 555-1212"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        value={emp.address.city}
                        onChange={(e) => updateEmployment(index, 'address.city', e.target.value)}
                        placeholder="City"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        value={emp.address.state}
                        onChange={(e) => updateEmployment(index, 'address.state', e.target.value)}
                        placeholder="State"
                        maxLength="2"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Zip Code</label>
                      <input
                        type="text"
                        value={emp.address.zipCode}
                        onChange={(e) => updateEmployment(index, 'address.zipCode', e.target.value)}
                        placeholder="Zip Code"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date *</label>
                      <input
                        type="date"
                        value={emp.startDate}
                        onChange={(e) => updateEmployment(index, 'startDate', e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={emp.endDate}
                        onChange={(e) => updateEmployment(index, 'endDate', e.target.value)}
                        disabled={emp.currentEmployment}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={emp.currentEmployment}
                          onChange={(e) => {
                            updateEmployment(index, 'currentEmployment', e.target.checked);
                            if (e.target.checked) {
                              updateEmployment(index, 'endDate', '');
                            }
                          }}
                        />
                        Current Employment
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              
              {formData.employment.length === 0 && (
                <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px', marginBottom: '1rem' }}>
                  <p>No employment history added yet. Click below to add your work experience.</p>
                </div>
              )}
              
              <button 
                type="button"
                onClick={addEmployment}
                className="btn btn-secondary"
                style={{ marginTop: '1rem' }}
              >
                + Add Employment
              </button>
            </div>
          )}

          {/* Documents Step */}
          {currentStep === 6 && (
            <div className="form-step">
              <h2>Supporting Documents (Optional)</h2>
              
              <div className="privacy-notice glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'var(--brand-teal-light)', borderRadius: '12px' }}>
                <h3 style={{ marginTop: 0, color: 'var(--healthcare-teal)' }}>Privacy & Security</h3>
                <p style={{ marginBottom: '1rem' }}>
                  <strong>Your privacy is our priority.</strong> All documents are encrypted and stored securely. 
                  This information is used solely to expedite your onboarding process if you are selected for the position.
                </p>
                <ul style={{ marginBottom: '1rem' }}>
                  <li>Documents are transmitted using bank-level encryption</li>
                  <li>Files are stored in HIPAA-compliant secure storage</li>
                  <li>Only authorized HR personnel can access your documents</li>
                  <li>You can request deletion of your documents at any time</li>
                </ul>
                <p style={{ marginBottom: 0, fontStyle: 'italic' }}>
                  <strong>Alternative Option:</strong> You may choose to present required documentation physically at our office during the onboarding process.
                </p>
              </div>

              <div className="document-upload-section">
                <p className="form-hint">Upload relevant documents such as licenses, certifications, diplomas, or driver's license to expedite the hiring process.</p>
                
                {/* File Staging Area */}
                <div className="file-staging-area glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 0 }}>Add Document</h3>
                    {formData.documents.length > 0 && (
                      <span style={{ color: 'var(--brand-green)', fontWeight: '600' }}>
                        {formData.documents.length} document{formData.documents.length !== 1 ? 's' : ''} uploaded
                      </span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Select File</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                      className="form-input"
                      style={{ padding: '0.5rem' }}
                    />
                    <p className="form-hint">Accepted formats: PDF, JPEG, PNG (Max 5MB)</p>
                  </div>

                  {stagedFile && (
                    <div className="staged-file-details" style={{ marginTop: '1rem', padding: '1rem', background: '#f0f8ff', borderRadius: '8px', border: '1px solid #ccc' }}>
                      <p style={{ marginBottom: '1rem' }}><strong>Selected File:</strong> {stagedFile.name} ({(stagedFile.size / 1024).toFixed(2)} KB)</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Document Type</label>
                          <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            className="form-input"
                          >
                            <option value="license">Professional License</option>
                            <option value="certification">Certification</option>
                            <option value="diploma">Diploma/Degree</option>
                            <option value="driver_license">Driver's License</option>
                            <option value="resume">Resume/CV</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Document Name</label>
                          <input
                            type="text"
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            placeholder="Enter a descriptive name"
                            className="form-input"
                          />
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                          type="button"
                          onClick={handleAddDocument}
                          className="btn btn-primary"
                          disabled={!documentName.trim()}
                        >
                          Add Document
                        </button>
                        <button
                          type="button"
                          onClick={cancelStagedFile}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {formData.documents.length > 0 && (
                  <div className="uploaded-documents" style={{ marginTop: '2rem' }}>
                    <h3>Uploaded Documents</h3>
                    <div className="documents-list">
                      {formData.documents.map((doc, index) => (
                        <div key={index} className="document-item glass-card" style={{ 
                          padding: '1rem', 
                          marginBottom: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <strong>{doc.displayName || doc.name}</strong>
                              <span className="document-type-badge" style={{ 
                                padding: '0.25rem 0.5rem', 
                                fontSize: '0.75rem', 
                                backgroundColor: 'var(--brand-teal-light)', 
                                color: 'var(--healthcare-teal)', 
                                borderRadius: '4px',
                                textTransform: 'capitalize'
                              }}>
                                {doc.documentType?.replace('_', ' ') || 'Document'}
                              </span>
                            </div>
                            <p className="form-hint" style={{ marginBottom: 0 }}>
                              {doc.originalName || doc.name} • {(doc.size / 1024).toFixed(2)} KB • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {doc.fileData ? (
                              <span style={{ fontSize: '0.85rem', color: 'green', fontWeight: 'bold' }}>
                                ✓ Uploaded
                              </span>
                            ) : doc.url && doc.url !== 'pending-upload' ? (
                              <button
                                type="button"
                                onClick={() => window.open(doc.url, '_blank')}
                                className="btn btn-sm btn-secondary"
                              >
                                View
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                Pending
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeDocument(index)}
                              className="btn btn-sm btn-danger"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="security-note" style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-light)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 0 }}>
                    <strong>Note:</strong> Uploading documents is optional. You can proceed without uploading any documents and provide them later during the onboarding process.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Review Step */}
          {currentStep === 7 && (
            <div className="form-step review-step">
              <h2>Review Your Application</h2>
              <p>Please review your information before submitting.</p>
              
              <div className="review-section">
                <h3>Personal Information</h3>
                <p><strong>Name:</strong> {formData.personal.firstName} {formData.personal.middleName} {formData.personal.lastName}</p>
                <p><strong>Email:</strong> {formData.personal.email}</p>
                <p><strong>Phone:</strong> {formData.personal.phone}</p>
                <p><strong>Address:</strong> {formData.personal.address.street}, {formData.personal.address.city}, {formData.personal.address.state} {formData.personal.address.zipCode}</p>
                <p><strong>Available Date:</strong> {formData.personal.dateAvailable}</p>
              </div>

              <div className="review-section">
                <h3>Emergency Contact</h3>
                <p><strong>Primary:</strong> {formData.emergency.primary.name} ({formData.emergency.primary.relationship}) - {formData.emergency.primary.phone}</p>
                {formData.emergency.secondary.name && (
                  <p><strong>Secondary:</strong> {formData.emergency.secondary.name} ({formData.emergency.secondary.relationship}) - {formData.emergency.secondary.phone}</p>
                )}
              </div>

              <div className="review-section">
                <h3>Education</h3>
                {formData.education.length > 0 ? (
                  formData.education.map((edu, i) => (
                    <p key={i}>
                      <strong>{edu.degree}</strong> in {edu.fieldOfStudy} from {edu.schoolName} ({edu.graduationDate})
                    </p>
                  ))
                ) : (
                  <p>No education added</p>
                )}
              </div>

              <div className="review-section">
                <h3>Licenses/Certifications</h3>
                {formData.licenses.length > 0 ? (
                  formData.licenses.map((lic, i) => (
                    <p key={i}>{lic.name} - {lic.number} (Expires: {lic.expirationDate || 'N/A'})</p>
                  ))
                ) : (
                  <p>No licenses added</p>
                )}
              </div>

              <div className="review-section">
                <h3>Employment History</h3>
                {formData.employment.length > 0 ? (
                  formData.employment.map((emp, i) => (
                    <p key={i}>
                      <strong>{emp.positionTitle}</strong> at {emp.employerName} 
                      ({emp.startDate} to {emp.currentEmployment ? 'Present' : emp.endDate})
                    </p>
                  ))
                ) : (
                  <p>No employment history added</p>
                )}
              </div>

              <div className="review-section">
                <h3>Supporting Documents</h3>
                {formData.documents.length > 0 ? (
                  formData.documents.map((doc, i) => (
                    <p key={i}>
                      <strong>{doc.displayName || doc.name}</strong>
                      {doc.documentType && ` (${doc.documentType.replace('_', ' ').charAt(0).toUpperCase() + doc.documentType.slice(1).replace('_', ' ')})`}
                      {' - '}{(doc.size / 1024).toFixed(2)} KB
                    </p>
                  ))
                ) : (
                  <p>No documents uploaded</p>
                )}
              </div>

              <div className="submit-notice">
                <p><strong>By submitting this application, you certify that all information provided is accurate and complete.</strong></p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button"
              onClick={saveForLater}
              className="btn btn-secondary"
              disabled={saving}
            >
              Save for Later
            </button>
            
            {currentStep > 0 && (
              <button 
                type="button"
                onClick={prevStep}
                className="btn btn-secondary"
              >
                Previous
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button 
                type="button"
                onClick={nextStep}
                className="btn btn-primary"
              >
                Next
              </button>
            ) : (
              <button 
                type="button"
                onClick={submitApplication}
                className="btn btn-primary"
                disabled={saving || isSubmitting.current}
              >
                {saving ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
        </div> {/* Close application-layout */}
      </div>
    </div>
  );
};

export default ApplicationFormV2;