import { fetchNewsFromSources } from './fetchNews.js';
import { generateHTMLReport } from './generateReport.js';
import { sendEmailReport } from './sendEmail.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runDailyNewsAutomation() {
  console.log('\n🚀 Starting Daily News Automation...');
  console.log('='.repeat(50));
  
  try {
    // Step 1: Fetch news from multiple sources
    console.log('\n🔍 Fetching news from multiple sources...');
    const newsData = await fetchNewsFromSources();
    
    if (!newsData.articles || newsData.articles.length === 0) {
      throw new Error('No news articles fetched');
    }
    
    console.log(`✅ Fetched ${newsData.articles.length} articles from ${[...new Set(newsData.articles.map(a => a.source))].length} sources`);
    
    // Display summary
    const categories = {};
    newsData.articles.forEach(article => {
      const cat = article.category || 'General';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    
    console.log('\n📊 News Summary by Category:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  • ${cat}: ${count} articles`);
    });
    
    // Step 2: Generate HTML report
    console.log('\n🎨 Generating HTML report...');
    const htmlReport = generateHTMLReport(newsData);
    
    // Save report locally
    const reportsDir = path.join(__dirname, '..', 'reports');
    await fs.ensureDir(reportsDir);
    
    const reportFilename = `news-report-${new Date().toISOString().split('T')[0]}.html`;
    const reportPath = path.join(reportsDir, reportFilename);
    await fs.writeFile(reportPath, htmlReport);
    console.log(`✅ Report saved locally: ${reportPath}`);
    
    // Step 3: Send email (skip if TEST_RUN=true)
    let emailResult = { success: false };
    if (process.env.TEST_RUN === 'true') {
      console.log('\n🧪 TEST MODE: Skipping email send');
      console.log('📧 In production, this would email the report to: itmurugan@gmail.com');
      emailResult = { success: 'skipped' };
    } else {
      console.log('\n📧 Sending email to itmurugan@gmail.com...');
      emailResult = await sendEmailReport(htmlReport);
      
      if (emailResult.success) {
        console.log('✅ Email sent successfully!');
        console.log(`   Message ID: ${emailResult.messageId}`);
      } else {
        throw new Error(`Failed to send email: ${emailResult.error}`);
      }
    }
    
    console.log('\n🎉 Daily News Automation completed successfully!');
    console.log('='.repeat(50));
    
    return {
      success: true,
      articlesCount: newsData.articles.length,
      reportPath,
      emailSent: emailResult.success
    };
    
  } catch (error) {
    console.error('\n❌ Error in Daily News Automation:', error.message);
    console.error(error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDailyNewsAutomation()
    .then(result => {
      console.log('\nResult:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('\nFailed:', error.message);
      process.exit(1);
    });
}