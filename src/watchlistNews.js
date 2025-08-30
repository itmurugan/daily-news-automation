import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchWatchlistNews } from './fetchWatchlistNews.js';
import { generateWatchlistReport } from './generateWatchlistReport.js';
import { sendEmailReportOAuth } from './sendEmailOAuth.js';
import { config } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runWatchlistNews() {
  console.log('🚀 Starting Watchlist News Report Generation...\n');
  
  try {
    // Step 1: Fetch watchlist-specific news
    console.log('📰 Fetching watchlist news from multiple sources...');
    const newsData = await fetchWatchlistNews();
    console.log(`✅ Fetched ${newsData.articles.length} watchlist-related articles\n`);
    
    // Save raw data for debugging
    const dataDir = path.join(__dirname, '..', 'data');
    await fs.ensureDir(dataDir);
    await fs.writeJson(
      path.join(dataDir, `watchlist-news-${new Date().toISOString().split('T')[0]}.json`),
      newsData,
      { spaces: 2 }
    );
    
    // Step 2: Generate HTML report
    console.log('📝 Generating watchlist news report...');
    const reportPath = await generateWatchlistReport(newsData);
    console.log(`✅ Report generated: ${reportPath}\n`);
    
    // Step 3: Send email (if enabled and not in test mode)
    let emailResult = { success: false };
    if (process.env.TEST_RUN === 'true') {
      console.log('\n🧪 TEST MODE: Skipping email send');
      console.log(`📧 In production, this would email the watchlist report to: ${config.email.to}`);
      emailResult = { success: 'skipped' };
    } else if (!config.sendEmails) {
      console.log('\nℹ️  Email sending is disabled in config');
      emailResult = { success: 'disabled' };
    } else {
      console.log(`\n📧 Sending Watchlist News Report email to ${config.email.to}...`);
      
      // Read the HTML report
      const reportHtml = await fs.readFile(reportPath, 'utf-8');
      
      // Send email using OAuth
      emailResult = await sendEmailReportOAuth(reportHtml, `📈 Watchlist News Report - ${new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`);
      
      if (emailResult.success) {
        console.log('✅ Watchlist news email sent successfully!');
        console.log(`   Message ID: ${emailResult.messageId}`);
      } else {
        throw new Error(`Failed to send watchlist email: ${emailResult.error}`);
      }
    }
    
    // Step 4: Summary
    console.log('📊 Watchlist News Report Summary:');
    console.log('================================');
    console.log(`Total Stocks: ${newsData.totalStocks}`);
    console.log(`Active Holdings: ${newsData.activeStocks}`);
    console.log(`Watching Only: ${newsData.watchingOnly}`);
    console.log(`Total Articles: ${newsData.articles.length}`);
    
    // Count articles by stock
    const stockCounts = {};
    newsData.articles.forEach(article => {
      if (article.relatedStocks) {
        article.relatedStocks.forEach(stock => {
          stockCounts[stock] = (stockCounts[stock] || 0) + 1;
        });
      }
    });
    
    // Show top 5 stocks with most news
    const topStocks = Object.entries(stockCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (topStocks.length > 0) {
      console.log('\nTop stocks with news:');
      topStocks.forEach(([stock, count]) => {
        console.log(`  • ${stock}: ${count} articles`);
      });
    }
    
    if (newsData.errors && newsData.errors.length > 0) {
      console.log('\n⚠️  Some sources had errors:');
      newsData.errors.forEach(err => {
        console.log(`  • Source ${err.source}: ${err.error.message}`);
      });
    }
    
    console.log('\n✨ Watchlist news report generation completed successfully!');
    
    return {
      success: true,
      articlesCount: newsData.articles.length,
      totalStocks: newsData.totalStocks,
      activeStocks: newsData.activeStocks,
      watchingOnly: newsData.watchingOnly,
      reportPath,
      emailSent: emailResult.success
    };
    
  } catch (error) {
    console.error('❌ Error in watchlist news generation:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runWatchlistNews();
}

export { runWatchlistNews };