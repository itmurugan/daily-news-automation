import axios from 'axios';
import * as cheerio from 'cheerio';
import { config } from './config.js';

// Filter function to ensure content is financial/market related
function isFinancialContent(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  // Keywords that indicate financial content
  const financialKeywords = [
    'stock', 'share', 'market', 'trading', 'investor', 'earnings', 'revenue',
    'profit', 'loss', 'ipo', 'acquisition', 'merger', 'deal', 'billion', 'million',
    'nasdaq', 's&p', 'dow', 'index', 'fed', 'inflation', 'gdp', 'economic',
    'bank', 'finance', 'equity', 'bond', 'yield', 'rate', 'growth', 'quarter',
    'fiscal', 'valuation', 'dividend', 'portfolio', 'hedge', 'fund', 'capital',
    'exchange', 'sec', 'regulatory', 'compliance', 'forecast', 'analyst',
    'upgrade', 'downgrade', 'target price', 'bull', 'bear', 'volatility'
  ];
  
  // Keywords to exclude (non-financial content)
  const excludeKeywords = [
    'crime', 'accident', 'weather', 'celebrity', 'entertainment', 'sports',
    'recipe', 'fashion', 'lifestyle', 'travel', 'personal', 'dating',
    'gossip', 'viral', 'meme', 'tiktok', 'instagram', 'twitter drama'
  ];
  
  // Check if content contains financial keywords
  const hasFinancialContent = financialKeywords.some(keyword => text.includes(keyword));
  
  // Check if content should be excluded
  const shouldExclude = excludeKeywords.some(keyword => text.includes(keyword));
  
  return hasFinancialContent && !shouldExclude;
}

export async function fetchNewsFromSources() {
  const allNews = [];
  const errors = [];

  // Fetch business and stock market news from financial sources
  const newsPromises = [
    fetchMarketWatchNews(),
    fetchYahooFinanceNews(),
    fetchBloombergNews(),
    fetchReutersBusinessNews(),
    fetchCNBCNews(),
    fetchBusinessTimesNews(),
    fetchEconomicTimesNews(),
    fetchSCMPBusinessNews(),
    fetchNikkeiAsiaNews()
  ];

  const results = await Promise.allSettled(newsPromises);
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      allNews.push(...result.value);
    } else if (result.status === 'rejected') {
      errors.push({ source: index, error: result.reason });
    }
  });

  // Filter articles to only include those from the last 2 days
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  const recentArticles = allNews.filter(article => {
    const articleDate = new Date(article.publishedAt);
    return articleDate >= twoDaysAgo;
  });

  // Sort by date (most recent first)
  recentArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
  // Limit to top 60 business stories
  return {
    articles: recentArticles.slice(0, 60),
    fetchedAt: new Date().toISOString(),
    errors
  };
}

// USA Market News Sources

async function fetchMarketWatchNews() {
  try {
    const response = await axios.get('https://feeds.marketwatch.com/marketwatch/topstories/', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').slice(0, 10).each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      // Filter for stock market and business content only
      if (isFinancialContent(title, description)) {
        articles.push({
          title: title,
          description: description.slice(0, 200),
          url: $(elem).find('link').text(),
          source: 'MarketWatch',
          category: 'US Markets',
          publishedAt: $(elem).find('pubDate').text(),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('MarketWatch fetch error:', error.message);
    return [];
  }
}

async function fetchYahooFinanceNews() {
  try {
    const response = await axios.get('https://feeds.finance.yahoo.com/rss/2.0/headline', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').slice(0, 10).each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isFinancialContent(title, description)) {
        articles.push({
          title: title,
          description: description.slice(0, 200),
          url: $(elem).find('link').text(),
          source: 'Yahoo Finance',
          category: 'US Markets',
          publishedAt: $(elem).find('pubDate').text(),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('Yahoo Finance fetch error:', error.message);
    return [];
  }
}

async function fetchBloombergNews() {
  try {
    const response = await axios.get('https://feeds.bloomberg.com/markets/news.rss', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').slice(0, 12).each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isFinancialContent(title, description)) {
        articles.push({
          title: title,
          description: description.slice(0, 200),
          url: $(elem).find('link').text(),
          source: 'Bloomberg',
          category: 'Global Markets',
          publishedAt: $(elem).find('pubDate').text(),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('Bloomberg fetch error:', error.message);
    return [];
  }
}

async function fetchReutersBusinessNews() {
  try {
    const response = await axios.get('https://feeds.reuters.com/reuters/businessNews', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').slice(0, 10).each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isFinancialContent(title, description)) {
        articles.push({
          title: title,
          description: description.slice(0, 200),
          url: $(elem).find('link').text(),
          source: 'Reuters',
          category: 'Global Business',
          publishedAt: $(elem).find('pubDate').text(),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('Reuters Business fetch error:', error.message);
    return [];
  }
}

async function fetchCNBCNews() {
  try {
    const response = await axios.get('https://feeds.nbcnews.com/nbcnews/public/business', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').slice(0, 10).each((_, elem) => {
      const title = $(elem).find('title').text();
      const description = $(elem).find('description').text().replace(/<[^>]*>/g, '');
      
      if (isFinancialContent(title, description)) {
        articles.push({
          title: title,
          description: description.slice(0, 200),
          url: $(elem).find('link').text(),
          source: 'CNBC',
          category: 'US Markets',
          publishedAt: $(elem).find('pubDate').text(),
          imageUrl: null
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('CNBC fetch error:', error.message);
    return [];
  }
}

// Singapore Market News

async function fetchBusinessTimesNews() {
  try {
    const response = await axios.get('https://www.businesstimes.com.sg/rss-feeds/singapore', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').slice(0, 6).each((_, elem) => {
      articles.push({
        title: $(elem).find('title').text(),
        description: $(elem).find('description').text().replace(/<[^>]*>/g, '').slice(0, 200),
        url: $(elem).find('link').text(),
        source: 'Business Times SG',
        category: 'Singapore Markets',
        publishedAt: $(elem).find('pubDate').text(),
        imageUrl: null
      });
    });
    
    return articles;
  } catch (error) {
    console.error('Business Times SG fetch error:', error.message);
    return [];
  }
}

// India Market News

async function fetchEconomicTimesNews() {
  try {
    const response = await axios.get('https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').slice(0, 8).each((_, elem) => {
      articles.push({
        title: $(elem).find('title').text(),
        description: $(elem).find('description').text().replace(/<[^>]*>/g, '').slice(0, 200),
        url: $(elem).find('link').text(),
        source: 'Economic Times',
        category: 'India Markets',
        publishedAt: $(elem).find('pubDate').text(),
        imageUrl: null
      });
    });
    
    return articles;
  } catch (error) {
    console.error('Economic Times fetch error:', error.message);
    return [];
  }
}

// Hong Kong Market News

async function fetchSCMPBusinessNews() {
  try {
    const response = await axios.get('https://www.scmp.com/rss/91/feed', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').slice(0, 6).each((_, elem) => {
      articles.push({
        title: $(elem).find('title').text(),
        description: $(elem).find('description').text().replace(/<[^>]*>/g, '').slice(0, 200),
        url: $(elem).find('link').text(),
        source: 'SCMP Business',
        category: 'Hong Kong Markets',
        publishedAt: $(elem).find('pubDate').text(),
        imageUrl: null
      });
    });
    
    return articles;
  } catch (error) {
    console.error('SCMP Business fetch error:', error.message);
    return [];
  }
}

// Asia Market News

async function fetchNikkeiAsiaNews() {
  try {
    const response = await axios.get('https://asia.nikkei.com/rss/feed/nar', {
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xmlMode: true });
    const articles = [];
    
    $('item').slice(0, 6).each((_, elem) => {
      articles.push({
        title: $(elem).find('title').text(),
        description: $(elem).find('description').text().replace(/<[^>]*>/g, '').slice(0, 200),
        url: $(elem).find('link').text(),
        source: 'Nikkei Asia',
        category: 'Asia Markets',
        publishedAt: $(elem).find('pubDate').text(),
        imageUrl: null
      });
    });
    
    return articles;
  } catch (error) {
    console.error('Nikkei Asia fetch error:', error.message);
    return [];
  }
}