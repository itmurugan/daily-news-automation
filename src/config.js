import dotenv from 'dotenv';

dotenv.config();

export const config = {
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    from: process.env.EMAIL_FROM || 'your-email@gmail.com',
    to: process.env.EMAIL_TO || 'itmurugan@gmail.com',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },
  news: {
    categories: [
      'Technology',
      'Business',
      'Markets',
      'Economy',
      'Politics',
      'World News',
      'Science',
      'Health'
    ],
    sources: [
      { name: 'Reuters', url: 'https://www.reuters.com/api/news' },
      { name: 'Bloomberg', url: 'https://www.bloomberg.com/api' },
      { name: 'TechCrunch', url: 'https://techcrunch.com/feed' },
      { name: 'Financial Times', url: 'https://www.ft.com/rss' }
    ]
  },
  report: {
    title: 'Daily News Digest',
    logoUrl: 'https://via.placeholder.com/150x50/000000/FFFFFF?text=DAILY+NEWS',
    theme: {
      primary: '#000000',
      secondary: '#FF6B00',
      background: '#FFFFFF',
      text: '#333333'
    }
  }
};