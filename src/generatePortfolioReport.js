import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { format } from 'date-fns';
import { getPortfolioByCategory } from './portfolio.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function generatePortfolioReport(newsData) {
  const reportDate = format(new Date(), 'MMMM dd, yyyy');
  const reportTime = format(new Date(), 'h:mm a');
  
  // Group articles by related stocks
  const articlesByStock = {};
  const generalNews = [];
  
  newsData.articles.forEach(article => {
    if (article.relatedStocks && article.relatedStocks.length > 0) {
      article.relatedStocks.forEach(stock => {
        if (!articlesByStock[stock]) {
          articlesByStock[stock] = [];
        }
        articlesByStock[stock].push(article);
      });
    } else {
      generalNews.push(article);
    }
  });
  
  // Get portfolio categories
  const portfolioCategories = getPortfolioByCategory();
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio News Report - ${reportDate}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            background: #0a0e27;
            color: #e0e0e0;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 0;
            margin-bottom: 40px;
            border-radius: 0 0 20px 20px;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }
        
        .header-content {
            text-align: center;
            color: white;
        }
        
        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.95;
        }
        
        .date-time {
            margin-top: 10px;
            font-size: 1rem;
            opacity: 0.9;
        }
        
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .summary-card {
            background: #1a1f3a;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #2a3f5f;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .summary-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
        }
        
        .summary-card h3 {
            color: #667eea;
            font-size: 0.9rem;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .summary-card .number {
            font-size: 2rem;
            font-weight: bold;
            color: white;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section-header {
            background: linear-gradient(90deg, #1a1f3a 0%, #2a3f5f 100%);
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            border-left: 4px solid #667eea;
        }
        
        .section-header h2 {
            color: white;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .stock-count {
            background: #667eea;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.9rem;
        }
        
        .articles-grid {
            display: grid;
            gap: 20px;
        }
        
        .article-card {
            background: #1a1f3a;
            border: 1px solid #2a3f5f;
            border-radius: 10px;
            padding: 20px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .article-card:hover {
            transform: translateX(5px);
            border-color: #667eea;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
        }
        
        .article-card::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: #667eea;
            transform: scaleY(0);
            transition: transform 0.3s ease;
        }
        
        .article-card:hover::before {
            transform: scaleY(1);
        }
        
        .article-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }
        
        .article-source {
            background: #667eea;
            color: white;
            padding: 4px 10px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .article-title {
            color: white;
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 10px;
            line-height: 1.4;
        }
        
        .article-title a {
            color: white;
            text-decoration: none;
            transition: color 0.3s ease;
        }
        
        .article-title a:hover {
            color: #667eea;
        }
        
        .article-description {
            color: #b0b0b0;
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 10px;
        }
        
        .article-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.85rem;
            color: #808080;
        }
        
        .related-stocks {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .stock-tag {
            background: #2a3f5f;
            color: #667eea;
            padding: 3px 8px;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .category-badge {
            background: #2a3f5f;
            color: #a0a0a0;
            padding: 3px 8px;
            border-radius: 8px;
            font-size: 0.8rem;
        }
        
        .portfolio-overview {
            background: #1a1f3a;
            border: 1px solid #2a3f5f;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 40px;
        }
        
        .portfolio-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .portfolio-category {
            background: #0a0e27;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #2a3f5f;
        }
        
        .portfolio-category h3 {
            color: #667eea;
            font-size: 1rem;
            margin-bottom: 10px;
        }
        
        .stock-list {
            list-style: none;
            font-size: 0.9rem;
            color: #b0b0b0;
        }
        
        .stock-list li {
            padding: 3px 0;
            border-bottom: 1px solid #2a3f5f;
        }
        
        .stock-list li:last-child {
            border-bottom: none;
        }
        
        .footer {
            text-align: center;
            padding: 40px 20px;
            color: #808080;
            font-size: 0.9rem;
            border-top: 1px solid #2a3f5f;
            margin-top: 60px;
        }
        
        .no-news {
            text-align: center;
            padding: 40px;
            color: #808080;
            font-style: italic;
        }
        
        @media (max-width: 768px) {
            h1 {
                font-size: 2rem;
            }
            
            .container {
                padding: 10px;
            }
            
            .summary-cards {
                grid-template-columns: 1fr 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <div class="header-content">
                <h1>📊 Portfolio News Report</h1>
                <div class="subtitle">Personalized Market Intelligence for Your Holdings</div>
                <div class="date-time">${reportDate} · ${reportTime}</div>
            </div>
        </div>
    </div>
    
    <div class="container">
        <div class="summary-cards">
            <div class="summary-card">
                <h3>Total Articles</h3>
                <div class="number">${newsData.articles.length}</div>
            </div>
            <div class="summary-card">
                <h3>Portfolio Stocks</h3>
                <div class="number">${newsData.portfolioStocks}</div>
            </div>
            <div class="summary-card">
                <h3>Stocks with News</h3>
                <div class="number">${Object.keys(articlesByStock).length}</div>
            </div>
            <div class="summary-card">
                <h3>News Sources</h3>
                <div class="number">${new Set(newsData.articles.map(a => a.source)).size}</div>
            </div>
        </div>
        
        <div class="portfolio-overview">
            <h2 style="color: white; margin-bottom: 20px;">📈 Portfolio Composition</h2>
            <div class="portfolio-grid">
                ${Object.entries(portfolioCategories).map(([category, stocks]) => `
                    <div class="portfolio-category">
                        <h3>${category} (${stocks.length})</h3>
                        <ul class="stock-list">
                            ${stocks.slice(0, 5).map(stock => `
                                <li>${stock.name}</li>
                            `).join('')}
                            ${stocks.length > 5 ? `<li style="color: #667eea;">+${stocks.length - 5} more...</li>` : ''}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </div>
        
        ${Object.entries(articlesByStock)
          .sort((a, b) => b[1].length - a[1].length)
          .slice(0, 10)
          .map(([stock, articles]) => `
            <div class="section">
                <div class="section-header">
                    <h2>${stock} <span class="stock-count">${articles.length} news</span></h2>
                </div>
                <div class="articles-grid">
                    ${articles.slice(0, 5).map(article => `
                        <div class="article-card">
                            <div class="article-header">
                                <span class="article-source">${article.source}</span>
                                <span class="category-badge">${article.category}</span>
                            </div>
                            <h3 class="article-title">
                                <a href="${article.url}" target="_blank">${article.title}</a>
                            </h3>
                            <p class="article-description">${article.description}</p>
                            <div class="article-meta">
                                <span>${formatDate(article.publishedAt)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
        
        ${generalNews.length > 0 ? `
            <div class="section">
                <div class="section-header">
                    <h2>🌐 Market Overview <span class="stock-count">${generalNews.length} news</span></h2>
                </div>
                <div class="articles-grid">
                    ${generalNews.slice(0, 20).map(article => `
                        <div class="article-card">
                            <div class="article-header">
                                <span class="article-source">${article.source}</span>
                                <span class="category-badge">${article.category}</span>
                            </div>
                            <h3 class="article-title">
                                <a href="${article.url}" target="_blank">${article.title}</a>
                            </h3>
                            <p class="article-description">${article.description}</p>
                            <div class="article-meta">
                                <span>${formatDate(article.publishedAt)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        ${newsData.articles.length === 0 ? `
            <div class="no-news">
                No portfolio-related news found at this time.
            </div>
        ` : ''}
    </div>
    
    <div class="footer">
        <div class="container">
            <p>Portfolio News Report · Generated ${reportDate} at ${reportTime}</p>
            <p style="margin-top: 10px; color: #606060;">Tracking ${newsData.portfolioStocks} stocks across global markets</p>
        </div>
    </div>
</body>
</html>
  `;
  
  // Save the report
  const reportsDir = path.join(__dirname, '..', 'reports');
  await fs.ensureDir(reportsDir);
  
  const fileName = `portfolio-news-${format(new Date(), 'yyyy-MM-dd')}.html`;
  const filePath = path.join(reportsDir, fileName);
  
  await fs.writeFile(filePath, html);
  
  return filePath;
}

function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return format(date, 'MMM dd, yyyy');
    }
  } catch {
    return dateStr;
  }
}