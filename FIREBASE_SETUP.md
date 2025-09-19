# Firebase Configuration Instructions

## ⚠️ Important Security Note

The file `vigeoptwebsite-firebase-adminsdk-fbsvc-07503c6893 copy.json` is a **service account key** meant for backend/admin SDK usage only. **NEVER use this in a frontend application** as it contains private keys that would be exposed to users.

## Getting Your Web App Configuration

To properly configure Firebase for your React careers portal, you need the **Web App** configuration, not the Admin SDK. Follow these steps:

### 1. Go to Firebase Console
Visit: https://console.firebase.google.com/project/vigeoptwebsite/overview

### 2. Add a Web App (if not already done)
- Click the gear icon ⚙️ next to "Project Overview"
- Select "Project settings"
- Scroll down to "Your apps" section
- If no web app exists, click "</>" (Web) icon
- Register your app with a nickname like "VIGEO Health Careers"
- You'll get a configuration object

### 3. Copy Your Web Configuration
You'll see something like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...", // Your actual API key
  authDomain: "vigeoptwebsite.firebaseapp.com",
  projectId: "vigeoptwebsite",
  storageBucket: "vigeoptwebsite.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

### 4. Update src/firebase/config.js
Replace the placeholder values with your actual configuration.

## Current Configuration Status

I've pre-filled these values based on your project:
- ✅ `projectId`: "vigeoptwebsite"
- ✅ `authDomain`: "vigeoptwebsite.firebaseapp.com" 
- ✅ `storageBucket`: "vigeoptwebsite.appspot.com"

You still need to get from Firebase Console:
- ❌ `apiKey`: Your web API key
- ❌ `messagingSenderId`: Your sender ID
- ❌ `appId`: Your web app ID

## Security Best Practices

### For Development
- The web configuration is safe to include in your frontend code
- These are public identifiers, not secret keys

### For Production
Consider using environment variables:
1. Create a `.env.local` file:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=vigeoptwebsite.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vigeoptwebsite
VITE_FIREBASE_STORAGE_BUCKET=vigeoptwebsite.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. Update config.js to use environment variables:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ... etc
};
```

## Admin SDK File
Keep the `vigeoptwebsite-firebase-adminsdk-fbsvc-07503c6893 copy.json` file secure and use it only for:
- Backend services
- Cloud Functions
- Admin scripts
- Server-side applications

**Never commit this file to version control or use it in client-side code!**