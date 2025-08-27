import { runDailyNews } from './dailyNews.js';
import { runPortfolioNews } from './portfolioNews.js';

async function runAllNews() {
  console.log('🚀 Starting Combined News Report Generation...\n');
  console.log('=' .repeat(60));
  
  const results = {
    dailyNews: null,
    portfolioNews: null
  };
  
  try {
    // Run daily market briefing
    console.log('\n📈 PART 1: Daily Market Briefing\n');
    console.log('-'.repeat(60));
    results.dailyNews = await runDailyNews();
    console.log('\n✅ Daily Market Briefing completed');
    console.log('-'.repeat(60));
    
    // Add a small delay between reports
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Run portfolio news
    console.log('\n📊 PART 2: Portfolio News Report\n');
    console.log('-'.repeat(60));
    results.portfolioNews = await runPortfolioNews();
    console.log('\n✅ Portfolio News Report completed');
    console.log('-'.repeat(60));
    
    // Summary
    console.log('\n');
    console.log('=' .repeat(60));
    console.log('🎉 All news reports generated successfully!');
    console.log('=' .repeat(60));
    console.log('\n📋 Summary:');
    console.log('  • Daily Market Briefing: Generated');
    console.log('  • Portfolio News Report: Generated');
    
    const isTestMode = process.env.TEST_RUN === 'true';
    if (isTestMode) {
      console.log('\n🧪 Running in TEST MODE - Emails not sent');
    } else {
      const dailyEmailStatus = results.dailyNews?.emailSent || 'unknown';
      const portfolioEmailStatus = results.portfolioNews?.emailSent || 'unknown';
      
      console.log('\n📧 Email Status:');
      console.log(`  • Daily Market Briefing: ${dailyEmailStatus === true ? 'Sent' : dailyEmailStatus}`);
      console.log(`  • Portfolio News Report: ${portfolioEmailStatus === true ? 'Sent' : portfolioEmailStatus}`);
    }
    
    return results;
    
  } catch (error) {
    console.error('\n❌ Error in combined news generation:', error);
    console.log('\nPartial results:', results);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllNews();
}

export { runAllNews };