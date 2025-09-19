# Fix Firebase Storage CORS Issues

To fix the CORS errors preventing file uploads, run this command in your terminal:

```bash
gsutil cors set cors.json gs://vigeoptwebsite.firebasestorage.app
```

## Prerequisites
1. Install Google Cloud SDK if not already installed:
   ```bash
   brew install google-cloud-sdk
   ```

2. Authenticate with your Google account:
   ```bash
   gcloud auth login
   ```

3. Set your project:
   ```bash
   gcloud config set project vigeoptwebsite
   ```

4. Then run the CORS command above.

## Alternative: Firebase Console
You can also enable CORS through Firebase Console:
1. Go to Firebase Console > Storage
2. Click on Rules tab
3. Ensure rules allow authenticated writes

## Temporary Solution
The application has been updated to work without Storage temporarily. Documents will be tracked but files won't be uploaded until CORS is fixed.