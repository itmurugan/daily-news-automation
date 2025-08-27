import { google } from 'googleapis';
import readline from 'readline';
import fs from 'fs';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Gmail OAuth2 Setup Helper');
console.log('============================\n');

// Check if credentials file exists
const credentialsPath = process.argv[2];
if (!credentialsPath) {
  console.log('Usage: node oauth-helper.js path/to/credentials.json');
  console.log('\nExample: node oauth-helper.js ~/Downloads/client_secret.json');
  process.exit(1);
}

try {
  // Read credentials
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  
  let clientId, clientSecret, redirectUri;
  
  // Handle different credential file formats
  if (credentials.installed) {
    clientId = credentials.installed.client_id;
    clientSecret = credentials.installed.client_secret;
    redirectUri = credentials.installed.redirect_uris[0];
  } else if (credentials.web) {
    clientId = credentials.web.client_id;
    clientSecret = credentials.web.client_secret;
    redirectUri = credentials.web.redirect_uris[0] || 'http://localhost';
  } else {
    clientId = credentials.client_id;
    clientSecret = credentials.client_secret;
    redirectUri = 'http://localhost';
  }
  
  console.log('Found credentials:');
  console.log('Client ID:', clientId);
  console.log('Redirect URI:', redirectUri);
  console.log('');
  
  // Create OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
  
  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send'],
    prompt: 'consent'
  });
  
  console.log('Step 1: Open this URL in your browser:');
  console.log('=======================================');
  console.log(authUrl);
  console.log('');
  console.log('Step 2: After authorization, you will be redirected.');
  console.log('        Copy the "code" parameter from the URL.');
  console.log('        (It will be in the URL after ?code=...)');
  console.log('');
  
  rl.question('Step 3: Paste the authorization code here: ', async (code) => {
    try {
      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      
      console.log('\n✅ Success! Here are your tokens:');
      console.log('==================================');
      console.log('Refresh Token:', tokens.refresh_token);
      console.log('');
      console.log('Add these to your .env file:');
      console.log('-----------------------------');
      console.log(`GMAIL_CLIENT_ID=${clientId}`);
      console.log(`GMAIL_CLIENT_SECRET=${clientSecret}`);
      console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
      console.log('');
      console.log('Or add to GitHub secrets:');
      console.log('-------------------------');
      console.log(`gh secret set GMAIL_CLIENT_ID --body "${clientId}"`);
      console.log(`gh secret set GMAIL_CLIENT_SECRET --body "${clientSecret}"`);
      console.log(`gh secret set GMAIL_REFRESH_TOKEN --body "${tokens.refresh_token}"`);
      
    } catch (error) {
      console.error('\n❌ Error getting tokens:', error.message);
      console.error('Make sure you copied the complete authorization code.');
    }
    
    rl.close();
  });
  
} catch (error) {
  console.error('❌ Error reading credentials file:', error.message);
  console.error('Make sure the file path is correct and the file is valid JSON.');
  process.exit(1);
}