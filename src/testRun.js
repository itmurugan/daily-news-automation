import { fetchNewsFromSources } from './fetchNews.js';
import { generateHTMLReport } from './generateReport.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testNewsAutomation() {
  console.log('\n🧪 TEST MODE: Daily News Automation');
  console.log('='.repeat(50));
  
  try {
    // Step 1: Fetch news
    console.log('\n🔍 Fetching news from multiple sources...');
    const newsData = await fetchNewsFromSources();
    
    console.log(`✅ Fetched ${newsData.articles.length} articles`);
    
    // Display summary
    const categories = {};
    const sources = new Set();
    newsData.articles.forEach(article => {
      const cat = article.category || 'General';
      categories[cat] = (categories[cat] || 0) + 1;
      sources.add(article.source);
    });
    
    console.log('\n📊 News Summary:');
    console.log(`   Sources: ${Array.from(sources).join(', ')}`);
    console.log('   Categories:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`     • ${cat}: ${count} articles`);
    });
    
    // Step 2: Generate report
    console.log('\n🎨 Generating HTML report...');
    const htmlReport = generateHTMLReport(newsData);
    
    // Save report
    const reportsDir = path.join(__dirname, '..', 'reports');
    await fs.ensureDir(reportsDir);
    
    const reportFilename = `test-news-report-${new Date().toISOString().split('T')[0]}.html`;
    const reportPath = path.join(reportsDir, reportFilename);
    await fs.writeFile(reportPath, htmlReport);
    
    console.log(`✅ Test report saved: ${reportPath}`);
    console.log('\n📖 Sample articles:');
    
    // Show first 3 articles as preview
    newsData.articles.slice(0, 3).forEach((article, i) => {
      console.log(`\n   ${i + 1}. ${article.title}`);
      console.log(`      Source: ${article.source} | Category: ${article.category}`);
      console.log(`      ${article.description?.slice(0, 100)}...`);
    });
    
    console.log('\n🎉 Test completed successfully!');
    console.log(`📧 In production, this would email the report to: itmurugan@gmail.com`);
    console.log('='.repeat(50));
    
    return {
      success: true,
      articlesCount: newsData.articles.length,
      reportPath,
      categories: Object.keys(categories),
      sources: Array.from(sources)
    };
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  }
}

// Run the test
testNewsAutomation()
  .then(result => {
    console.log('\n✅ Test Result:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test Failed:', error.message);
    process.exit(1);
  });