# OAuth Setup Instructions

## ✅ GitHub OAuth App Setup

### Steps to Create GitHub OAuth App:
1. Go to: https://github.com/settings/developers (while logged in)
2. Click "OAuth Apps" in left sidebar → "New OAuth App"
3. Fill in the form:
   - **Application name**: `SecureLens Dev`
   - **Homepage URL**: `http://localhost:3000`
   - **Application description**: `AI-Powered Security Intelligence Platform`
   - **Authorization callback URL**: `http://localhost:4000/auth/github/callback`
4. Click "Register application"
5. You'll see:
   - **Client ID** → Copy this
   - **Client Secret** → Click "Generate a new client secret" → Copy this
6. Update your `.env` file:
   ```
   GITHUB_CLIENT_ID=[Paste Client ID here]
   GITHUB_CLIENT_SECRET=[Paste Client Secret here]
   ```

### Scopes Required:
- `user:email` - Read email
- `public_repo` - Read public repos (auto-enabled for GitHub OAuth)

---

## ✅ Google OAuth App Setup

### Steps to Create Google OAuth App:
1. Go to: https://console.cloud.google.com/ (need Google account)
2. Create a new project:
   - Click "Select a project" (top bar)
   - Click "New Project"
   - **Project name**: `SecureLens`
   - **Location**: Leave as "No organization"
   - Click "Create"
3. Enable Google+ API:
   - In search bar, type "Google+ API"
   - Click "Google+ API"
   - Click "Enable"
4. Create OAuth Consent Screen:
   - Left sidebar → "OAuth consent screen"
   - **User Type**: External
   - Click "Create"
   - Fill form:
     - **App name**: SecureLens
     - **User support email**: [Your email]
     - **Developer contact**: [Your email]
   - Click "Save and Continue"
   - Skip "Scopes" step
   - Click "Save and Continue"
   - Click "Back to Dashboard"
5. Create OAuth Credentials:
   - Left sidebar → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - **Application type**: Web application
   - **Name**: SecureLens Frontend
   - **Authorized redirect URIs**:
     - `http://localhost:4000/auth/google/callback`
   - Click "Create"
6. You'll see a popup with:
   - **Client ID** → Copy this
   - **Client Secret** → Copy this
7. Update your `.env` file:
   ```
   GOOGLE_CLIENT_ID=[Paste Client ID here]
   GOOGLE_CLIENT_SECRET=[Paste Client Secret here]
   ```

### Scopes Required:
- `openid`
- `email`
- `profile`

---

## After Getting Credentials

Update `/home/stavan/SecureLens/.env`:
```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

Then restart the backend:
```bash
cd /home/stavan/SecureLens/apps/backend
npm run dev
```

OAuth will now work! Users can click "Continue with GitHub" or "Continue with Google" during login.

---

## For Production

### GitHub OAuth (Production):
- **Callback URL**: `https://yourdomain.com/auth/github/callback`
- **Homepage URL**: `https://yourdomain.com`

### Google OAuth (Production):
- **Authorized redirect URIs**: `https://yourdomain.com/auth/google/callback`
