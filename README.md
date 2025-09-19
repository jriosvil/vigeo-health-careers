# VIGEO Health Careers Portal

A modern careers portal for VIGEO Health built with React and Firebase, featuring authentication and job listings management.

## Features

- **User Authentication**: Secure login and signup system
- **Job Listings**: Browse and search available positions
- **Responsive Design**: Mobile-friendly interface following VIGEO Health brand guidelines
- **Firebase Integration**: Real-time database with Firestore
- **Role-based Access**: Different views for applicants and administrators

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Copy your Firebase configuration
   - Update `src/firebase/config.js` with your Firebase credentials

3. **Initialize Database Structure**
   - The database uses a top-level collection called `VIGEO Health Careers Website`
   - Subcollections include: users, jobPostings, applications, departments, savedJobs

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/
│   ├── auth/          # Login and Signup components
│   ├── home/          # Home page and job listings
│   └── layout/        # Navigation and layout components
├── contexts/          # React contexts (Authentication)
├── firebase/          # Firebase configuration and schema
├── styles/            # CSS styles following VIGEO Health brand
├── App.jsx            # Main app component with routing
└── main.jsx          # Entry point
```

## Database Schema

### Top Collection: `VIGEO Health Careers Website`

All data is organized under this single top-level collection.

### Subcollections:
- **users**: User profiles and authentication data
- **jobPostings**: Available job positions
- **applications**: Job applications from candidates
- **departments**: Organization departments
- **savedJobs**: User's saved job listings

## Technologies Used

- React 18
- Firebase (Authentication & Firestore)
- React Router v6
- Vite (Build tool)
- CSS3 with custom properties

## Brand Guidelines

The application follows VIGEO Health's brand guidelines with:
- Brand colors: #af2d2c (primary red), #8b2322 (dark variant)
- Montserrat font family
- Glass morphism design elements
- Cozy healthcare aesthetic with warm tones

## Deployment

1. Build the production version:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting service

## Security Notes

- Never commit Firebase credentials to version control
- Use environment variables for sensitive configuration
- Enable Firebase Security Rules to protect data access