# NovaBite Insights — RevMind AI Take-Home Assignment

A miniature conversational BI dashboard for NovaBite Consumer Goods, built as part of the RevMind AI Fresher Full-Stack Engineer assignment.

## How to Run Locally

### Prerequisites
- Node.js 18+
- A Groq API key (free at https://console.groq.com)

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd <repo-folder>
```

### 2. Backend setup
```bash
cd backend
cp ../.env.example .env
# Add your GROQ_API_KEY to .env
npm install
node server.js
```
Backend runs on http://localhost:3001
The database is seeded automatically on first run.

### 3. Frontend setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

## LLM Used
**Groq API** with the `llama-3.3-70b-versatile` model.

Chosen because: Groq offers a generous free tier with no credit card required, extremely fast inference, and the LLaMA 3.3 70B model is highly capable at structured data reasoning and natural language question answering.

## Prompt Design for /api/chat
The prompt builds a structured text summary from live SQL queries run against the SQLite database. The context includes: net revenue by region, revenue by channel, category margins, sales rep rankings (all-time and 2025), quarterly breakdowns by region, and top product per region. This aggregated context is injected into the prompt alongside the user's question. The model is instructed to answer using only the provided data and always include numbers. This approach avoids hallucination while keeping token usage and latency low.

## What I Would Improve With More Time
- Streaming LLM responses with typewriter effect in the UI
- Multi-turn chat with conversation history
- Unit tests on seed script and aggregation queries
- Docker Compose for one-command startup
- A second chart showing revenue by category or region breakdown
- Better mobile responsiveness

## Tradeoffs / Shortcuts
- **SQLite instead of Postgres**: fine for 1,000 rows and local dev, not production-scale
- **sql.js instead of better-sqlite3**: avoided native compilation issues on Windows by using the pure JS implementation
- **Pre-aggregated context**: SQL summaries are sent to the LLM rather than raw rows, keeping prompts short and accurate but limiting very granular questions
- **No authentication**: not required for this scope