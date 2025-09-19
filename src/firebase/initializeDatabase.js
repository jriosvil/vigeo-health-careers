import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './config';
import { collections, subcollections } from './schema';

/**
 * Initialize the Firestore database structure for VIGEO Health Careers Website
 * This creates the proper collection hierarchy in Firestore
 */
export const initializeDatabase = async () => {
  try {
    console.log('Initializing VIGEO Health Careers Website database structure...');
    
    // Create the main collection document
    const mainDocRef = doc(db, collections.VIGEO_HEALTH_CAREERS, 'config');
    
    await setDoc(mainDocRef, {
      initialized: true,
      createdAt: new Date(),
      version: '1.0.0',
      projectName: 'VIGEO Health Careers Website',
      description: 'Career portal for VIGEO Health home healthcare services',
      subcollections: Object.values(subcollections)
    }, { merge: true });
    
    console.log('✅ Main collection created: VIGEO Health Careers Website');
    
    // Initialize subcollection placeholders (optional - Firestore creates these automatically when documents are added)
    console.log('📁 Subcollections ready to use:');
    console.log('  - users: User profiles and authentication data');
    console.log('  - jobPostings: Available job positions');
    console.log('  - applications: Job applications from candidates');
    console.log('  - departments: Organization departments');
    console.log('  - savedJobs: User saved job listings');
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    // Check for common permission errors
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your Firestore security rules.');
    }
    throw error;
  }
};

/**
 * Create sample job postings for testing
 */
export const createSampleJobPostings = async () => {
  try {
    const sampleJobs = [
      {
        title: 'Registered Nurse - Home Health',
        department: 'Nursing',
        location: 'Remote / Field',
        type: 'full-time',
        description: 'We are seeking a compassionate and skilled Registered Nurse to provide exceptional home healthcare services to our patients. You will work independently while being supported by our experienced team.',
        requirements: [
          'Current RN license in good standing',
          'Minimum 2 years of clinical experience',
          'Valid driver\'s license and reliable transportation',
          'Excellent communication and interpersonal skills',
          'CPR certification'
        ],
        responsibilities: [
          'Provide skilled nursing care to patients in their homes',
          'Develop and implement patient care plans',
          'Coordinate with physicians and healthcare team',
          'Document patient progress and maintain accurate records',
          'Educate patients and families on health management'
        ],
        benefits: [
          'Competitive salary',
          'Comprehensive health insurance',
          'Flexible scheduling',
          'Continuing education opportunities',
          'Mileage reimbursement'
        ],
        salary: {
          min: 75000,
          max: 95000,
          currency: 'USD',
          period: 'annual'
        },
        status: 'active',
        postedBy: 'HR',
        postedAt: new Date(),
        applicationsCount: 0
      },
      {
        title: 'Physical Therapist',
        department: 'Rehabilitation Services',
        location: 'Home Visits',
        type: 'full-time',
        description: 'Join our team as a Physical Therapist providing in-home rehabilitation services. Help patients regain mobility and independence in the comfort of their homes.',
        requirements: [
          'Doctor of Physical Therapy (DPT) degree',
          'Current state PT license',
          'Home health experience preferred',
          'Strong assessment and treatment planning skills',
          'Ability to work independently'
        ],
        responsibilities: [
          'Evaluate patients\' physical conditions and needs',
          'Develop personalized treatment plans',
          'Provide hands-on therapy and exercises',
          'Monitor patient progress',
          'Collaborate with interdisciplinary team'
        ],
        benefits: [
          'Competitive compensation',
          '401(k) with company match',
          'Health, dental, and vision insurance',
          'Paid time off',
          'Professional development support'
        ],
        salary: {
          min: 80000,
          max: 110000,
          currency: 'USD',
          period: 'annual'
        },
        status: 'active',
        postedBy: 'HR',
        postedAt: new Date(),
        applicationsCount: 0
      },
      {
        title: 'Medical Social Worker',
        department: 'Social Services',
        location: 'Hybrid',
        type: 'full-time',
        description: 'We\'re looking for a dedicated Medical Social Worker to support our home healthcare patients and their families through challenging health situations.',
        requirements: [
          'Master\'s degree in Social Work (MSW)',
          'LCSW or LMSW license',
          'Experience in healthcare settings',
          'Knowledge of community resources',
          'Strong advocacy skills'
        ],
        responsibilities: [
          'Assess patients\' psychosocial needs',
          'Provide counseling and support',
          'Connect patients with community resources',
          'Assist with discharge planning',
          'Advocate for patient needs'
        ],
        benefits: [
          'Competitive salary',
          'Comprehensive benefits package',
          'Work-life balance',
          'Supervision for licensure',
          'Team-oriented environment'
        ],
        salary: {
          min: 60000,
          max: 75000,
          currency: 'USD',
          period: 'annual'
        },
        status: 'active',
        postedBy: 'HR',
        postedAt: new Date(),
        applicationsCount: 0
      },
      {
        title: 'Certified Nursing Assistant (CNA)',
        department: 'Nursing',
        location: 'Field-based',
        type: 'part-time',
        description: 'Provide essential care and support to patients in their homes as a Certified Nursing Assistant with VIGEO Health.',
        requirements: [
          'Current CNA certification',
          'High school diploma or equivalent',
          'Reliable transportation',
          'Compassionate and patient-focused',
          'Ability to lift 50+ pounds'
        ],
        responsibilities: [
          'Assist with activities of daily living',
          'Monitor vital signs',
          'Provide personal care assistance',
          'Document care provided',
          'Report changes in patient condition'
        ],
        benefits: [
          'Flexible scheduling',
          'Competitive hourly rate',
          'Paid training',
          'Mileage reimbursement',
          'Opportunity for advancement'
        ],
        salary: {
          min: 18,
          max: 24,
          currency: 'USD',
          period: 'hourly'
        },
        status: 'active',
        postedBy: 'HR',
        postedAt: new Date(),
        applicationsCount: 0
      }
    ];
    
    // Store jobs in the proper subcollection structure
    const jobsCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'jobPostings');
    
    for (const job of sampleJobs) {
      const jobRef = doc(jobsCollection);
      await setDoc(jobRef, job);
      console.log(`✅ Created job posting: ${job.title}`);
    }
    
    console.log('✅ Sample job postings created successfully');
    return true;
  } catch (error) {
    console.error('Error creating sample jobs:', error);
    return false;
  }
};

/**
 * Check if database is already initialized
 */
export const checkDatabaseInitialization = async () => {
  try {
    const configDoc = await getDocs(
      collection(db, collections.VIGEO_HEALTH_CAREERS)
    );
    return !configDoc.empty;
  } catch (error) {
    console.error('Error checking database initialization:', error);
    return false;
  }
};