import axios from 'axios';
import { format, subDays } from 'date-fns';
import { watchlist, getWatchlistSearchTerms } from './watchlist.js';
import { config } from './config.js';

export async function fetchWatchlistNews() {
  const searchTerms = getWatchlistSearchTerms();
  const watchlistStocks = watchlist.map(s => s.name).join(', ');
  
  console.log(`📊 Fetching news for ${watchlist.length} watchlist stocks`);
  console.log(`🔍 Using ${searchTerms.length} search terms`);
  
  const articles = [];
  const errors = [];
  const processedUrls = new Set();
  
  const watchlistTickers = watchlist.map(stock => {
    const ticker = stock.ticker.includes(':') ? stock.ticker.split(':')[1] : stock.ticker;
    return ticker.toLowerCase();
  });
  
  const watchlistNames = watchlist.map(stock => stock.name.toLowerCase());
  
  async function fetchFromNewsAPI() {
    try {
      const watchlistQuery = searchTerms.slice(0, 10).join(' OR ');
      
      const params = {
        q: watchlistQuery,
        from: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd'),
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 100,
        apiKey: config.newsApiKey
      };

      const response = await axios.get('https://newsapi.org/v2/everything', { params });
      
      if (response.data.articles) {
        console.log(`✅ NewsAPI: Found ${response.data.articles.length} articles`);
        
        response.data.articles.forEach(article => {
          if (!processedUrls.has(article.url)) {
            processedUrls.add(article.url);
            
            const relatedStocks = [];
            const contentToCheck = `${article.title} ${article.description} ${article.content}`.toLowerCase();
            
            watchlist.forEach(stock => {
              const ticker = stock.ticker.includes(':') ? stock.ticker.split(':')[1] : stock.ticker;
              const tickerLower = ticker.toLowerCase();
              const nameLower = stock.name.toLowerCase();
              const shortName = stock.name.split(' ')[0].toLowerCase();
              
              if (contentToCheck.includes(tickerLower) || 
                  contentToCheck.includes(nameLower) || 
                  contentToCheck.includes(shortName)) {
                relatedStocks.push(stock.name);
              }
            });
            
            articles.push({
              title: article.title,
              description: article.description,
              url: article.url,
              source: article.source?.name || 'NewsAPI',
              publishedAt: article.publishedAt,
              image: article.urlToImage,
              relatedStocks: relatedStocks.length > 0 ? relatedStocks : null,
              isWatchlistNews: true
            });
          }
        });
      }
    } catch (error) {
      console.error('❌ NewsAPI Error:', error.message);
      errors.push({ source: 'NewsAPI', error });
    }
  }
  
  async function fetchFromAlphaVantage() {
    try {
      const stocksToFetch = watchlist
        .filter(stock => stock.shares > 0)
        .slice(0, 5);
      
      for (const stock of stocksToFetch) {
        try {
          const ticker = stock.ticker.includes(':') ? stock.ticker.split(':')[1] : stock.ticker;
          
          const params = {
            function: 'NEWS_SENTIMENT',
            tickers: ticker,
            apikey: config.alphaVantageApiKey,
            limit: 20
          };
          
          const response = await axios.get('https://www.alphavantage.co/query', { params });
          
          if (response.data.feed) {
            console.log(`✅ Alpha Vantage: Found ${response.data.feed.length} articles for ${stock.name}`);
            
            response.data.feed.forEach(item => {
              if (!processedUrls.has(item.url)) {
                processedUrls.add(item.url);
                
                const relatedStocks = [stock.name];
                if (item.ticker_sentiment) {
                  item.ticker_sentiment.forEach(sentiment => {
                    const relatedStock = watchlist.find(s => {
                      const sTicker = s.ticker.includes(':') ? s.ticker.split(':')[1] : s.ticker;
                      return sTicker === sentiment.ticker;
                    });
                    if (relatedStock && !relatedStocks.includes(relatedStock.name)) {
                      relatedStocks.push(relatedStock.name);
                    }
                  });
                }
                
                articles.push({
                  title: item.title,
                  description: item.summary,
                  url: item.url,
                  source: item.source || 'Alpha Vantage',
                  publishedAt: item.time_published,
                  image: item.banner_image,
                  sentiment: item.overall_sentiment_label,
                  sentimentScore: item.overall_sentiment_score,
                  relatedStocks: relatedStocks,
                  isWatchlistNews: true
                });
              }
            });
          }
          
          await new Promise(resolve => setTimeout(resolve, 12000));
        } catch (error) {
          console.error(`❌ Alpha Vantage Error for ${stock.name}:`, error.message);
        }
      }
    } catch (error) {
      console.error('❌ Alpha Vantage Error:', error.message);
      errors.push({ source: 'AlphaVantage', error });
    }
  }
  
  async function fetchFromPolygon() {
    try {
      const stocksToFetch = watchlist
        .filter(stock => stock.shares > 0 && !stock.ticker.includes('SEHK'))
        .slice(0, 5);
      
      for (const stock of stocksToFetch) {
        try {
          const ticker = stock.ticker.includes(':') ? stock.ticker.split(':')[1] : stock.ticker;
          
          const params = {
            ticker: ticker,
            published_utc: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
            limit: 20,
            apiKey: config.polygonApiKey
          };
          
          const response = await axios.get(`https://api.polygon.io/v2/reference/news`, { params });
          
          if (response.data.results) {
            console.log(`✅ Polygon: Found ${response.data.results.length} articles for ${stock.name}`);
            
            response.data.results.forEach(item => {
              if (!processedUrls.has(item.article_url)) {
                processedUrls.add(item.article_url);
                
                const relatedStocks = [stock.name];
                
                if (item.tickers) {
                  item.tickers.forEach(ticker => {
                    const relatedStock = watchlist.find(s => {
                      const sTicker = s.ticker.includes(':') ? s.ticker.split(':')[1] : s.ticker;
                      return sTicker === ticker;
                    });
                    if (relatedStock && !relatedStocks.includes(relatedStock.name)) {
                      relatedStocks.push(relatedStock.name);
                    }
                  });
                }
                
                articles.push({
                  title: item.title,
                  description: item.description || item.title,
                  url: item.article_url,
                  source: item.publisher?.name || 'Polygon',
                  publishedAt: item.published_utc,
                  image: item.image_url,
                  relatedStocks: relatedStocks,
                  isWatchlistNews: true
                });
              }
            });
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`❌ Polygon Error for ${stock.name}:`, error.message);
        }
      }
    } catch (error) {
      console.error('❌ Polygon Error:', error.message);
      errors.push({ source: 'Polygon', error });
    }
  }
  
  await Promise.all([
    fetchFromNewsAPI(),
    fetchFromAlphaVantage(),
    fetchFromPolygon()
  ]);
  
  articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
  const uniqueArticles = [];
  const seenTitles = new Set();
  
  for (const article of articles) {
    const titleKey = article.title.toLowerCase().substring(0, 50);
    if (!seenTitles.has(titleKey)) {
      seenTitles.add(titleKey);
      uniqueArticles.push(article);
    }
  }
  
  return {
    articles: uniqueArticles.slice(0, 50),
    watchlistStocks,
    totalStocks: watchlist.length,
    activeStocks: watchlist.filter(s => s.shares > 0).length,
    watchingOnly: watchlist.filter(s => s.shares === 0).length,
    errors: errors.length > 0 ? errors : null,
    fetchedAt: new Date().toISOString()
  };
}