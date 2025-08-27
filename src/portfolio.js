export const portfolio = [
  { ticker: 'SEHK:9988', name: 'Alibaba Group Holding', shares: 1900, avgPrice: 80, currency: 'HKD' },
  { ticker: 'GOOGL', name: 'Alphabet', shares: 500, avgPrice: 202.5, currency: 'USD', exchange: 'NasdaqGS' },
  { ticker: 'SEHK:1211', name: 'BYD', shares: 2000, avgPrice: 112, currency: 'HKD' },
  { ticker: 'QBTC', name: 'Bitcoin Fund', shares: 60, avgPrice: 1, currency: 'CAD', exchange: 'TSX' },
  { ticker: 'CY6U', name: 'CapitaLand India Trust', shares: 101000, avgPrice: 0.76, currency: 'SGD', exchange: 'SGX' },
  { ticker: 'SEHK:2778', name: 'Champion Real Estate Investment Trust', shares: 30000, avgPrice: 1.4, currency: 'HKD' },
  { ticker: 'SEHK:1378', name: 'China Hongqiao Group', shares: 12000, avgPrice: 19.35, currency: 'HKD' },
  { ticker: 'SEHK:2877', name: 'China Shineway Pharmaceutical Group', shares: 6000, avgPrice: 10.52, currency: 'HKD' },
  { ticker: 'C09', name: 'City Developments', shares: 3500, avgPrice: 5.9, currency: 'SGD', exchange: 'SGX' },
  { ticker: 'P9D', name: 'Civmec', shares: 16000, avgPrice: 0.70, currency: 'SGD', exchange: 'SGX' },
  { ticker: 'SEHK:1681', name: 'Consun Pharmaceutical Group', shares: 9000, avgPrice: 0.10, currency: 'HKD' },
  { ticker: 'DHLU', name: 'Daiwa House Logistics Trust', shares: 10000, avgPrice: 0.59, currency: 'SGD', exchange: 'SGX' },
  { ticker: 'DELL', name: 'Dell Technologies', shares: 250, avgPrice: 135, currency: 'USD', exchange: 'NYSE' },
  { ticker: 'LLY', name: 'Eli Lilly', shares: 50, avgPrice: 656, currency: 'USD', exchange: 'NYSE' },
  { ticker: 'MXNU', name: 'Elite UK REIT', shares: 25000, avgPrice: 0.24, currency: 'GBP', exchange: 'SGX' },
  { ticker: 'SEHK:778', name: 'Fortune Real Estate Investment Trust', shares: 46000, avgPrice: 4.2, currency: 'HKD' },
  { ticker: 'F17', name: 'GuocoLand', shares: 12000, avgPrice: 1.75, currency: 'SGD', exchange: 'SGX' },
  { ticker: 'HDB', name: 'HDFC Bank', shares: 200, avgPrice: 63, currency: 'USD', exchange: 'NYSE' },
  { ticker: 'HPE', name: 'Hewlett Packard Enterprise', shares: 1700, avgPrice: 21.5, currency: 'USD', exchange: 'NYSE' },
  { ticker: 'UD1U', name: 'IREIT Global', shares: 57000, avgPrice: 0.28, currency: 'SGD', exchange: 'SGX' },
  { ticker: 'SEHK:9618', name: 'JD.com', shares: 2000, avgPrice: 110, currency: 'HKD' },
  { ticker: 'CMOU', name: 'Keppel Pacific Oak US REIT', shares: 18000, avgPrice: 0.24, currency: 'USD', exchange: 'SGX' },
  { ticker: 'SEHK:823', name: 'Link Real Estate Investment Trust', shares: 3000, avgPrice: 27, currency: 'HKD' },
  { ticker: 'BTOU', name: 'Manulife US Real Estate Investment Trust', shares: 78000, avgPrice: 0.10, currency: 'USD', exchange: 'SGX' },
  { ticker: 'SEHK:3690', name: 'Meituan', shares: 2000, avgPrice: 121.2, currency: 'HKD' },
  { ticker: 'META', name: 'Meta Platforms', shares: 55, avgPrice: 743, currency: 'USD', exchange: 'NasdaqGS' },
  { ticker: 'NIFTYBEES', name: 'Nippon India ETF Nifty 50 BeES', shares: 40000, avgPrice: 253, currency: 'INR', exchange: 'NSEI' },
  { ticker: 'TS0U', name: 'OUE Real Estate Investment Trust', shares: 63000, avgPrice: 0.28, currency: 'SGD', exchange: 'SGX' },
  { ticker: 'OXMU', name: 'Prime US REIT', shares: 30000, avgPrice: 0.18, currency: 'USD', exchange: 'SGX' },
  { ticker: '005930', name: 'Samsung Electronics', shares: 150, avgPrice: 53000, currency: 'KRW', exchange: 'KOSE' },
  { ticker: 'S56', name: 'Samudera Shipping Line', shares: 15000, avgPrice: 0.60, currency: 'SGD', exchange: 'SGX' },
  { ticker: 'CRPU', name: 'Sasseur Real Estate Investment Trust', shares: 40000, avgPrice: 0.70, currency: 'SGD', exchange: 'SGX' },
  { ticker: 'P40U', name: 'Starhill Global Real Estate Investment Trust', shares: 30000, avgPrice: 0.50, currency: 'SGD', exchange: 'SGX' },
  { ticker: 'CWBU', name: 'Stoneweg Europe Stapled Trust', shares: 3600, avgPrice: 1.62, currency: 'EUR', exchange: 'SGX' },
  { ticker: 'SEHK:435', name: 'Sunlight Real Estate Investment Trust', shares: 43000, avgPrice: 1.4, currency: 'HKD' },
  { ticker: 'TSM', name: 'Taiwan Semiconductor Manufacturing', shares: 45, avgPrice: 245, currency: 'USD', exchange: 'NYSE' },
  { ticker: 'SEHK:1979', name: 'Ten Pao Group Holdings', shares: 60000, avgPrice: 2, currency: 'HKD' },
  { ticker: 'SEHK:700', name: 'Tencent Holdings', shares: 400, avgPrice: 560, currency: 'HKD' },
  { ticker: 'ODBU', name: 'United Hampshire US Real Estate Investment Trust', shares: 30000, avgPrice: 0.45, currency: 'USD', exchange: 'SGX' },
  { ticker: 'SEHK:3393', name: 'Wasion Holdings', shares: 14000, avgPrice: 8.79, currency: 'HKD' },
  { ticker: 'QK9', name: 'iShares MSCI India Climate Transition ETF', shares: 5900, avgPrice: null, currency: 'SGD', exchange: 'SGX' }
];

// Extract unique company names and tickers for searching
export function getSearchTerms() {
  const searchTerms = new Set();
  
  portfolio.forEach(stock => {
    // Add company name
    searchTerms.add(stock.name);
    
    // Add ticker without exchange prefix
    const ticker = stock.ticker.includes(':') ? stock.ticker.split(':')[1] : stock.ticker;
    searchTerms.add(ticker);
    
    // Add common variations of company names
    const shortName = stock.name.split(' ').slice(0, 2).join(' ');
    if (shortName !== stock.name) {
      searchTerms.add(shortName);
    }
  });
  
  return Array.from(searchTerms);
}

// Group stocks by category for reporting
export function getPortfolioByCategory() {
  const categories = {
    'US Tech Giants': ['GOOGL', 'META', 'TSM', 'DELL', 'HPE'],
    'Chinese Tech': ['SEHK:9988', 'SEHK:700', 'SEHK:9618', 'SEHK:3690', 'SEHK:1211'],
    'REITs': ['CY6U', 'SEHK:2778', 'DHLU', 'MXNU', 'SEHK:778', 'UD1U', 'CMOU', 'SEHK:823', 
              'BTOU', 'TS0U', 'OXMU', 'CRPU', 'P40U', 'CWBU', 'SEHK:435', 'ODBU'],
    'Healthcare & Pharma': ['LLY', 'SEHK:2877', 'SEHK:1681'],
    'Financial Services': ['HDB'],
    'Industrial': ['SEHK:1378', 'S56', 'SEHK:1979', 'SEHK:3393'],
    'Real Estate': ['C09', 'F17'],
    'ETFs & Funds': ['QBTC', 'NIFTYBEES', 'QK9'],
    'Others': ['P9D', '005930']
  };
  
  const result = {};
  
  for (const [category, tickers] of Object.entries(categories)) {
    result[category] = portfolio.filter(stock => 
      tickers.includes(stock.ticker)
    );
  }
  
  return result;
}