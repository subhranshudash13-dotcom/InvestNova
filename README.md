# InvestNova - AI Stock & Forex Trading Platform

<div align="center">

![InvestNova](https://img.shields.io/badge/InvestNova-AI%20Trading%20Platform-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**AI-powered stock and forex recommendations with real-time data and risk analysis**

[Features](#features) • [Tech Stack](#tech-stack) • [Setup](#setup) • [Deployment](#deployment)

</div>

---

## 🚀 Features

### Core Capabilities
- **Real-Time Market Data** - Latest stock prices and forex rates from Finnhub API
- **AI Risk Analysis** - Proprietary risk scoring algorithms for stocks (0-100 scale)
- **Forex Trading** - Support for 20+ currency pairs (majors, minors, exotics)
- **Personalized Recommendations** - Rankings based on risk tolerance and investment horizon
- **Portfolio Simulator** - Test strategies with stocks and forex without real money
- **MongoDB Caching** - 5-minute TTL for optimal performance
- **Realtime Updates** - Supabase subscriptions for live data

### User Experience
- ✨ Animated landing page with particle effects
- 🎨 Glassmorphism design with dark mode
- 📊 Interactive charts (candlestick, risk gauges, radar)
- 📱 Fully responsive (mobile-first design)
- 🔐 Secure authentication (Email + Google OAuth)

---

## 🛠  Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | Node.js API Routes, Server Actions |
| **Database** | Supabase (PostgreSQL), MongoDB Atlas (caching) |
| **Authentication** | Supabase Auth (email + OAuth) |
| **Charts** | Chart.js, Recharts |
| **API** | Finnhub (stocks + forex data) |
| **Deployment** | Vercel |

---

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js 18+** installed
- **npm** or **yarn** package manager
- Accounts on:
  - [Supabase](https://supabase.com) (free tier)
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier)
  - [Finnhub](https://finnhub.io) (free API key)

---

## 🔧 Setup Instructions

### 1. Clone & Install
```bash
cd invest-nova
npm install
```

### 2. Configure Supabase

1. **Create a new project** at [supabase.com](https://supabase.com)
2. Go to **Project Settings > API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

3. **Create database tables** in SQL Editor:
```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  risk_tolerance TEXT CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  investment_horizon TEXT CHECK (investment_horizon IN ('short', 'medium', 'long')),
  investment_amount NUMERIC,
  preferred_assets TEXT CHECK (preferred_assets IN ('stocks', 'forex', 'both')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recommendations table
CREATE TABLE recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  stocks JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Forex recommendations table
CREATE TABLE forex_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  pairs JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE forex_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own recommendations" ON recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recommendations" ON recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own forex" ON forex_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own forex" ON forex_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
```

4. **Enable Google OAuth** (optional):
   - Go to **Authentication > Providers > Google**
   - Enable and add your OAuth credentials

### 3. Configure MongoDB Atlas

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Add Database User**: Database Access > Add New User
3. **Whitelist IP**: Network Access > Add IP Address > Allow Access from Anywhere (0.0.0.0/0)
4. **Get Connection String**: Clusters > Connect > Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password

### 4. Get Finnhub API Key

1. Sign up at [finnhub.io](https://finnhub.io/register)
2. Copy your free API key from the dashboard
3. **Free tier limits**: 60 API calls/minute, 30 calls/second

### 5. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/investnova?retryWrites=true&w=majority

# Finnhub
FINNHUB_API_KEY=your-finnhub-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=InvestNova
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🚢 Deployment (Vercel)

### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/invest-nova)

### Manual Deployment

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. **Deploy on Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Click "Deploy"

3. **Update Environment**
   - After deployment, update `NEXT_PUBLIC_APP_URL` in Vercel to your production URL
   - Update Supabase redirect URLs in Project Settings

---

## 📊 How It Works

### Stock Risk Score Algorithm
```
Risk Score = (Volatility × 0.4) + (Beta × 0.2) + (RSI × 0.1) + (Drawdown × 0.2) + (Sentiment × 0.2)

Categories:
- Low Risk (0-30): Green - Conservative investors
- Medium Risk (30-70): Yellow - Balanced portfolios
- High Risk (70-100): Red - Aggressive traders
```

### Forex Risk Score Algorithm
```
Forex Risk = (ATR × 0.35) + (Leverage × 0.25) + (Liquidity × 0.15) + (Trend × 0.15) + (Spread × 0.10)

Liquidity Levels:
- Major pairs (EUR/USD): Low risk
- Minor pairs (EUR/GBP): Medium risk
- Exotic pairs (USD/TRY): High risk
```

---

## ⚠️ Disclaimer

**IMPORTANT**: InvestNova provides AI-generated insights based on publicly available market data and is **NOT financial advice**.  

- Past performance does not guarantee future results
- All investments carry risk
- You may lose money
- Always consult a licensed financial advisor before making investment decisions
- Trade at your own risk

This platform is for educational and informational purposes only.

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🤝 Contributing

Contributions are welcome! Please read CONTRIBUTING.md for guidelines.

---

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@investnova.com

---

<div align="center">

**Built with ❤️ using Next.js 15**

[⬆ Back to Top](#investnova---ai-stock--forex-trading-platform)

</div>
