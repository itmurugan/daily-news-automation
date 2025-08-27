import axios from 'axios';
import * as cheerio from 'cheerio';
import { portfolio, getSearchTerms } from './portfolio.js';

// Check if news article is relevant to portfolio stocks
function isRelevantToPortfolio(title, description, searchTerms) {
  const text = `${title} ${description}`.toLowerCase();
  
  // Check if any portfolio company is mentioned
  return searchTerms.some(term => {
    const searchTerm = term.toLowerCase();
    // Look for exact word match to avoid false positives
    const regex = new RegExp(`\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    return regex.test(text);
  });
}

// Fetch news from multiple sources and filter for portfolio stocks
export async function fetchPortfolioNews() {
  const searchTerms = getSearchTerms();
  const allNews = [];
  const errors = [];
  
  console.log(`📊 Searching for news on ${portfolio.length} portfolio stocks...`);
  console.log('🔍 This will perform comprehensive searches including:');
  console.log('   • General portfolio news from 9 financial sources');
  console.log(`   • Individual stock searches for all ${portfolio.length} holdings`);
  console.log('   • Alternative ticker searches for major companies');
  console.log('');
  
  // Create comprehensive search promises
  const newsPromises = [
    // General portfolio news from all sources
    fetchYahooFinancePortfolioNews(searchTerms),
    fetchMarketWatchPortfolioNews(searchTerms),
    fetchBloombergPortfolioNews(searchTerms),
    fetchReutersPortfolioNews(searchTerms),
    fetchCNBCPortfolioNews(searchTerms),
    fetchBusinessTimesPortfolioNews(searchTerms),
    fetchEconomicTimesPortfolioNews(searchTerms),
    fetchSCMPPortfolioNews(searchTerms),
    fetchNikkeiAsiaPortfolioNews(searchTerms)
  ];
  
  // Add stock-specific searches for EACH portfolio stock
  console.log('📈 Adding individual stock searches...');
  portfolio.forEach((stock, index) => {
    if (index % 10 === 0) {
      console.log(`   Processing stocks ${index + 1}-${Math.min(index + 10, portfolio.length)} of ${portfolio.length}...`);
    }
    
    // Search by company name
    newsPromises.push(fetchStockSpecificNews(stock.name, stock.ticker));
    
    // For major stocks, also search by ticker
    const ticker = stock.ticker.includes(':') ? stock.ticker.split(':')[1] : stock.ticker;
    if (ticker !== stock.name) {
      newsPromises.push(fetchStockSpecificNewsByTicker(ticker, stock.name));
    }
    
    // For Chinese companies, search alternative names/tickers
    if (stock.name.includes('Alibaba')) {
      newsPromises.push(fetchStockSpecificNews('BABA', stock.ticker));
    } else if (stock.name.includes('Tencent')) {
      newsPromises.push(fetchStockSpecificNews('TCEHY', stock.ticker));
    } else if (stock.name.includes('JD.com')) {
      newsPromises.push(fetchStockSpecificNews('JD', stock.ticker));
    } else if (stock.name.includes('BYD')) {
      newsPromises.push(fetchStockSpecificNews('BYDDY', stock.ticker));
    } else if (stock.name.includes('Taiwan Semiconductor')) {
      newsPromises.push(fetchStockSpecificNews('TSM', stock.ticker));
    } else if (stock.name.includes('Samsung Electronics')) {
      newsPromises.push(fetchStockSpecificNews('Samsung', stock.ticker));
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
  
  // Sort by date (most recent first)
  uniqueNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
  // Limit to top 100 relevant stories
  return {
    articles: uniqueNews.slice(0, 100),
    fetchedAt: new Date().toISOString(),
    portfolioStocks: portfolio.length,
    errors
  };
}

// Yahoo Finance - Portfolio specific
async function fetchYahooFinancePortfolioNews(searchTerms) {
  try {
    const response = await axios.get('https://feeds.finance.yahoo.com/rss/2.0/headline', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isRelevantToPortfolio(title, description, searchTerms)) {
        const matchedStocks = portfolio.filter(stock => {
          const text = `${title} ${description}`.toLowerCase();
          return text.includes(stock.name.toLowerCase()) || 
                 text.includes(stock.ticker.toLowerCase().replace('sehk:', ''));
        });
        
        articles.push({
          title: title,
          description: description.slice(0, 300),
          url: $(elem).find('link').text(),
          source: 'Yahoo Finance',
          category: 'Portfolio News',
          publishedAt: $(elem).find('pubDate').text(),
          relatedStocks: matchedStocks.map(s => s.name),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('Yahoo Finance Portfolio fetch error:', error.message);
    return [];
  }
}

// MarketWatch - Portfolio specific
async function fetchMarketWatchPortfolioNews(searchTerms) {
  try {
    const response = await axios.get('https://feeds.marketwatch.com/marketwatch/topstories/', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isRelevantToPortfolio(title, description, searchTerms)) {
        const matchedStocks = portfolio.filter(stock => {
          const text = `${title} ${description}`.toLowerCase();
          return text.includes(stock.name.toLowerCase()) || 
                 text.includes(stock.ticker.toLowerCase().replace('sehk:', ''));
        });
        
        articles.push({
          title: title,
          description: description.slice(0, 300),
          url: $(elem).find('link').text(),
          source: 'MarketWatch',
          category: 'Portfolio News',
          publishedAt: $(elem).find('pubDate').text(),
          relatedStocks: matchedStocks.map(s => s.name),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('MarketWatch Portfolio fetch error:', error.message);
    return [];
  }
}

// Bloomberg - Portfolio specific
async function fetchBloombergPortfolioNews(searchTerms) {
  try {
    const response = await axios.get('https://feeds.bloomberg.com/markets/news.rss', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isRelevantToPortfolio(title, description, searchTerms)) {
        const matchedStocks = portfolio.filter(stock => {
          const text = `${title} ${description}`.toLowerCase();
          return text.includes(stock.name.toLowerCase()) || 
                 text.includes(stock.ticker.toLowerCase().replace('sehk:', ''));
        });
        
        articles.push({
          title: title,
          description: description.slice(0, 300),
          url: $(elem).find('link').text(),
          source: 'Bloomberg',
          category: 'Portfolio News',
          publishedAt: $(elem).find('pubDate').text(),
          relatedStocks: matchedStocks.map(s => s.name),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('Bloomberg Portfolio fetch error:', error.message);
    return [];
  }
}

// Reuters - Portfolio specific
async function fetchReutersPortfolioNews(searchTerms) {
  try {
    const response = await axios.get('https://feeds.reuters.com/reuters/businessNews', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isRelevantToPortfolio(title, description, searchTerms)) {
        const matchedStocks = portfolio.filter(stock => {
          const text = `${title} ${description}`.toLowerCase();
          return text.includes(stock.name.toLowerCase()) || 
                 text.includes(stock.ticker.toLowerCase().replace('sehk:', ''));
        });
        
        articles.push({
          title: title,
          description: description.slice(0, 300),
          url: $(elem).find('link').text(),
          source: 'Reuters',
          category: 'Portfolio News',
          publishedAt: $(elem).find('pubDate').text(),
          relatedStocks: matchedStocks.map(s => s.name),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('Reuters Portfolio fetch error:', error.message);
    return [];
  }
}

// CNBC - Portfolio specific
async function fetchCNBCPortfolioNews(searchTerms) {
  try {
    const response = await axios.get('https://feeds.nbcnews.com/nbcnews/public/business', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isRelevantToPortfolio(title, description, searchTerms)) {
        const matchedStocks = portfolio.filter(stock => {
          const text = `${title} ${description}`.toLowerCase();
          return text.includes(stock.name.toLowerCase()) || 
                 text.includes(stock.ticker.toLowerCase().replace('sehk:', ''));
        });
        
        articles.push({
          title: title,
          description: description.slice(0, 300),
          url: $(elem).find('link').text(),
          source: 'CNBC',
          category: 'Portfolio News',
          publishedAt: $(elem).find('pubDate').text(),
          relatedStocks: matchedStocks.map(s => s.name),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('CNBC Portfolio fetch error:', error.message);
    return [];
  }
}

// Business Times Singapore - Portfolio specific
async function fetchBusinessTimesPortfolioNews(searchTerms) {
  try {
    const response = await axios.get('https://www.businesstimes.com.sg/rss-feeds/singapore', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isRelevantToPortfolio(title, description, searchTerms)) {
        const matchedStocks = portfolio.filter(stock => {
          const text = `${title} ${description}`.toLowerCase();
          return text.includes(stock.name.toLowerCase()) || 
                 text.includes(stock.ticker.toLowerCase().replace('sgx:', ''));
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
    console.error('Business Times SG Portfolio fetch error:', error.message);
    return [];
  }
}

// Economic Times - Portfolio specific
async function fetchEconomicTimesPortfolioNews(searchTerms) {
  try {
    const response = await axios.get('https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isRelevantToPortfolio(title, description, searchTerms)) {
        const matchedStocks = portfolio.filter(stock => {
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
    console.error('Economic Times Portfolio fetch error:', error.message);
    return [];
  }
}

// SCMP - Portfolio specific
async function fetchSCMPPortfolioNews(searchTerms) {
  try {
    const response = await axios.get('https://www.scmp.com/rss/91/feed', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isRelevantToPortfolio(title, description, searchTerms)) {
        const matchedStocks = portfolio.filter(stock => {
          const text = `${title} ${description}`.toLowerCase();
          return text.includes(stock.name.toLowerCase()) || 
                 text.includes(stock.ticker.toLowerCase().replace('sehk:', ''));
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
    console.error('SCMP Portfolio fetch error:', error.message);
    return [];
  }
}

// Nikkei Asia - Portfolio specific
async function fetchNikkeiAsiaPortfolioNews(searchTerms) {
  try {
    const response = await axios.get('https://asia.nikkei.com/rss/feed/nar', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isRelevantToPortfolio(title, description, searchTerms)) {
        const matchedStocks = portfolio.filter(stock => {
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
    console.error('Nikkei Asia Portfolio fetch error:', error.message);
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
    
    for (const query of searchQueries) {
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
        
        $('item').slice(0, 3).each((_, elem) => {
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
        await new Promise(resolve => setTimeout(resolve, 100));
        
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
    
    $('item').slice(0, 3).each((_, elem) => {
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