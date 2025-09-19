import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { collections } from '../../../firebase/schema';
import MobileNavbar from '../layout/MobileNavbar';

const MobileProfile = () => {
  const navigate = useNavigate();
  const { currentUser, userDetails, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: userDetails?.firstName || '',
    lastName: userDetails?.lastName || '',
    phone: userDetails?.phone || '',
    dateOfBirth: userDetails?.dateOfBirth || '',
    address: userDetails?.address || {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: new Date()
      });
      
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    // Reset to original data
    setProfileData({
      firstName: userDetails?.firstName || '',
      lastName: userDetails?.lastName || '',
      phone: userDetails?.phone || '',
      dateOfBirth: userDetails?.dateOfBirth || '',
      address: userDetails?.address || {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      }
    });
    setEditing(false);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await logout();
        navigate('/mobile/login', { replace: true });
      } catch (error) {
        console.error('Failed to log out:', error);
        alert('Failed to sign out. Please try again.');
      }
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
              fontSize: 'var(--mobile-text-2xl)', 
              fontWeight: '700',
              color: 'var(--mobile-primary)',
              marginBottom: 'var(--mobile-spacing-sm)'
            }}>
              My Profile
            </h1>
            <p style={{ 
              fontSize: 'var(--mobile-text-base)',
              color: 'var(--mobile-gray)'
            }}>
              Manage your account information
            </p>
          </div>

          {/* Profile Card */}
          <div className="mobile-card mobile-fade-in">
            <div className="mobile-card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 'var(--mobile-text-lg)', fontWeight: '600' }}>
                  Personal Information
                </h3>
                {!editing && (
                  <button 
                    onClick={() => setEditing(true)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--mobile-primary)',
                      fontSize: 'var(--mobile-text-sm)',
                      fontWeight: '600'
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            <div className="mobile-card-body">
              {/* Email (Read-only) */}
              <div className="mobile-form-group">
                <label className="mobile-form-label">Email Address</label>
                <div style={{
                  padding: 'var(--mobile-spacing-md)',
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: 'var(--mobile-border-radius)',
                  fontSize: 'var(--mobile-text-base)',
                  color: 'var(--mobile-gray)'
                }}>
                  {currentUser?.email}
                </div>
                <p style={{ fontSize: 'var(--mobile-text-xs)', color: 'var(--mobile-gray)', marginTop: '4px' }}>
                  Email cannot be changed
                </p>
              </div>

              {/* First Name */}
              <div className="mobile-form-group">
                <label className="mobile-form-label">First Name</label>
                {editing ? (
                  <input
                    type="text"
                    className="mobile-form-input"
                    value={profileData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                  />
                ) : (
                  <div style={{
                    padding: 'var(--mobile-spacing-md)',
                    background: '#f8fafc',
                    borderRadius: 'var(--mobile-border-radius)',
                    fontSize: 'var(--mobile-text-base)'
                  }}>
                    {profileData.firstName || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div className="mobile-form-group">
                <label className="mobile-form-label">Last Name</label>
                {editing ? (
                  <input
                    type="text"
                    className="mobile-form-input"
                    value={profileData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                  />
                ) : (
                  <div style={{
                    padding: 'var(--mobile-spacing-md)',
                    background: '#f8fafc',
                    borderRadius: 'var(--mobile-border-radius)',
                    fontSize: 'var(--mobile-text-base)'
                  }}>
                    {profileData.lastName || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="mobile-form-group">
                <label className="mobile-form-label">Phone Number</label>
                {editing ? (
                  <input
                    type="tel"
                    className="mobile-form-input"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div style={{
                    padding: 'var(--mobile-spacing-md)',
                    background: '#f8fafc',
                    borderRadius: 'var(--mobile-border-radius)',
                    fontSize: 'var(--mobile-text-base)'
                  }}>
                    {profileData.phone || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div className="mobile-form-group">
                <label className="mobile-form-label">Date of Birth</label>
                {editing ? (
                  <input
                    type="date"
                    className="mobile-form-input"
                    value={profileData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                ) : (
                  <div style={{
                    padding: 'var(--mobile-spacing-md)',
                    background: '#f8fafc',
                    borderRadius: 'var(--mobile-border-radius)',
                    fontSize: 'var(--mobile-text-base)'
                  }}>
                    {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </div>
                )}
              </div>

              {/* Address Section */}
              <h4 style={{ 
                fontSize: 'var(--mobile-text-base)', 
                fontWeight: '600',
                marginBottom: 'var(--mobile-spacing-md)',
                marginTop: 'var(--mobile-spacing-lg)'
              }}>
                Address
              </h4>

              {/* Street Address */}
              <div className="mobile-form-group">
                <label className="mobile-form-label">Street Address</label>
                {editing ? (
                  <input
                    type="text"
                    className="mobile-form-input"
                    value={profileData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    placeholder="Enter your street address"
                  />
                ) : (
                  <div style={{
                    padding: 'var(--mobile-spacing-md)',
                    background: '#f8fafc',
                    borderRadius: 'var(--mobile-border-radius)',
                    fontSize: 'var(--mobile-text-base)'
                  }}>
                    {profileData.address.street || 'Not provided'}
                  </div>
                )}
              </div>

              {/* City and State */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--mobile-spacing-md)' }}>
                <div className="mobile-form-group">
                  <label className="mobile-form-label">City</label>
                  {editing ? (
                    <input
                      type="text"
                      className="mobile-form-input"
                      value={profileData.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      placeholder="City"
                    />
                  ) : (
                    <div style={{
                      padding: 'var(--mobile-spacing-md)',
                      background: '#f8fafc',
                      borderRadius: 'var(--mobile-border-radius)',
                      fontSize: 'var(--mobile-text-base)'
                    }}>
                      {profileData.address.city || 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="mobile-form-group">
                  <label className="mobile-form-label">State</label>
                  {editing ? (
                    <input
                      type="text"
                      className="mobile-form-input"
                      value={profileData.address.state}
                      onChange={(e) => handleInputChange('address.state', e.target.value)}
                      placeholder="State"
                    />
                  ) : (
                    <div style={{
                      padding: 'var(--mobile-spacing-md)',
                      background: '#f8fafc',
                      borderRadius: 'var(--mobile-border-radius)',
                      fontSize: 'var(--mobile-text-base)'
                    }}>
                      {profileData.address.state || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>

              {/* ZIP Code */}
              <div className="mobile-form-group">
                <label className="mobile-form-label">ZIP Code</label>
                {editing ? (
                  <input
                    type="text"
                    className="mobile-form-input"
                    value={profileData.address.zipCode}
                    onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                    placeholder="Enter ZIP code"
                  />
                ) : (
                  <div style={{
                    padding: 'var(--mobile-spacing-md)',
                    background: '#f8fafc',
                    borderRadius: 'var(--mobile-border-radius)',
                    fontSize: 'var(--mobile-text-base)'
                  }}>
                    {profileData.address.zipCode || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Edit Action Buttons */}
              {editing && (
                <div style={{ 
                  display: 'flex', 
                  gap: 'var(--mobile-spacing-md)',
                  marginTop: 'var(--mobile-spacing-lg)'
                }}>
                  <button 
                    onClick={handleCancel}
                    className="mobile-btn mobile-btn-outline"
                    style={{ flex: 1 }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="mobile-btn mobile-btn-primary"
                    style={{ flex: 1 }}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account Actions */}
          <div className="mobile-card mobile-fade-in">
            <div className="mobile-card-header">
              <h3 style={{ fontSize: 'var(--mobile-text-lg)', fontWeight: '600' }}>
                Account Actions
              </h3>
            </div>
            <div className="mobile-card-body">
              <button 
                onClick={handleLogout}
                className="mobile-btn mobile-btn-outline"
                style={{ 
                  borderColor: '#ef4444', 
                  color: '#ef4444'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: 'var(--mobile-spacing-xl)',
            paddingBottom: 'var(--mobile-spacing-xl)'
          }}>
            <p style={{ 
              color: 'var(--mobile-gray)', 
              fontSize: 'var(--mobile-text-xs)'
            }}>
              Account created: {currentUser?.metadata?.creationTime ? 
                new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileProfile;