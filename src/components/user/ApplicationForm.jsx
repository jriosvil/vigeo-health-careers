import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { collections } from '../../firebase/schema';
import Navbar from '../layout/Navbar';

const ApplicationForm = () => {
  const { jobId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const jobTitle = location.state?.jobTitle || 'Position';

  const [currentStep, setCurrentStep] = useState(0);
  const [applicationId, setApplicationId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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
    education: {
      highestDegree: '',
      fieldOfStudy: '',
      institutionName: '',
      graduationDate: ''
    },
    licenses: [],
    employment: []
  });

  const [newLicense, setNewLicense] = useState({
    name: '',
    issuingAuthority: '',
    number: '',
    expirationDate: ''
  });

  const [newEmployment, setNewEmployment] = useState({
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
  });

  const steps = [
    'Summary',
    'Personal',
    'Emergency',
    'Education',
    'Licenses',
    'Employment',
    'Review'
  ];

  useEffect(() => {
    loadExistingApplication();
  }, []);

  const loadExistingApplication = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      // Check if user has an existing application for this job
      const appsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'applications');
      const q = query(appsCollection, 
        where('jobId', '==', jobId),
        where('applicantId', '==', currentUser.uid),
        where('status', '==', 'draft')
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const existingApp = querySnapshot.docs[0];
        setApplicationId(existingApp.id);
        const appData = existingApp.data();
        
        // Load existing form data
        if (appData.personal) setFormData(prev => ({ ...prev, personal: appData.personal }));
        if (appData.emergency) setFormData(prev => ({ ...prev, emergency: appData.emergency }));
        if (appData.education) setFormData(prev => ({ ...prev, education: appData.education }));
        if (appData.licenses) setFormData(prev => ({ ...prev, licenses: appData.licenses }));
        if (appData.employment) setFormData(prev => ({ ...prev, employment: appData.employment }));
      } else {
        // Create new draft application
        const newAppRef = doc(appsCollection);
        const newAppData = {
          jobId,
          jobTitle,
          applicantId: currentUser.uid,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(newAppRef, newAppData);
        setApplicationId(newAppRef.id);
      }
    } catch (error) {
      console.error('Error loading application:', error);
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

  const addLicense = () => {
    if (newLicense.name && newLicense.number) {
      setFormData(prev => ({
        ...prev,
        licenses: [...prev.licenses, newLicense]
      }));
      setNewLicense({
        name: '',
        issuingAuthority: '',
        number: '',
        expirationDate: ''
      });
    }
  };

  const removeLicense = (index) => {
    setFormData(prev => ({
      ...prev,
      licenses: prev.licenses.filter((_, i) => i !== index)
    }));
  };

  const addEmployment = () => {
    if (newEmployment.employerName && newEmployment.positionTitle) {
      setFormData(prev => ({
        ...prev,
        employment: [...prev.employment, newEmployment]
      }));
      setNewEmployment({
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
      });
    }
  };

  const removeEmployment = (index) => {
    setFormData(prev => ({
      ...prev,
      employment: prev.employment.filter((_, i) => i !== index)
    }));
  };

  const saveForLater = async () => {
    if (!applicationId) return;
    
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
    if (!applicationId) return;
    
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
          
          <div className="progress-steps">
            {steps.map((step, index) => (
              <div 
                key={step}
                className={`progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                onClick={() => setCurrentStep(index)}
              >
                <span className="step-number">{index + 1}</span>
                <span className="step-name">{step}</span>
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
                <li>Professional Licenses/Certifications</li>
                <li>Employment History</li>
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
              </div>

              <h3>Driver's License Details</h3>
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
                    placeholder="e.g., Sister"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number *</label>
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
                <label>Street</label>
                <input
                  type="text"
                  value={formData.emergency.primary.address.street}
                  onChange={(e) => handleInputChange('emergency', 'primary.address.street', e.target.value)}
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
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={formData.emergency.primary.address.state}
                    onChange={(e) => handleInputChange('emergency', 'primary.address.state', e.target.value)}
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
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
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
              <h2>Professional Credentials – Education Details</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Highest Degree Earned *</label>
                  <input
                    type="text"
                    value={formData.education.highestDegree}
                    onChange={(e) => handleInputChange('education', 'highestDegree', e.target.value)}
                    placeholder="e.g., Bachelor's in Nursing"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Field of Study *</label>
                  <input
                    type="text"
                    value={formData.education.fieldOfStudy}
                    onChange={(e) => handleInputChange('education', 'fieldOfStudy', e.target.value)}
                    placeholder="e.g., Nursing"
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Institution Name *</label>
                  <input
                    type="text"
                    value={formData.education.institutionName}
                    onChange={(e) => handleInputChange('education', 'institutionName', e.target.value)}
                    placeholder="e.g., State University"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Graduation Date *</label>
                  <input
                    type="date"
                    value={formData.education.graduationDate}
                    onChange={(e) => handleInputChange('education', 'graduationDate', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Licenses Step */}
          {currentStep === 4 && (
            <div className="form-step">
              <h2>Professional Licenses/Certificates</h2>
              
              <div className="licenses-list">
                {formData.licenses.map((license, index) => (
                  <div key={index} className="license-item glass-card">
                    <h4>{license.name}</h4>
                    <p>Authority: {license.issuingAuthority}</p>
                    <p>Number: {license.number}</p>
                    <p>Expires: {license.expirationDate}</p>
                    <button 
                      type="button"
                      onClick={() => removeLicense(index)}
                      className="btn btn-sm btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <h3>Add License/Certificate</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>License/Certificate Name</label>
                  <input
                    type="text"
                    value={newLicense.name}
                    onChange={(e) => setNewLicense({...newLicense, name: e.target.value})}
                    placeholder="e.g., RN License"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Issuing Authority</label>
                  <input
                    type="text"
                    value={newLicense.issuingAuthority}
                    onChange={(e) => setNewLicense({...newLicense, issuingAuthority: e.target.value})}
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
                    value={newLicense.number}
                    onChange={(e) => setNewLicense({...newLicense, number: e.target.value})}
                    placeholder="e.g., RN-1234567"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Expiration Date</label>
                  <input
                    type="date"
                    value={newLicense.expirationDate}
                    onChange={(e) => setNewLicense({...newLicense, expirationDate: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
              
              <button 
                type="button"
                onClick={addLicense}
                className="btn btn-secondary"
              >
                Add License
              </button>
            </div>
          )}

          {/* Employment Step */}
          {currentStep === 5 && (
            <div className="form-step">
              <h2>Employment History (Last Three Positions)</h2>
              
              <div className="employment-list">
                {formData.employment.map((emp, index) => (
                  <div key={index} className="employment-item glass-card">
                    <h4>Employment History {index + 1}</h4>
                    <p><strong>{emp.positionTitle}</strong> at {emp.employerName}</p>
                    <p>{emp.startDate} to {emp.endDate || 'Present'}</p>
                    <button 
                      type="button"
                      onClick={() => removeEmployment(index)}
                      className="btn btn-sm btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <h3>Add Employment</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Employer Name</label>
                  <input
                    type="text"
                    value={newEmployment.employerName}
                    onChange={(e) => setNewEmployment({...newEmployment, employerName: e.target.value})}
                    placeholder="e.g., ABC Healthcare"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Position Title</label>
                  <input
                    type="text"
                    value={newEmployment.positionTitle}
                    onChange={(e) => setNewEmployment({...newEmployment, positionTitle: e.target.value})}
                    placeholder="e.g., RN Staff"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={newEmployment.phone}
                    onChange={(e) => setNewEmployment({...newEmployment, phone: e.target.value})}
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
                    value={newEmployment.address.city}
                    onChange={(e) => setNewEmployment({
                      ...newEmployment, 
                      address: {...newEmployment.address, city: e.target.value}
                    })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={newEmployment.address.state}
                    onChange={(e) => setNewEmployment({
                      ...newEmployment, 
                      address: {...newEmployment.address, state: e.target.value}
                    })}
                    maxLength="2"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={newEmployment.startDate}
                    onChange={(e) => setNewEmployment({...newEmployment, startDate: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={newEmployment.endDate}
                    onChange={(e) => setNewEmployment({...newEmployment, endDate: e.target.value})}
                    disabled={newEmployment.currentEmployment}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newEmployment.currentEmployment}
                      onChange={(e) => setNewEmployment({
                        ...newEmployment, 
                        currentEmployment: e.target.checked,
                        endDate: e.target.checked ? '' : newEmployment.endDate
                      })}
                    />
                    Current Employment
                  </label>
                </div>
              </div>
              
              <button 
                type="button"
                onClick={addEmployment}
                className="btn btn-secondary"
              >
                Add Employment
              </button>
            </div>
          )}

          {/* Review Step */}
          {currentStep === 6 && (
            <div className="form-step review-step">
              <h2>Review Your Application</h2>
              <p>Please review your information before submitting.</p>
              
              <div className="review-section">
                <h3>Personal Information</h3>
                <p><strong>Name:</strong> {formData.personal.firstName} {formData.personal.middleName} {formData.personal.lastName}</p>
                <p><strong>Email:</strong> {formData.personal.email}</p>
                <p><strong>Phone:</strong> {formData.personal.phone}</p>
                <p><strong>Address:</strong> {formData.personal.address.street}, {formData.personal.address.city}, {formData.personal.address.state} {formData.personal.address.zipCode}</p>
              </div>

              <div className="review-section">
                <h3>Emergency Contact</h3>
                <p><strong>Primary:</strong> {formData.emergency.primary.name} ({formData.emergency.primary.relationship}) - {formData.emergency.primary.phone}</p>
              </div>

              <div className="review-section">
                <h3>Education</h3>
                <p><strong>Degree:</strong> {formData.education.highestDegree} in {formData.education.fieldOfStudy}</p>
                <p><strong>Institution:</strong> {formData.education.institutionName}</p>
              </div>

              <div className="review-section">
                <h3>Licenses</h3>
                {formData.licenses.length > 0 ? (
                  formData.licenses.map((lic, i) => (
                    <p key={i}>{lic.name} - {lic.number}</p>
                  ))
                ) : (
                  <p>No licenses added</p>
                )}
              </div>

              <div className="review-section">
                <h3>Employment History</h3>
                {formData.employment.length > 0 ? (
                  formData.employment.map((emp, i) => (
                    <p key={i}>{emp.positionTitle} at {emp.employerName}</p>
                  ))
                ) : (
                  <p>No employment history added</p>
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
                disabled={saving}
              >
                {saving ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;