# VIGEO Health Careers Portal

A comprehensive job application and management system for VIGEO Health.

## Features

- **Job Listings**: Browse and search available positions
- **User Authentication**: Secure login with Firebase Authentication
- **Application System**: Multi-step application form with draft saving
- **Document Upload**: Support for resumes, licenses, and certifications
- **Admin Dashboard**: Manage job postings and review applications
- **PDF Generation**: Download applications as professional PDFs
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- React 18 with Vite
- Firebase (Authentication, Firestore, Storage)
- React Router for navigation
- jsPDF for PDF generation
- CSS3 for styling

## Deployment

This application is deployed on Render at:
- Production: https://vigeocareers.onrender.com
- Custom Domain: careers.vigeohealth.org (pending DNS configuration)

## Environment Variables

Required for deployment:
- `NODE_VERSION`: 18

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm start
```

## Firebase Configuration

Ensure Firebase Authentication domains are configured to include:
- localhost:3000 (development)
- vigeocareers.onrender.com
- careers.vigeohealth.org

---

© 2025 VIGEO Health. All rights reserved.