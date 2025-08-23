# 🚀 Daily Business News Automation

> **AI-Powered Bloomberg-Style Business News Digest Delivered to Your Inbox**

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-automated-blue.svg)](https://github.com/features/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Transform your morning routine with professionally curated business news from USA 🇺🇸, Hong Kong 🇭🇰, Singapore 🇸🇬, and India 🇮🇳 markets - delivered automatically to your inbox every day.

## ✨ Key Features

- 🤖 **AI-Powered Curation**: Bloomberg-news-fetcher agent intelligently selects relevant business content
- 📊 **Professional Formatting**: Bloomberg-style HTML reports with market categorization  
- 🌍 **Multi-Regional Coverage**: 46+ articles daily from 6 financial news sources
- ⚡ **Fully Automated**: GitHub Actions scheduling with zero maintenance
- 🔒 **Enterprise Security**: Encrypted secrets and secure authentication
- 📱 **Mobile Responsive**: Optimized for reading on any device

## 🚀 Quick Start

### Option 1: Personal Use (5 minutes)
```bash
git clone https://github.com/YOUR-USERNAME/daily-news-automation.git
cd daily-news-automation
npm install
cp .env.example .env
# Edit .env with your Gmail credentials (see SETUP.md)
npm run daily-news
```

### Option 2: Automated Daily Delivery
1. Fork this repository to your GitHub account
2. Update `.env.example` with your email credentials
3. Set GitHub secrets with your email configuration
4. Enable GitHub Actions
5. Receive daily news automatically!

**📖 Detailed Setup Guide: [SETUP.md](./SETUP.md)**

## 🚨 Important: Configure Your Email

**⚠️ CHANGE EMAIL ADDRESSES TO AVOID SPAM**

Before running, update these files:
- **`.env`** - Replace `your-email@gmail.com` with your actual email
- **GitHub Secrets** - Set `EMAIL_TO` to your email address

## Setup Instructions

### 2. Email Configuration

For Gmail (recommended):

1. Enable 2-factor authentication on your Google account
2. Generate an "App Password" for this application:
   - Go to Google Account settings → Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use your Gmail address and the generated app password

### 3. GitHub Secrets Setup

Add these secrets to your GitHub repository:

- `EMAIL_FROM`: Your Gmail address (e.g., `your-email@gmail.com`)
- `EMAIL_USER`: Your Gmail address (same as EMAIL_FROM)
- `EMAIL_PASS`: Your Gmail app password (16-character password from step 2)

To add secrets:
1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with the exact names above

### 4. Install Dependencies

```bash
npm install
```

### 5. Test the Setup

```bash
# Test news fetching
npm run fetch-news

# Test complete pipeline
npm run daily-news
```

## Usage

### Manual Run

```bash
npm run daily-news
```

### Scheduled Automation

The GitHub Actions workflow runs automatically every day at 7:00 AM UTC. You can:

1. **Adjust the schedule**: Edit `.github/workflows/daily-news.yml` and change the cron expression
2. **Manual trigger**: Go to Actions tab → "Daily News Automation" → "Run workflow"
3. **Test mode**: Use manual trigger with "Run as test" option to skip email sending

## Customization

### News Sources

Edit `src/fetchNews.js` to add or remove news sources.

### Report Styling

Modify `src/generateReport.js` to customize the HTML template and styling.

### Email Settings

Update `src/config.js` for email configuration changes.

### Schedule Changes

Modify the cron expression in `.github/workflows/daily-news.yml`:

```yaml
schedule:
  - cron: '0 7 * * *'  # Daily at 7:00 AM UTC
```

Common schedules:
- `'0 8 * * *'` - 8:00 AM UTC daily
- `'0 12 * * 1-5'` - Noon UTC, weekdays only
- `'0 6 * * *'` - 6:00 AM UTC daily

## File Structure

```
daily-news-automation/
├── .github/workflows/
│   └── daily-news.yml          # GitHub Actions workflow
├── src/
│   ├── config.js               # Configuration settings
│   ├── fetchNews.js            # News fetching logic
│   ├── generateReport.js       # HTML report generation
│   ├── sendEmail.js            # Email sending logic
│   └── dailyNews.js            # Main automation script
├── reports/                    # Generated reports (local)
├── .env.example               # Environment variables template
├── package.json               # Node.js dependencies
└── README.md                  # This file
```

## Troubleshooting

### Email Not Sending

1. Verify your Gmail app password is correct
2. Check that 2FA is enabled on your Google account
3. Ensure secrets are properly set in GitHub

### News Not Fetching

1. Check internet connectivity in GitHub Actions
2. Some news sources may be temporarily unavailable
3. Rate limiting may occur with excessive requests

### GitHub Actions Not Running

1. Ensure the repository has Actions enabled
2. Check that the workflow file is in the correct location
3. Verify the cron syntax is correct

## License

MIT License

## Contributing

Feel free to submit issues and enhancement requests!