# CardCompare India

A modern credit card comparison website for Indian consumers. Compare 50+ credit cards across 35+ parameters, get AI-powered recommendations based on your spending habits.

## Features

- **Card Browser**: Filter and browse cards by bank, network, fees, rewards, and more
- **Side-by-Side Comparison**: Compare up to 4 cards across 35+ parameters
- **AI Assistant**: Get personalized card recommendations using Groq AI (free tier)
- **Real Card Data**: 8 popular Indian credit cards with accurate data

## Tech Stack

### Frontend (React App)
- React 18 + TypeScript
- Vite for fast builds
- Tailwind CSS for styling
- Groq SDK for AI chat
- Lucide React for icons

### Data Pipeline (Python)
- Pydantic for data models
- BeautifulSoup for web scraping
- Ollama for local LLM processing

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Groq API Key (for AI features)

Get a free API key from [console.groq.com/keys](https://console.groq.com/keys)

```bash
cp .env.example .env
# Edit .env and add your VITE_GROQ_API_KEY
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```
cards/
├── src/
│   ├── components/
│   │   ├── ai/              # AI chat interface
│   │   ├── cards/           # Card grid and comparison
│   │   └── dashboard/       # Filter panel
│   ├── data/
│   │   └── cards.json       # Credit card data (35+ params)
│   ├── lib/
│   │   ├── groq.ts          # Groq AI integration
│   │   └── utils.ts         # Utility functions
│   └── types/
│       └── card.ts          # TypeScript types
├── python/                   # Data scraping pipeline
│   ├── scrapers/            # Bank-specific scrapers
│   ├── processors/          # LLM processing
│   └── models/              # Pydantic schemas
└── README.md
```

## Card Data Schema

Each card has 35+ parameters organized in 8 categories:

| Category | Parameters |
|----------|-----------|
| Basic Info | name, issuer, network, cardType, image |
| Fees | joiningFee, annualFee, waivers, fuelSurcharge |
| Eligibility | minSalary, minCibil, employmentType, age |
| Rewards | rewardRate, pointValue, categories, milestones |
| Lounge Access | domestic, international, railway |
| Discounts | platforms, categories, partners |
| Charges | interest, foreignTxn, lateFee, EMI |
| Features | contactless, concierge, insurance, golf |

## Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Python Data Pipeline

To scrape and process new card data:

```bash
cd python
pip install -r requirements.txt

# Scrape HDFC cards
python main.py scrape --bank hdfc

# Process with Ollama
python main.py process --input raw_hdfc.json --output cards.json

# Export to React app
python main.py export --input cards.json
```

See [python/README.md](python/README.md) for details.

## Included Cards

1. HDFC Regalia Gold (Premium)
2. ICICI Amazon Pay (Entry Level)
3. SBI Cashback (Entry Level)
4. Axis ACE (Entry Level)
5. Amex Membership Rewards (Premium)
6. HDFC Millennia (Entry Level)
7. ICICI Sapphiro (Super Premium)
8. Kotak 811 (Entry Level)

## Screenshots

### Card Browser
Filter by bank, network, fees, rewards, and features.

### Comparison Table
Side-by-side comparison with highlighting for best values.

### AI Assistant
Natural language queries with context-aware recommendations.

## Contributing

1. Add new bank scrapers in `python/scrapers/`
2. Update card data in `src/data/cards.json`
3. Improve UI components in `src/components/`

## Disclaimer

Card data is for informational purposes only. Always verify details on the bank's official website before applying. Rates and offers may change.

## License

MIT
