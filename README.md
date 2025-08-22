# Daily News Automation

Automated daily news fetcher that generates professional Bloomberg-style HTML reports and delivers them to your inbox every morning.

## Features

- 📰 Fetches news from multiple sources (Reuters, TechCrunch, Hacker News, BBC, CNN)
- 🎨 Generates beautiful HTML reports with artifact-style formatting
- 📧 Automatically emails reports to your inbox
- 🔄 Runs daily via GitHub Actions
- 📋 Categorizes news by topic
- 📈 Includes news statistics and summaries

## Setup Instructions

### 1. Repository Setup

1. Fork or clone this repository
2. Copy `.env.example` to `.env` and configure your settings

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