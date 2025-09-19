#!/usr/bin/env python3
"""
VIGEO Health Careers Portal
A simple Flask application for managing job listings and applications
"""

import os
import json
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
import firebase_admin
from firebase_admin import credentials, firestore, auth
from functools import wraps
import secrets

# Initialize Flask app
app = Flask(__name__)
app.secret_key = secrets.token_hex(32)  # Generate a random secret key
app.config['SESSION_TYPE'] = 'filesystem'

# Initialize Firebase Admin SDK
print("🚀 Starting VIGEO Health Careers Portal...")
print("📦 Loading Firebase configuration...")

# Use the service account key file you already have
cred = credentials.Certificate('vigeoptwebsite-firebase-adminsdk-fbsvc-07503c6893 copy.json')
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()
COLLECTION_NAME = 'VIGEOHealthCareersWebsite'

print("✅ Firebase initialized successfully")
print("📂 Using collection:", COLLECTION_NAME)

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    """Home page - redirects to login or careers based on auth status"""
    if 'user_id' in session:
        return redirect(url_for('careers'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page"""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        # For demo purposes, we'll use a simple check
        # In production, you'd verify against Firebase Auth
        if email and password:
            # Store user in session
            session['user_id'] = email
            session['user_email'] = email
            
            print(f"✅ User logged in: {email}")
            flash('Successfully logged in!', 'success')
            return redirect(url_for('careers'))
        else:
            flash('Invalid credentials. Please try again.', 'danger')
            print("❌ Login failed - invalid credentials")
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    """Sign up page"""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        
        try:
            # Create user document in Firestore
            user_ref = db.collection(COLLECTION_NAME).document('users').collection('profiles').document(email)
            user_ref.set({
                'email': email,
                'firstName': first_name,
                'lastName': last_name,
                'createdAt': datetime.now(),
                'role': 'applicant'
            })
            
            # Log user in
            session['user_id'] = email
            session['user_email'] = email
            
            print(f"✅ New user registered: {email}")
            flash('Account created successfully!', 'success')
            return redirect(url_for('careers'))
            
        except Exception as e:
            print(f"❌ Error creating user: {str(e)}")
            flash('Error creating account. Please try again.', 'danger')
    
    return render_template('signup.html')

@app.route('/logout')
def logout():
    """Logout user"""
    email = session.get('user_email', 'Unknown')
    session.clear()
    print(f"👋 User logged out: {email}")
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))

@app.route('/careers')
@login_required
def careers():
    """Main careers page showing job listings"""
    try:
        # Fetch job postings from Firestore
        jobs_ref = db.collection(COLLECTION_NAME).document('jobPostings').collection('active')
        jobs = []
        
        for doc in jobs_ref.stream():
            job = doc.to_dict()
            job['id'] = doc.id
            jobs.append(job)
        
        print(f"📋 Found {len(jobs)} job postings")
        
        return render_template('careers.html', 
                             jobs=jobs, 
                             user_email=session.get('user_email'))
    
    except Exception as e:
        print(f"❌ Error fetching jobs: {str(e)}")
        jobs = []
        
    return render_template('careers.html', 
                         jobs=jobs, 
                         user_email=session.get('user_email'))

@app.route('/setup')
def setup():
    """Database setup page"""
    return render_template('setup.html')

@app.route('/api/initialize', methods=['POST'])
def initialize_db():
    """Initialize database with sample data"""
    try:
        print("🔧 Initializing database structure...")
        
        # Create config document
        config_ref = db.collection(COLLECTION_NAME).document('config')
        config_ref.set({
            'initialized': True,
            'createdAt': datetime.now(),
            'version': '1.0.0',
            'projectName': 'VIGEO Health Careers Website'
        })
        
        print("✅ Database initialized successfully")
        return jsonify({'success': True, 'message': 'Database initialized'})
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/create-sample-jobs', methods=['POST'])
def create_sample_jobs():
    """Create sample job postings"""
    try:
        print("📝 Creating sample job postings...")
        
        sample_jobs = [
            {
                'title': 'Registered Nurse - Home Health',
                'department': 'Nursing',
                'location': 'Remote / Field',
                'type': 'full-time',
                'description': 'We are seeking a compassionate RN for home healthcare.',
                'salary': {'min': 75000, 'max': 95000, 'currency': 'USD'},
                'postedAt': datetime.now(),
                'status': 'active'
            },
            {
                'title': 'Physical Therapist',
                'department': 'Rehabilitation',
                'location': 'Home Visits',
                'type': 'full-time',
                'description': 'Join our team as a Physical Therapist.',
                'salary': {'min': 80000, 'max': 110000, 'currency': 'USD'},
                'postedAt': datetime.now(),
                'status': 'active'
            },
            {
                'title': 'Medical Social Worker',
                'department': 'Social Services',
                'location': 'Hybrid',
                'type': 'full-time',
                'description': 'Support our home healthcare patients.',
                'salary': {'min': 60000, 'max': 75000, 'currency': 'USD'},
                'postedAt': datetime.now(),
                'status': 'active'
            }
        ]
        
        jobs_ref = db.collection(COLLECTION_NAME).document('jobPostings').collection('active')
        
        for job in sample_jobs:
            jobs_ref.add(job)
            print(f"  ✅ Created job: {job['title']}")
        
        print(f"✅ Created {len(sample_jobs)} sample jobs")
        return jsonify({'success': True, 'message': f'Created {len(sample_jobs)} jobs'})
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.errorhandler(404)
def not_found(e):
    """404 error handler"""
    print(f"⚠️ 404 Error: {request.url}")
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    """500 error handler"""
    print(f"❌ 500 Error: {str(e)}")
    return render_template('500.html'), 500

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🏥 VIGEO Health Careers Portal")
    print("="*50)
    print("📍 Server starting on http://localhost:5000")
    print("📝 Available routes:")
    print("   - / (Home)")
    print("   - /login")
    print("   - /signup") 
    print("   - /careers (requires login)")
    print("   - /setup (database setup)")
    print("   - /logout")
    print("="*50)
    print("Press CTRL+C to stop the server\n")
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)