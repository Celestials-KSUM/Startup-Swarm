# 🚀 Startup Swarm
Team Name: Celestials
Team Members: Muhammed Shahinsha, Akshay C,Sangeeth, Shamveel P, Hina Hanan



**Startup Swarm** is a fullstack AI-powered startup validation platform. Users pitch a raw startup idea, and an AI "swarm" of specialized agents analyzes it across multiple dimensions (market viability, competition, execution risk, product-market fit) to produce a structured Business Blueprint with scores, insights, and a strategic roadmap.

![Startup Swarm](client/public/dashboard.png) *(Illustrative)*

## 🌟 Features

- **Multi-Agent Evaluation**: Connects with specialized agents for Market Research, Competition Intel, Execution Risk, and PMF Probability.
- **Interactive Architect Wizard**: A multi-step discovery process that refines raw ideas into concrete business plans.
- **Comprehensive Blueprints**: Generates a detailed Business Blueprint JSON output detailing strategic roadmaps, cost structure, and revenue models.

## 🏗️ Architecture

The platform consists of three main services:

1. **Client (Frontend)**: Next.js 16 + React 19 + TailwindCSS 4 SPA running on `localhost:3000`.
2. **Python Backend (Primary AI Orchestrator)**: FastAPI + LangGraph Python service running on `localhost:8000`. Powered by PostgreSQL and running an advanced parallel fan-out multi-agent graph.
3. **Node.js Server (Alternative/Secondary API)**: Express 5 + LangGraph JS running on `localhost:5000` with MongoDB checkpointing.

*(Note: Currently, the Next.js frontend connects directly to the Python Backend for AI orchestration).*

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (3.11+)
- [PostgreSQL](https://www.postgresql.org/) (Running locally or hosted)
- [MongoDB](https://www.mongodb.com/) (If using the Node.js server)
- Groq API Key

### 1. Python AI Backend (Required)

The core AI intelligence layer running the agent swarm via `LangGraph`.

```bash
cd backend
python -m venv venv
# Activate venv: `source venv/bin/activate` or `.\venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
PROJECT_NAME="Startup Swarm AI Orchestrator"
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/startup_swarm
```

Ensure your PostgreSQL database is running and create the `startup_swarm` database:
```bash
psql -U postgres -c "CREATE DATABASE startup_swarm;"
```

Run the FastAPI server:
```bash
uvicorn app.main:app --reload
# Runs on http://localhost:8000
```

### 2. Client Frontend (Required)

The Next.js 16 user interface.

```bash
cd client
npm install
npm run dev
# Runs on http://localhost:3000
```

### 3. Node.js Server (Optional / Alternative)

A parallel Node.js/Express implementation of the orchestrator using MongoDB.

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/startup_swarm
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_secret_key
NODE_ENV=development
```

Run the Express server:
```bash
npm run dev
# Runs on http://localhost:5000
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, Framer Motion / GSAP, Lucide React
- **Backend (Python)**: FastAPI, LangChain, LangGraph, SQLAlchemy (AsyncPG), PostgreSQL
- **Backend (Node)**: Node.js, Express 5, LangGraph JS, Mongoose, MongoDB
- **AI / LLM**: Groq (`llama-3.3-70b-versatile`)

## 📝 Known Caveats for Developers

- **Key Mismatch**: Currently, the `client` expects `blueprint.agentScoring?.marketReseach` (typo without the 'r') while the backend outputs `marketResearch`. This causes the frontend Market Viability scorecard to show `undefined`.
- The Node.js server implementation also retains this typo in its system prompt JSON schema (`startupArchitect.ts`), aligning with the frontend's expectation, but the Python backend has corrected it.
- **Standalone Backends**: Standard communication flow is currently `Frontend (3000) -> Python Backup (8000)`.

---
*For a complete internal breakdown of the file structure, graph topology, and API states, please refer to the `PROJECT_ANALYSIS.md` file.*