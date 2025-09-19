// Application Schema for VIGEO Health Careers
export const applicationSchema = {
  id: '', // auto-generated
  jobId: '', // reference to job posting
  jobTitle: '', // denormalized for easy display
  applicantId: '', // user ID
  status: 'draft', // 'draft', 'submitted', 'new', 'under_review', 'interview_scheduled', 'hired', 'not_hired'
  createdAt: null,
  updatedAt: null,
  submittedAt: null,
  
  // Personal Information
  personal: {
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    ssn: '', // encrypted
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
  
  // Emergency Contact
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
  
  // Education - Array of schools
  education: [], // Array of education objects
  /* Education object structure:
  {
    degree: '',
    fieldOfStudy: '',
    schoolName: '',
    graduationDate: ''
  }
  */
  
  // Licenses
  licenses: [], // Array of license objects
  /* License object structure:
  {
    name: '',
    issuingAuthority: '',
    number: '',
    expirationDate: ''
  }
  */
  
  // Employment History
  employment: [], // Array of employment objects
  /* Employment object structure:
  {
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
  }
  */
  
  // Supporting Documents
  documents: [], // Array of uploaded document references
  /* Document object structure:
  {
    name: '',
    type: '', // mime type
    size: 0, // in bytes
    url: '', // download URL from Firebase Storage
    uploadedAt: null, // timestamp
    storagePath: '' // path in Firebase Storage
  }
  */
  
  // Admin fields
  adminNotes: '',
  reviewedBy: '',
  reviewedAt: null,
  interviewScheduledDate: null
};

// Job Posting Schema with Application Form Fields
export const jobPostingSchema = {
  id: '',
  title: '',
  body: '', // Rich text content
  location: {
    city: '',
    state: ''
  },
  department: '',
  type: 'full-time', // 'full-time', 'part-time', 'contract'
  status: 'active', // 'active', 'inactive', 'archived'
  createdAt: null,
  updatedAt: null,
  createdBy: '',
  applicationsCount: 0,
  
  // Optional fields for display
  requirements: [],
  responsibilities: [],
  benefits: [],
  salary: {
    min: null,
    max: null,
    currency: 'USD',
    period: 'annual'
  }
};