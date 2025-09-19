# Firebase Storage Rules Update Required

## Why the Error Occurred
Your Firebase Storage currently has all access denied (`allow read, write: if false`). This prevents authenticated users from uploading documents to their applications.

## How to Fix

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: "vigeoptwebsite"
3. Navigate to "Storage" in the left sidebar
4. Click on the "Rules" tab
5. Replace the current rules with the content from `storage.rules` file:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload/read their own application documents
    match /VIGEOHealthCareersWebsite/config/applications/{userId}/{jobId}/documents/{document} {
      allow read: if request.auth != null && (request.auth.uid == userId || request.auth.token.email == 'jriosvil@gmail.com');
      allow write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 10 * 1024 * 1024 // 10MB max file size
        && request.resource.contentType.matches('image/.*|application/pdf|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
    
    // Deny all other paths
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

6. Click "Publish" to apply the new rules

## What These Rules Do

- **Authenticated users can**:
  - Upload documents to their own application folders (up to 10MB per file)
  - Read their own uploaded documents
  - Only upload allowed file types: images, PDFs, Word documents

- **Admin (jriosvil@gmail.com) can**:
  - Read all uploaded documents from any user

- **Security features**:
  - Users can only access their own documents
  - File size limited to 10MB
  - Only specific file types allowed
  - All other paths are denied by default

## Alternative: Deploy via Firebase CLI

If you have Firebase CLI installed:

```bash
firebase deploy --only storage:rules
```

This will deploy the `storage.rules` file automatically.