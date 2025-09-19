import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { collections } from '../../firebase/schema';
import { useNavigate } from 'react-router-dom';

const SetupAdmin = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [setting, setSetting] = useState(false);

  const makeAdmin = async () => {
    if (!currentUser) {
      alert('Please sign in first');
      return;
    }

    setSetting(true);
    try {
      const usersCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'users');
      
      await setDoc(doc(usersCollection, currentUser.uid), {
        uid: currentUser.uid,
        email: currentUser.email,
        firstName: currentUser.displayName?.split(' ')[0] || 'Admin',
        lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || 'User',
        role: 'admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });

      alert('Admin role set successfully! Please refresh the page.');
      window.location.reload();
    } catch (error) {
      console.error('Error setting admin role:', error);
      alert('Error setting admin role: ' + error.message);
    } finally {
      setSetting(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 1000,
      background: 'white',
      padding: '1rem',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <p>Current user: {currentUser?.email}</p>
      <button 
        onClick={makeAdmin}
        disabled={setting}
        style={{
          background: '#af2d2c',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {setting ? 'Setting up...' : 'Make Me Admin'}
      </button>
    </div>
  );
};

export default SetupAdmin;