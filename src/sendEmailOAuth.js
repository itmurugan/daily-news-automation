import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { config } from './config.js';

const OAuth2 = google.auth.OAuth2;

// Create OAuth2 client
const createOAuth2Client = () => {
  return new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground' // Redirect URL
  );
};

// Get access token using refresh token
const getAccessToken = async (oauth2Client) => {
  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });
  
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

export async function sendEmailReportOAuth(htmlContent, subject = null) {
  try {
    // Create OAuth2 client
    const oauth2Client = createOAuth2Client();
    
    // Get access token
    const accessToken = await getAccessToken(oauth2Client);
    
    // Create transporter with OAuth2
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: config.email.from,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken
      }
    });

    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const mailOptions = {
      from: config.email.from,
      to: config.email.to,
      subject: subject || `📈 Daily Business News Digest - ${today}`,
      html: htmlContent,
      attachments: [{
        filename: `business-news-digest-${new Date().toISOString().split('T')[0]}.html`,
        content: htmlContent
      }]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully using OAuth2:', info.messageId);
    return { success: true, messageId: info.messageId, method: 'OAuth2' };
    
  } catch (error) {
    console.error('❌ OAuth2 email error:', error.message);
    
    // Fallback to basic auth if OAuth2 fails
    console.log('🔄 Attempting fallback to basic authentication...');
    return await fallbackToBasicAuth(htmlContent, subject);
  }
}

// Fallback function using basic authentication
async function fallbackToBasicAuth(htmlContent, subject) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.auth.user,
        pass: process.env.EMAIL_PASS || config.email.auth.pass
      }
    });

    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const mailOptions = {
      from: config.email.from,
      to: config.email.to,
      subject: subject || `📈 Daily Business News Digest - ${today}`,
      html: htmlContent,
      attachments: [{
        filename: `business-news-digest-${new Date().toISOString().split('T')[0]}.html`,
        content: htmlContent
      }]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully using basic auth:', info.messageId);
    return { success: true, messageId: info.messageId, method: 'BasicAuth' };
    
  } catch (error) {
    console.error('❌ Fallback email error:', error.message);
    return { success: false, error: error.message };
  }
}