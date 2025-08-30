import axios from 'axios';
import * as cheerio from 'cheerio';
import { watchlist, getWatchlistSearchTerms } from './watchlist.js';

// Check if news article is relevant to watchlist stocks
function isRelevantToWatchlist(title, description, searchTerms) {
  const text = `${title} ${description}`.toLowerCase();
  
  // Check if any watchlist company is mentioned
  return searchTerms.some(term => {
    const searchTerm = term.toLowerCase();
    // Look for exact word match to avoid false positives
    const regex = new RegExp(`\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    return regex.test(text);
  });
}

// Fetch news from multiple sources and filter for watchlist stocks
export async function fetchWatchlistNews() {
  const searchTerms = getWatchlistSearchTerms();
  const allNews = [];
  const errors = [];
  
  console.log(`📊 Searching for news on ${watchlist.length} watchlist stocks...`);
  console.log('🔍 This will perform comprehensive searches including:');
  console.log('   • General watchlist news from 9 financial sources');
  console.log(`   • Individual stock searches for popular ${watchlist.length} stocks`);
  console.log('   • Alternative ticker searches for major companies');
  console.log('');
  
  // Create comprehensive search promises
  const newsPromises = [
    // General watchlist news from all sources
    fetchYahooFinanceWatchlistNews(searchTerms),
    fetchMarketWatchWatchlistNews(searchTerms),
    fetchBloombergWatchlistNews(searchTerms),
    fetchReutersWatchlistNews(searchTerms),
    fetchCNBCWatchlistNews(searchTerms),
    fetchBusinessTimesWatchlistNews(searchTerms),
    fetchEconomicTimesWatchlistNews(searchTerms),
    fetchSCMPWatchlistNews(searchTerms),
    fetchNikkeiAsiaWatchlistNews(searchTerms)
  ];
  
  // Add stock-specific searches for popular watchlist stocks
  console.log('📈 Adding individual stock searches...');
  const popularStocks = watchlist.slice(0, 25); // Focus on first 25 most popular stocks
  popularStocks.forEach((stock, index) => {
    if (index % 10 === 0) {
      console.log(`   Processing popular stocks ${index + 1}-${Math.min(index + 10, popularStocks.length)} of ${popularStocks.length}...`);
    }
    
    // Search by company name
    newsPromises.push(fetchStockSpecificNews(stock.name, stock.ticker));
    
    // For major stocks, also search by ticker
    const ticker = stock.ticker.includes(':') ? stock.ticker.split(':')[1] : stock.ticker;
    if (ticker !== stock.name) {
      newsPromises.push(fetchStockSpecificNewsByTicker(ticker, stock.name));
    }
  });
  
  console.log(`🚀 Starting ${newsPromises.length} parallel news searches...`);
  
  const results = await Promise.allSettled(newsPromises);
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      allNews.push(...result.value);
    } else if (result.status === 'rejected') {
      errors.push({ source: index, error: result.reason });
    }
  });
  
  // Remove duplicates based on title
  const uniqueNews = Array.from(
    new Map(allNews.map(item => [item.title, item])).values()
  );
  
  // Filter articles to only include those from the last 2 days
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  const recentUniqueNews = uniqueNews.filter(article => {
    const articleDate = new Date(article.publishedAt);
    return articleDate >= twoDaysAgo;
  });
  
  // Sort by date (most recent first)
  recentUniqueNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
  // Limit to top 100 relevant stories
  return {
    articles: recentUniqueNews.slice(0, 100),
    watchlistStocks: watchlist.map(s => s.name).join(', '),
    totalStocks: watchlist.length,
    activeStocks: watchlist.filter(s => s.shares > 0).length,
    watchingOnly: watchlist.filter(s => s.shares === 0).length,
    errors: errors.length > 0 ? errors : null,
    fetchedAt: new Date().toISOString()
  };
}

// Yahoo Finance - Watchlist specific
async function fetchYahooFinanceWatchlistNews(searchTerms) {
  try {
    const response = await axios.get('https://feeds.finance.yahoo.com/rss/2.0/headline', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isRelevantToWatchlist(title, description, searchTerms)) {
        const matchedStocks = watchlist.filter(stock => {
          const text = `${title} ${description}`.toLowerCase();
          return text.includes(stock.name.toLowerCase()) || 
                 text.includes(stock.ticker.toLowerCase());
        });
        
        articles.push({
          title: title,
          description: description.slice(0, 300),
          url: $(elem).find('link').text(),
          source: 'Yahoo Finance',
          category: 'Watchlist News',
          publishedAt: $(elem).find('pubDate').text(),
          relatedStocks: matchedStocks.map(s => s.name),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('Yahoo Finance Watchlist fetch error:', error.message);
    return [];
  }
}

// MarketWatch - Watchlist specific
async function fetchMarketWatchWatchlistNews(searchTerms) {
  try {
    const response = await axios.get('https://feeds.marketwatch.com/marketwatch/topstories/', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isRelevantToWatchlist(title, description, searchTerms)) {
        const matchedStocks = watchlist.filter(stock => {
          const text = `${title} ${description}`.toLowerCase();
          return text.includes(stock.name.toLowerCase()) || 
                 text.includes(stock.ticker.toLowerCase());
        });
        
        articles.push({
          title: title,
          description: description.slice(0, 300),
          url: $(elem).find('link').text(),
          source: 'MarketWatch',
          category: 'Watchlist News',
          publishedAt: $(elem).find('pubDate').text(),
          relatedStocks: matchedStocks.map(s => s.name),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('MarketWatch Watchlist fetch error:', error.message);
    return [];
  }
}

// Bloomberg - Watchlist specific
async function fetchBloombergWatchlistNews(searchTerms) {
  try {
    const response = await axios.get('https://feeds.bloomberg.com/markets/news.rss', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isRelevantToWatchlist(title, description, searchTerms)) {
        const matchedStocks = watchlist.filter(stock => {
          const text = `${title} ${description}`.toLowerCase();
          return text.includes(stock.name.toLowerCase()) || 
                 text.includes(stock.ticker.toLowerCase());
        });
        
        articles.push({
          title: title,
          description: description.slice(0, 300),
          url: $(elem).find('link').text(),
          source: 'Bloomberg',
          category: 'Watchlist News',
          publishedAt: $(elem).find('pubDate').text(),
          relatedStocks: matchedStocks.map(s => s.name),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('Bloomberg Watchlist fetch error:', error.message);
    return [];
  }
}

// Reuters - Watchlist specific
async function fetchReutersWatchlistNews(searchTerms) {
  try {
    const response = await axios.get('https://feeds.reuters.com/reuters/businessNews', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isRelevantToWatchlist(title, description, searchTerms)) {
        const matchedStocks = watchlist.filter(stock => {
          const text = `${title} ${description}`.toLowerCase();
          return text.includes(stock.name.toLowerCase()) || 
                 text.includes(stock.ticker.toLowerCase());
        });
        
        articles.push({
          title: title,
          description: description.slice(0, 300),
          url: $(elem).find('link').text(),
          source: 'Reuters',
          category: 'Watchlist News',
          publishedAt: $(elem).find('pubDate').text(),
          relatedStocks: matchedStocks.map(s => s.name),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('Reuters Watchlist fetch error:', error.message);
    return [];
  }
}

// CNBC - Watchlist specific
async function fetchCNBCWatchlistNews(searchTerms) {
  try {
    const response = await axios.get('https://feeds.nbcnews.com/nbcnews/public/business', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isRelevantToWatchlist(title, description, searchTerms)) {
        const matchedStocks = watchlist.filter(stock => {
          const text = `${title} ${description}`.toLowerCase();
          return text.includes(stock.name.toLowerCase()) || 
                 text.includes(stock.ticker.toLowerCase());
        });
        
        articles.push({
          title: title,
          description: description.slice(0, 300),
          url: $(elem).find('link').text(),
          source: 'CNBC',
          category: 'Watchlist News',
          publishedAt: $(elem).find('pubDate').text(),
          relatedStocks: matchedStocks.map(s => s.name),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('CNBC Watchlist fetch error:', error.message);
    return [];
  }
}

// Business Times Singapore - Watchlist specific
async function fetchBusinessTimesWatchlistNews(searchTerms) {
  try {
    const response = await axios.get('https://www.businesstimes.com.sg/rss-feeds/singapore', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isRelevantToWatchlist(title, description, searchTerms)) {
        const matchedStocks = watchlist.filter(stock => {
          const text = `${title} ${description}`.toLowerCase();
          return text.includes(stock.name.toLowerCase()) || 
                 text.includes(stock.ticker.toLowerCase());
        });
        
        articles.push({
          title: title,
          description: description.slice(0, 300),
          url: $(elem).find('link').text(),
          source: 'Business Times SG',
          category: 'Singapore Markets',
          publishedAt: $(elem).find('pubDate').text(),
          relatedStocks: matchedStocks.map(s => s.name),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('Business Times SG Watchlist fetch error:', error.message);
    return [];
  }
}

// Economic Times - Watchlist specific
async function fetchEconomicTimesWatchlistNews(searchTerms) {
  try {
    const response = await axios.get('https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isRelevantToWatchlist(title, description, searchTerms)) {
        const matchedStocks = watchlist.filter(stock => {
          const text = `${title} ${description}`.toLowerCase();
          return text.includes(stock.name.toLowerCase()) || 
                 text.includes(stock.ticker.toLowerCase());
        });
        
        articles.push({
          title: title,
          description: description.slice(0, 300),
          url: $(elem).find('link').text(),
          source: 'Economic Times',
          category: 'India Markets',
          publishedAt: $(elem).find('pubDate').text(),
          relatedStocks: matchedStocks.map(s => s.name),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('Economic Times Watchlist fetch error:', error.message);
    return [];
  }
}

// SCMP - Watchlist specific
async function fetchSCMPWatchlistNews(searchTerms) {
  try {
    const response = await axios.get('https://www.scmp.com/rss/91/feed', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isRelevantToWatchlist(title, description, searchTerms)) {
        const matchedStocks = watchlist.filter(stock => {
          const text = `${title} ${description}`.toLowerCase();
          return text.includes(stock.name.toLowerCase()) || 
                 text.includes(stock.ticker.toLowerCase());
        });
        
        articles.push({
          title: title,
          description: description.slice(0, 300),
          url: $(elem).find('link').text(),
          source: 'SCMP Business',
          category: 'Hong Kong Markets',
          publishedAt: $(elem).find('pubDate').text(),
          relatedStocks: matchedStocks.map(s => s.name),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('SCMP Watchlist fetch error:', error.message);
    return [];
  }
}

// Nikkei Asia - Watchlist specific
async function fetchNikkeiAsiaWatchlistNews(searchTerms) {
  try {
    const response = await axios.get('https://asia.nikkei.com/rss/feed/nar', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isRelevantToWatchlist(title, description, searchTerms)) {
        const matchedStocks = watchlist.filter(stock => {
          const text = `${title} ${description}`.toLowerCase();
          return text.includes(stock.name.toLowerCase()) || 
                 text.includes(stock.ticker.toLowerCase());
        });
        
        articles.push({
          title: title,
          description: description.slice(0, 300),
          url: $(elem).find('link').text(),
          source: 'Nikkei Asia',
          category: 'Asia Markets',
          publishedAt: $(elem).find('pubDate').text(),
          relatedStocks: matchedStocks.map(s => s.name),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('Nikkei Asia Watchlist fetch error:', error.message);
    return [];
  }
}

// Fetch news for specific stock by name
async function fetchStockSpecificNews(stockName, ticker = null) {
  try {
    const articles = [];
    
    // Try multiple search approaches
    const searchQueries = [
      stockName,
      stockName.split(' ')[0], // First word of company name
    ];
    
    if (ticker) {
      const cleanTicker = ticker.includes(':') ? ticker.split(':')[1] : ticker;
      searchQueries.push(cleanTicker);
    }
    
    for (const query of searchQueries.slice(0, 2)) { // Limit to 2 searches per stock
      try {
        // Search Google News via RSS (more comprehensive than Yahoo Finance alone)
        const searchUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' stock market news')}&hl=en-US&gl=US&ceid=US:en`;
        const response = await axios.get(searchUrl, { 
          timeout: 8000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
          }
        });
        
        const $ = cheerio.load(response.data, { xmlMode: true });
        
        $('item').slice(0, 2).each((_, elem) => {
          const title = $(elem).find('title').text();
          const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
          
          // Only include if it seems relevant to the stock
          if (isRelevantToStock(title + ' ' + description, stockName, ticker)) {
            articles.push({
              title: title,
              description: description.slice(0, 300),
              url: $(elem).find('link').text(),
              source: 'Google News',
              category: 'Stock Specific',
              publishedAt: $(elem).find('pubDate').text(),
              relatedStocks: [stockName],
              imageUrl: null
            });
          }
        });
        
        // Add small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (searchError) {
        // Continue with next search query if one fails
        continue;
      }
    }
    
    return articles;
  } catch (error) {
    console.error(`Stock specific fetch error for ${stockName}:`, error.message);
    return [];
  }
}

// Fetch news for specific ticker
async function fetchStockSpecificNewsByTicker(ticker, stockName) {
  try {
    // Search specifically for ticker mentions
    const searchUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(ticker + ' earnings stock')}&hl=en-US&gl=US&ceid=US:en`;
    const response = await axios.get(searchUrl, { 
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
      }
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').slice(0, 2).each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      articles.push({
        title: title,
        description: description.slice(0, 300),
        url: $(elem).find('link').text(),
        source: 'Google News (Ticker)',
        category: 'Stock Specific',
        publishedAt: $(elem).find('pubDate').text(),
        relatedStocks: [stockName],
        imageUrl: null
      });
    });
    
    return articles;
  } catch (error) {
    console.error(`Ticker specific fetch error for ${ticker}:`, error.message);
    return [];
  }
}

// Check if article is relevant to specific stock
function isRelevantToStock(text, stockName, ticker) {
  const lowerText = text.toLowerCase();
  const lowerStockName = stockName.toLowerCase();
  
  // Check for company name
  if (lowerText.includes(lowerStockName)) return true;
  
  // Check for ticker
  if (ticker) {
    const cleanTicker = ticker.includes(':') ? ticker.split(':')[1] : ticker;
    if (lowerText.includes(cleanTicker.toLowerCase())) return true;
  }
  
  // Check for key financial terms that suggest stock relevance
  const stockKeywords = ['earnings', 'revenue', 'profit', 'stock', 'shares', 'market cap', 'dividend', 'analyst', 'rating'];
  const hasStockKeywords = stockKeywords.some(keyword => lowerText.includes(keyword));
  
  // Must have both company reference and stock-related content
  return hasStockKeywords && (
    lowerText.includes(lowerStockName.split(' ')[0]) || // First word of company name
    (ticker && lowerText.includes(ticker.toLowerCase()))
  );
}