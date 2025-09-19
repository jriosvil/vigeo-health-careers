# VIGEO Health Careers Database Structure

## Overview

This document outlines the complete database structure for the VIGEO Health Careers Website within Firestore. All data is organized under the main collection `VIGEOHealthCareersWebsite` with a central `config` document that contains all subcollections.

## Database Hierarchy

```
📁 VIGEOHealthCareersWebsite (Main Collection)
└── 📄 config (Configuration Document)
    ├── 📂 applications (Job Applications)
    ├── 📂 attachments (User Submitted Files)
    ├── 📂 interviews (Interview Scheduling & Records)
    ├── 📂 jobPostings (Active Job Listings)
    ├── 📂 users (User Profiles & Authentication)
    ├── 📂 departments (Organization Structure)
    ├── 📂 savedJobs (User Bookmarked Positions)
    ├── 📂 notifications (System & User Notifications)
    └── 📂 analytics (Application & Job Metrics)
```

## Detailed Subcollection Schemas

### 1. applications

Stores all job applications submitted by candidates.

```javascript
{
  id: "auto-generated",
  jobId: "reference to jobPostings",
  applicantId: "reference to users",
  status: "pending" | "reviewing" | "interview" | "offered" | "rejected" | "withdrawn",
  appliedAt: timestamp,
  resume: "attachmentId",
  coverLetter: "attachmentId",
  answers: [
    {
      question: "string",
      answer: "string"
    }
  ],
  statusHistory: [
    {
      status: "string",
      changedBy: "userId",
      changedAt: timestamp,
      notes: "string"
    }
  ],
  hrNotes: [],
  scorecard: {
    skills: 0-10,
    experience: 0-10,
    culture_fit: 0-10,
    overall: 0-10
  }
}
```

### 2. attachments

Stores metadata for all user-submitted files (resumes, cover letters, certifications).

```javascript
{
  id: "auto-generated",
  userId: "reference to users",
  applicationId: "reference to applications (optional)",
  fileType: "resume" | "cover_letter" | "certification" | "portfolio" | "other",
  fileName: "original_filename.pdf",
  fileUrl: "firebase_storage_url",
  fileSize: bytes,
  mimeType: "application/pdf",
  uploadedAt: timestamp,
  expiresAt: timestamp (optional),
  isActive: boolean,
  scanStatus: "pending" | "clean" | "flagged" (for virus/malware scanning)
}
```

### 3. interviews

Manages interview scheduling and records.

```javascript
{
  id: "auto-generated",
  applicationId: "reference to applications",
  candidateId: "reference to users",
  interviewerId: "reference to users",
  jobId: "reference to jobPostings",
  type: "phone_screen" | "technical" | "behavioral" | "panel" | "final",
  scheduledDate: timestamp,
  duration: minutes,
  location: "remote" | "onsite" | "hybrid",
  meetingLink: "string (for remote)",
  status: "scheduled" | "completed" | "cancelled" | "no_show" | "rescheduled",
  feedback: {
    rating: 1-5,
    strengths: [],
    concerns: [],
    recommendation: "strong_yes" | "yes" | "maybe" | "no" | "strong_no",
    notes: "string"
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4. jobPostings

Active and archived job listings.

```javascript
{
  id: "auto-generated",
  title: "string",
  department: "string",
  location: "string",
  type: "full-time" | "part-time" | "contract" | "internship",
  description: "string",
  requirements: [],
  responsibilities: [],
  benefits: [],
  salary: {
    min: number,
    max: number,
    currency: "USD",
    period: "annual" | "hourly"
  },
  status: "draft" | "active" | "paused" | "closed" | "filled",
  postedBy: "userId",
  postedAt: timestamp,
  closedAt: timestamp,
  targetHireDate: timestamp,
  applicationsCount: number,
  viewsCount: number,
  hiringManager: "userId",
  requisitionId: "string",
  tags: []
}
```

### 5. users

User profiles and authentication data.

```javascript
{
  uid: "firebase_auth_uid",
  email: "string",
  firstName: "string",
  lastName: "string",
  role: "applicant" | "admin" | "hr" | "hiring_manager" | "interviewer",
  status: "active" | "inactive" | "suspended",
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLoginAt: timestamp,
  profile: {
    phone: "string",
    location: "string",
    linkedIn: "string",
    portfolio: "string",
    resume: "attachmentId",
    skills: [],
    experience: [
      {
        company: "string",
        title: "string",
        startDate: date,
        endDate: date,
        current: boolean,
        description: "string"
      }
    ],
    education: [
      {
        institution: "string",
        degree: "string",
        field: "string",
        graduationYear: year
      }
    ],
    certifications: [],
    preferences: {
      jobTypes: [],
      locations: [],
      departments: [],
      salaryExpectation: {
        min: number,
        max: number
      }
    }
  },
  notifications: {
    email: boolean,
    sms: boolean,
    applicationUpdates: boolean,
    newJobs: boolean,
    newsletter: boolean
  }
}
```

### 6. departments

Organization structure and departments.

```javascript
{
  id: "auto-generated",
  name: "string",
  description: "string",
  managerId: "userId",
  parentDepartment: "departmentId (optional)",
  active: boolean,
  employeeCount: number,
  openPositions: number,
  budget: {
    allocated: number,
    used: number,
    year: year
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 7. savedJobs

User bookmarked positions for later application.

```javascript
{
  id: "auto-generated",
  userId: "reference to users",
  jobId: "reference to jobPostings",
  savedAt: timestamp,
  notes: "string (personal notes)",
  reminder: timestamp (optional),
  applied: boolean
}
```

### 8. notifications

System and user-specific notifications.

```javascript
{
  id: "auto-generated",
  userId: "reference to users",
  type: "application_update" | "interview_scheduled" | "new_message" | "job_match" | "system",
  title: "string",
  message: "string",
  data: {
    // Additional context data
    applicationId: "string",
    jobId: "string",
    interviewId: "string"
  },
  priority: "low" | "medium" | "high",
  read: boolean,
  createdAt: timestamp,
  readAt: timestamp,
  expiresAt: timestamp
}
```

### 9. analytics

Application and job posting metrics for reporting.

```javascript
{
  id: "auto-generated",
  type: "job_metrics" | "application_metrics" | "user_metrics",
  period: "daily" | "weekly" | "monthly",
  date: timestamp,
  metrics: {
    // For job_metrics
    totalViews: number,
    uniqueViews: number,
    applications: number,
    conversionRate: percentage,
    avgTimeOnPage: seconds,
    sourceBreakdown: {
      direct: number,
      indeed: number,
      linkedin: number,
      referral: number
    },
    
    // For application_metrics
    totalApplications: number,
    statusBreakdown: {
      pending: number,
      reviewing: number,
      interview: number,
      offered: number,
      rejected: number
    },
    avgTimeToHire: days,
    
    // For user_metrics
    newUsers: number,
    activeUsers: number,
    returningUsers: number,
    completedProfiles: percentage
  },
  createdAt: timestamp
}
```

## Security Rules Structure

```javascript
// Basic security rules for the collections
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Main collection access
    match /VIGEOHealthCareersWebsite/{document=**} {
      // Authenticated users can read
      allow read: if request.auth != null;
      
      // Only admins and HR can write
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/VIGEOHealthCareersWebsite/config/users/$(request.auth.uid)).data.role in ['admin', 'hr'];
    }
    
    // User-specific rules
    match /VIGEOHealthCareersWebsite/config/users/{userId} {
      // Users can read and update their own profile
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    
    // Applications - users can create and read their own
    match /VIGEOHealthCareersWebsite/config/applications/{applicationId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.applicantId || 
         get(/databases/$(database)/documents/VIGEOHealthCareersWebsite/config/users/$(request.auth.uid)).data.role in ['admin', 'hr']);
    }
  }
}
```

## Indexes Required


1. **applications**
   * Composite: `jobId` + `status` + `appliedAt`
   * Composite: `applicantId` + `status`
   * Single: `status`
2. **jobPostings**
   * Composite: `status` + `postedAt`
   * Composite: `department` + `status`
   * Single: `location`
3. **interviews**
   * Composite: `candidateId` + `scheduledDate`
   * Composite: `interviewerId` + `scheduledDate`
   * Single: `status`
4. **notifications**
   * Composite: `userId` + `read` + `createdAt`
   * Single: `expiresAt`

## Migration & Maintenance Notes


1. **Data Migration**
   * All existing data should be migrated to fit this structure
   * Use batch operations for large data migrations
   * Maintain backward compatibility during transition
2. **Backup Strategy**
   * Daily automated backups of all collections
   * Weekly full database exports
   * Point-in-time recovery enabled
3. **Performance Optimization**
   * Implement pagination for large collections
   * Use Firebase caching for frequently accessed data
   * Archive old applications after 1 year
4. **Compliance & Privacy**
   * Implement data retention policies
   * GDPR compliance for EU applicants
   * Regular audits of access logs
   * Encryption of sensitive data fields

## Future Enhancements


1. **AI/ML Integration**
   * Resume parsing and skill extraction
   * Job matching algorithms
   * Predictive analytics for hiring success
2. **Additional Collections to Consider**
   * `messages` - Internal messaging system
   * `assessments` - Technical/skill assessments
   * `referrals` - Employee referral tracking
   * `events` - Recruitment events and job fairs
   * `templates` - Email and document templates
3. **Integration Points**
   * ATS (Applicant Tracking System) APIs
   * HRIS (Human Resources Information System)
   * Background check services
   * Video interview platforms


---

## Version History

* **v1.0.0** (September 2025) - Initial database structure
* Last Updated: September 18, 2025
* Author: VIGEO Health Development Team


