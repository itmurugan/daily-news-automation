import nodemailer from 'nodemailer';
import { config } from './config.js';

export async function sendEmailReport(htmlContent, subject = null) {
  const transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
      user: config.email.auth.user,
      pass: config.email.auth.pass
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
    subject: subject || `📰 Daily News Digest - ${today}`,
    html: htmlContent,
    attachments: [{
      filename: `news-digest-${new Date().toISOString().split('T')[0]}.html`,
      content: htmlContent
    }]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}