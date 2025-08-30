import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { format } from 'date-fns';
import { getWatchlistByCategory, getActiveWatchlist, getWatchingOnlyStocks } from './watchlist.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function generateWatchlistReport(newsData) {
  const categories = getWatchlistByCategory();
  const activeStocks = getActiveWatchlist();
  const watchingOnly = getWatchingOnlyStocks();
  
  const stockMentions = {};
  newsData.articles.forEach(article => {
    if (article.relatedStocks) {
      article.relatedStocks.forEach(stock => {
        stockMentions[stock] = (stockMentions[stock] || 0) + 1;
      });
    }
  });
  
  const topMentioned = Object.entries(stockMentions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Watchlist News Report - ${format(new Date(), 'MMMM dd, yyyy')}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem;
      text-align: center;
    }
    
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }
    
    .header .subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
    }
    
    .header .date {
      font-size: 1rem;
      opacity: 0.8;
      margin-top: 0.5rem;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
      background: #f8f9fa;
    }
    
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .stat-card .value {
      font-size: 2rem;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 0.5rem;
    }
    
    .stat-card .label {
      color: #6c757d;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .content {
      padding: 2rem;
    }
    
    .section {
      margin-bottom: 3rem;
    }
    
    .section-title {
      font-size: 1.8rem;
      color: #333;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 3px solid #667eea;
    }
    
    .watchlist-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .category-card {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 12px;
      border-left: 4px solid #667eea;
    }
    
    .category-card h3 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }
    
    .stock-list {
      list-style: none;
    }
    
    .stock-list li {
      padding: 0.5rem 0;
      color: #666;
      font-size: 0.95rem;
      border-bottom: 1px solid #e9ecef;
    }
    
    .stock-list li:last-child {
      border-bottom: none;
    }
    
    .stock-list .ticker {
      font-weight: 600;
      color: #495057;
      margin-right: 0.5rem;
    }
    
    .stock-list .shares {
      float: right;
      color: #6c757d;
      font-size: 0.85rem;
    }
    
    .top-mentions {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }
    
    .mention-bar {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .mention-bar .stock-name {
      width: 200px;
      font-weight: 600;
      color: #333;
    }
    
    .mention-bar .bar {
      flex: 1;
      height: 30px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      border-radius: 15px;
      margin: 0 1rem;
      position: relative;
    }
    
    .mention-bar .count {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: white;
      font-weight: 600;
    }
    
    .news-grid {
      display: grid;
      gap: 2rem;
    }
    
    .news-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .news-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .news-card-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .news-card-content {
      padding: 1.5rem;
    }
    
    .news-card h3 {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
      color: #333;
      line-height: 1.4;
    }
    
    .news-card h3 a {
      color: inherit;
      text-decoration: none;
    }
    
    .news-card h3 a:hover {
      color: #667eea;
    }
    
    .news-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      font-size: 0.85rem;
      color: #6c757d;
    }
    
    .news-source {
      font-weight: 600;
      color: #667eea;
    }
    
    .news-description {
      color: #666;
      line-height: 1.6;
      margin-bottom: 1rem;
    }
    
    .related-stocks {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .stock-tag {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    
    .sentiment {
      display: inline-block;
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-left: 0.5rem;
    }
    
    .sentiment.positive {
      background: #28a745;
      color: white;
    }
    
    .sentiment.negative {
      background: #dc3545;
      color: white;
    }
    
    .sentiment.neutral {
      background: #6c757d;
      color: white;
    }
    
    .watching-only {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .watching-only h3 {
      color: #856404;
      margin-bottom: 1rem;
    }
    
    .watching-only-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.8rem;
    }
    
    .watching-tag {
      background: #ffc107;
      color: #856404;
      padding: 0.4rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 2rem;
      text-align: center;
      color: #6c757d;
      border-top: 1px solid #dee2e6;
    }
    
    .footer p {
      margin-bottom: 0.5rem;
    }
    
    .no-image {
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 3rem;
      font-weight: bold;
    }
    
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }
      
      .header h1 {
        font-size: 1.8rem;
      }
      
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📈 Watchlist News Report</h1>
      <div class="subtitle">Market Intelligence for Your Watchlist</div>
      <div class="date">${format(new Date(), 'EEEE, MMMM dd, yyyy')}</div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="value">${newsData.totalStocks}</div>
        <div class="label">Total Stocks</div>
      </div>
      <div class="stat-card">
        <div class="value">${newsData.activeStocks}</div>
        <div class="label">Holdings</div>
      </div>
      <div class="stat-card">
        <div class="value">${newsData.watchingOnly}</div>
        <div class="label">Watching Only</div>
      </div>
      <div class="stat-card">
        <div class="value">${newsData.articles.length}</div>
        <div class="label">News Articles</div>
      </div>
    </div>
    
    <div class="content">
      ${watchingOnly.length > 0 ? `
      <div class="watching-only">
        <h3>👁️ Watching (No Position)</h3>
        <div class="watching-only-list">
          ${watchingOnly.map(stock => `
            <span class="watching-tag">${stock.name}</span>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${topMentioned.length > 0 ? `
      <section class="section">
        <h2 class="section-title">🔥 Most Mentioned Stocks</h2>
        <div class="top-mentions">
          ${topMentioned.map(([stock, count], index) => {
            const maxCount = topMentioned[0][1];
            const width = (count / maxCount) * 100;
            return `
            <div class="mention-bar">
              <div class="stock-name">${stock}</div>
              <div class="bar" style="width: ${width}%">
                <span class="count">${count}</span>
              </div>
            </div>
            `;
          }).join('')}
        </div>
      </section>
      ` : ''}
      
      <section class="section">
        <h2 class="section-title">📊 Watchlist Overview</h2>
        <div class="watchlist-overview">
          ${Object.entries(categories).filter(([_, stocks]) => stocks.length > 0).map(([category, stocks]) => `
          <div class="category-card">
            <h3>${category} (${stocks.length})</h3>
            <ul class="stock-list">
              ${stocks.slice(0, 5).map(stock => `
                <li>
                  <span class="ticker">${stock.ticker.replace('SEHK:', '')}</span>
                  ${stock.name}
                  ${stock.shares > 0 ? `<span class="shares">${stock.shares.toLocaleString()} shares</span>` : '<span class="shares">Watching</span>'}
                </li>
              `).join('')}
              ${stocks.length > 5 ? `<li style="color: #667eea; font-style: italic;">...and ${stocks.length - 5} more</li>` : ''}
            </ul>
          </div>
          `).join('')}
        </div>
      </section>
      
      <section class="section">
        <h2 class="section-title">📰 Latest Watchlist News</h2>
        <div class="news-grid">
          ${newsData.articles.map(article => `
          <div class="news-card">
            ${article.image ? `
              <img src="${article.image}" alt="${article.title}" class="news-card-image" onerror="this.style.display='none'">
            ` : `
              <div class="news-card-image no-image">📊</div>
            `}
            <div class="news-card-content">
              <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
              <div class="news-meta">
                <span class="news-source">${article.source}</span>
                <span>${new Date(article.publishedAt).toLocaleDateString()}</span>
                ${article.sentiment ? `
                  <span class="sentiment ${article.sentiment.toLowerCase()}">${article.sentiment}</span>
                ` : ''}
              </div>
              ${article.description ? `
                <p class="news-description">${article.description}</p>
              ` : ''}
              ${article.relatedStocks && article.relatedStocks.length > 0 ? `
                <div class="related-stocks">
                  ${article.relatedStocks.map(stock => `
                    <span class="stock-tag">${stock}</span>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
          `).join('')}
        </div>
      </section>
    </div>
    
    <div class="footer">
      <p>📈 Watchlist News Report</p>
      <p>Generated on ${format(new Date(), 'MMMM dd, yyyy \'at\' HH:mm:ss')}</p>
      <p style="margin-top: 1rem; font-size: 0.9rem;">
        Tracking ${newsData.totalStocks} stocks | ${newsData.activeStocks} holdings | ${newsData.watchingOnly} on watchlist
      </p>
    </div>
  </div>
</body>
</html>
  `;
  
  const reportsDir = path.join(__dirname, '..', 'reports');
  await fs.ensureDir(reportsDir);
  
  const fileName = `watchlist-news-${format(new Date(), 'yyyy-MM-dd')}.html`;
  const filePath = path.join(reportsDir, fileName);
  
  await fs.writeFile(filePath, html);
  
  console.log(`📄 Watchlist report saved to: ${filePath}`);
  
  return filePath;
}