import { format } from 'date-fns';
import { config } from './config.js';

export function generateHTMLReport(newsData) {
  const { articles, fetchedAt } = newsData;
  const date = format(new Date(fetchedAt), 'EEEE, MMMM d, yyyy');
  const time = format(new Date(fetchedAt), 'h:mm a');
  
  // Group articles by category
  const categorizedNews = {};
  articles.forEach(article => {
    const category = article.category || 'General';
    if (!categorizedNews[category]) {
      categorizedNews[category] = [];
    }
    categorizedNews[category].push(article);
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily News Digest - ${date}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
        }
        
        .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #FF6B00, #FFA500, #FF6B00);
        }
        
        .logo {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
            letter-spacing: 2px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .tagline {
            font-size: 1.1em;
            opacity: 0.9;
            font-style: italic;
        }
        
        .date-time {
            margin-top: 20px;
            font-size: 1em;
            opacity: 0.8;
        }
        
        .content {
            padding: 40px;
        }
        
        .summary {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 40px;
            border-left: 4px solid #FF6B00;
        }
        
        .summary h2 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.5em;
        }
        
        .stats {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .stat {
            text-align: center;
            flex: 1;
            min-width: 100px;
        }
        
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #FF6B00;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .category-section {
            margin-bottom: 40px;
        }
        
        .category-header {
            background: linear-gradient(90deg, #000000, #333333);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .category-title {
            font-size: 1.3em;
            font-weight: bold;
        }
        
        .category-count {
            background: #FF6B00;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
        }
        
        .article {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            transition: all 0.3s ease;
            border: 1px solid #e0e0e0;
        }
        
        .article:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            border-color: #FF6B00;
        }
        
        .article-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 10px;
        }
        
        .article-title {
            font-size: 1.1em;
            font-weight: bold;
            color: #000;
            text-decoration: none;
            flex: 1;
            margin-right: 10px;
        }
        
        .article-title:hover {
            color: #FF6B00;
        }
        
        .article-source {
            background: #000;
            color: white;
            padding: 4px 10px;
            border-radius: 5px;
            font-size: 0.8em;
            white-space: nowrap;
        }
        
        .article-description {
            color: #666;
            margin-bottom: 10px;
            line-height: 1.5;
        }
        
        .article-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.85em;
            color: #999;
        }
        
        .article-time {
            font-style: italic;
        }
        
        .read-more {
            color: #FF6B00;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        
        .read-more:hover {
            text-decoration: underline;
        }
        
        .footer {
            background: #000;
            color: white;
            text-align: center;
            padding: 30px;
            font-size: 0.9em;
        }
        
        .footer a {
            color: #FF6B00;
            text-decoration: none;
        }
        
        @media (max-width: 600px) {
            .container {
                border-radius: 0;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .logo {
                font-size: 2em;
            }
            
            .content {
                padding: 20px;
            }
            
            .stats {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📰 DAILY NEWS DIGEST</div>
            <div class="tagline">Your Professional News Briefing</div>
            <div class="date-time">${date} • ${time}</div>
        </div>
        
        <div class="content">
            <div class="summary">
                <h2>Today's Overview</h2>
                <div class="stats">
                    <div class="stat">
                        <div class="stat-number">${articles.length}</div>
                        <div class="stat-label">Total Articles</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${Object.keys(categorizedNews).length}</div>
                        <div class="stat-label">Categories</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${[...new Set(articles.map(a => a.source))].length}</div>
                        <div class="stat-label">Sources</div>
                    </div>
                </div>
            </div>
            
            ${Object.entries(categorizedNews).map(([category, categoryArticles]) => `
                <div class="category-section">
                    <div class="category-header">
                        <div class="category-title">${getCategoryEmoji(category)} ${category}</div>
                        <div class="category-count">${categoryArticles.length} articles</div>
                    </div>
                    
                    ${categoryArticles.slice(0, 5).map(article => `
                        <div class="article">
                            <div class="article-header">
                                <a href="${article.url}" target="_blank" class="article-title">${article.title}</a>
                                <span class="article-source">${article.source}</span>
                            </div>
                            ${article.description ? `<div class="article-description">${article.description.slice(0, 200)}...</div>` : ''}
                            <div class="article-meta">
                                <span class="article-time">${formatTime(article.publishedAt)}</span>
                                <a href="${article.url}" target="_blank" class="read-more">Read full article →</a>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Generated automatically by Daily News Automation</p>
            <p>Delivered to: ${config.email.to}</p>
            <p style="margin-top: 10px; opacity: 0.7;">© ${new Date().getFullYear()} Daily News Digest. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

  return html;
}

function getCategoryEmoji(category) {
  const emojis = {
    'US Markets': '🇺🇸',
    'US Business': '🏢',
    'Global Markets': '🌐',
    'Global Business': '💼',
    'Singapore Markets': '🇸🇬', 
    'India Markets': '🇮🇳',
    'Hong Kong Markets': '🇭🇰',
    'Asia Markets': '🌏',
    'Technology': '💻',
    'Business': '💼',
    'Markets': '📈',
    'Economy': '💰',
    'General': '📄',
    'News': '📰'
  };
  return emojis[category] || '📈';
}

function formatTime(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  } catch (error) {
    return dateString;
  }
}