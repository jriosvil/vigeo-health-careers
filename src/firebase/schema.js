// Vigeo Health Careers Database Schema
// Top-level collection: VIGEO Health Careers Website

export const collections = {
  VIGEO_HEALTH_CAREERS: 'VIGEOHealthCareersWebsite',
};

export const subcollections = {
  USERS: 'users',
  JOB_POSTINGS: 'jobPostings',
  APPLICATIONS: 'applications',
  DEPARTMENTS: 'departments',
  SAVED_JOBS: 'savedJobs'
};

// User schema
export const userSchema = {
  uid: '', // Firebase Auth UID
  email: '',
  firstName: '',
  lastName: '',
  role: 'applicant', // 'applicant', 'admin', 'hr'
  createdAt: null,
  updatedAt: null,
  profile: {
    phone: '',
    resume: '', // URL to uploaded resume
    linkedIn: '',
    skills: [],
    experience: []
  }
};

// Job posting schema
export const jobPostingSchema = {
  id: '',
  title: '',
  department: '',
  location: '',
  type: '', // 'full-time', 'part-time', 'contract'
  description: '',
  requirements: [],
  responsibilities: [],
  benefits: [],
  salary: {
    min: null,
    max: null,
    currency: 'USD',
    period: 'annual' // 'hourly', 'annual'
  },
  status: 'active', // 'active', 'closed', 'draft'
  postedBy: '', // User ID
  postedAt: null,
  closedAt: null,
  applicationsCount: 0
};

// Application schema
export const applicationSchema = {
  id: '',
  jobId: '',
  applicantId: '',
  status: 'pending', // 'pending', 'reviewing', 'interview', 'offered', 'rejected', 'withdrawn'
  appliedAt: null,
  resume: '', // URL to resume
  coverLetter: '',
  answers: [], // Custom screening questions
  notes: [], // HR notes
  statusHistory: []
};