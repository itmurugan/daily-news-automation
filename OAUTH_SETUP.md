# Gmail OAuth2 Setup Guide (Modern Security)

This guide shows how to set up OAuth2 for secure Gmail integration without using app passwords.

## 🔐 Why OAuth2?
- **More secure** than app passwords
- **Google recommended** modern authentication
- **Better access control** and monitoring
- **Supports 2FA** without compromising security

## 📋 Setup Steps

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"** or select existing project
3. Name it: `Daily News Automation`

### Step 2: Enable Gmail API
1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **"Gmail API"**
3. Click on it and press **"Enable"**

### Step 3: Create OAuth2 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure **OAuth consent screen**:
   - User Type: **External**
   - App name: `Daily News Automation`
   - User support email: Your email
   - Developer contact: Your email
4. For OAuth client ID:
   - Application type: **Desktop application**
   - Name: `Daily News Automation`
5. **Download** the JSON file (contains CLIENT_ID and CLIENT_SECRET)

### Step 4: Get Refresh Token
1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the **settings gear** (⚙️) in top right
3. Check **"Use your own OAuth credentials"**
4. Enter your **CLIENT_ID** and **CLIENT_SECRET**
5. In left panel, find **Gmail API v1** → **https://www.googleapis.com/auth/gmail.send**
6. Click **"Authorize APIs"**
7. Sign in with your Gmail account
8. Click **"Exchange authorization code for tokens"**
9. Copy the **refresh_token**

### Step 5: Update Environment Variables
Add these to your `.env` file:

```env
# OAuth2 Configuration
GMAIL_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret-here
GMAIL_REFRESH_TOKEN=your-refresh-token-here
```

### Step 6: Update GitHub Secrets
Add these secrets to your GitHub repository:

```bash
gh secret set GMAIL_CLIENT_ID --body "your-client-id"
gh secret set GMAIL_CLIENT_SECRET --body "your-client-secret"  
gh secret set GMAIL_REFRESH_TOKEN --body "your-refresh-token"
```

## 🧪 Testing

Test the OAuth2 setup:
```bash
npm run daily-news
```

The system will:
1. **Try OAuth2 first** (modern security)
2. **Fallback to app password** if OAuth2 fails
3. **Show which method succeeded** in the logs

## 🔒 Security Benefits

- ✅ **No plaintext passwords** in environment
- ✅ **Granular permissions** (only send email)
- ✅ **Token-based** authentication
- ✅ **Automatic token refresh**
- ✅ **Google's recommended** approach

## 🆘 Troubleshooting

**"Invalid grant" error:**
- Refresh token may have expired
- Re-run the OAuth playground steps

**"Access denied" error:**
- Check Gmail API is enabled
- Verify OAuth consent screen is published

**"Credentials invalid" error:**
- Double-check CLIENT_ID and CLIENT_SECRET
- Ensure they match your Google Cloud project

## 📧 Fallback Option

If OAuth2 setup is complex, the system automatically falls back to the basic app password method. Both work, but OAuth2 is more secure and future-proof.