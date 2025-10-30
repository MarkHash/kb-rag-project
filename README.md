# AI Knowledge Base Chat with RAG

A full-stack AI-powered knowledge base application featuring Retrieval-Augmented Generation (RAG), conversation history management, and intelligent document search.

**Live Demo:** [https://kb-rag-project.vercel.app](https://kb-rag-project.vercel.app)

![Project Status](https://img.shields.io/badge/status-production-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Future Enhancements](#-future-enhancements)
- [Project Structure](#-project-structure)
- [Learning Resources](#-learning-resources)
- [License](#-license)

---

## ✨ Features

### Current Features

**🤖 RAG-Powered Chat**
- Semantic search over knowledge base using embeddings
- Context-aware responses using Groq LLM (Llama 3.1)
- Source citations for transparency and verification

**💬 Conversation Management**
- Persistent conversation history with PostgreSQL
- Sidebar UI with date grouping (Today, Yesterday, Last 7 Days, Older)
- Auto-generated conversation titles from first user message
- Switch between conversations seamlessly
- Delete conversations with confirmation

**👤 Authentication & User Management**
- Clerk authentication integration
- User-specific conversation isolation
- Secure session management

**🛡️ Production-Ready Features**
- Rate limiting (10 requests/min per IP)
- Structured error logging
- Database transaction rollback on errors
- CORS configuration for secure API access

**🎨 Modern UI/UX**
- Responsive design (mobile-friendly)
- Dark sidebar with conversation list
- Hover effects and loading states
- Auto-scroll to latest messages
- Source citations with expandable cards

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** TailwindCSS
- **Authentication:** Clerk
- **Deployment:** Vercel

### Backend
- **Framework:** FastAPI (Python 3.11)
- **LLM:** Groq API (Llama 3.1 8B)
- **Embeddings:** sentence-transformers (all-MiniLM-L6-v2)
- **Vector DB:** ChromaDB (local) / Pinecone (production option)
- **Database:** PostgreSQL (Railway)
- **Rate Limiting:** slowapi
- **Deployment:** Railway

### Infrastructure
- **Database:** PostgreSQL on Railway
- **Frontend Hosting:** Vercel (auto-deploy from main branch)
- **Backend Hosting:** Railway (auto-deploy from main branch)
- **Version Control:** Git / GitHub

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Frontend (Vercel)                   │
│  • React Components (TypeScript)                             │
│  • Clerk Authentication                                      │
│  • TailwindCSS Styling                                       │
│  • Conversation History UI                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 FastAPI Backend (Railway)                    │
│  • RAG Pipeline                                              │
│  • Rate Limiting & Logging                                   │
│  • Conversation CRUD API                                     │
└────────┬──────────────┬──────────────┬─────────────────────┘
         │              │              │
         ▼              ▼              ▼
    ┌────────┐    ┌──────────┐   ┌─────────┐
    │ Groq   │    │PostgreSQL│   │ChromaDB │
    │ LLM    │    │(Railway) │   │ Vector  │
    │ API    │    │          │   │   DB    │
    └────────┘    └──────────┘   └─────────┘
```

### RAG Pipeline Flow

```
User Query
    ↓
1. Generate embedding (sentence-transformers)
    ↓
2. Vector search in ChromaDB (retrieve top 3 articles)
    ↓
3. Inject retrieved context into prompt
    ↓
4. Generate answer with Groq LLM (Llama 3.1)
    ↓
5. Return answer + source citations
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** (or use Railway)
- **Conda** (recommended for Python environment)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/kb-rag-project.git
cd kb-rag-project
```

#### 2. Backend Setup

```bash
# Create conda environment
conda create -n kb-rag python=3.11
conda activate kb-rag

# Install dependencies
cd backend
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys (see Environment Variables section)

# Run database migrations (if using Alembic)
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload
```

Backend will run on `http://localhost:8000`

#### 3. Frontend Setup

```bash
# In a new terminal
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your keys (see Environment Variables section)

# Start the development server
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## 🔐 Environment Variables

### Backend (.env)

```bash
# Groq API (LLM)
GROQ_API_KEY=your_groq_api_key_here

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Optional: Pinecone (if using instead of ChromaDB)
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_environment
```

### Frontend (.env.local)

```bash
# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000  # Local
# NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app  # Production

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Getting API Keys

- **Groq API:** Sign up at [console.groq.com](https://console.groq.com)
- **Clerk:** Sign up at [clerk.com](https://clerk.com)
- **PostgreSQL:** Use [Railway](https://railway.app) or local PostgreSQL

---

## 📦 Deployment

### Deploying Backend to Railway

1. Create a Railway account at [railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Add PostgreSQL service
5. Set environment variables (GROQ_API_KEY, DATABASE_URL)
6. Deploy from `main` branch

### Deploying Frontend to Vercel

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set environment variables (NEXT_PUBLIC_API_URL, Clerk keys)
4. Deploy from `main` branch

Auto-deployment: Both platforms auto-deploy when you push to `main` branch.

---

## 🔮 Future Enhancements

### UI/UX Improvements

- [ ] **Search/Filter Conversations** - Search by title/content with keyword highlighting
- [ ] **Loading Skeleton UI** - Animated skeleton screens while loading conversations
- [ ] **Edit Conversation Titles** - Double-click to rename auto-generated titles
- [ ] **Conversation Timestamps** - Show relative time ("2 hours ago", "Yesterday at 3pm")
- [ ] **Keyboard Shortcuts** - Cmd+N for new chat, ↑/↓ to navigate conversations
- [ ] **Mobile Responsive Sidebar** - Hamburger menu for mobile devices
- [ ] **Dark/Light Mode Toggle** - User preference for theme

### Advanced RAG Features

- [ ] **Conversation Summarization** - Auto-generate summaries using LLM
- [ ] **Semantic Search** - Search conversations by meaning, not just keywords
- [ ] **Auto-Categorization/Tagging** - LLM-powered topic classification
- [ ] **Sentiment Analysis** - Detect user satisfaction/frustration
- [ ] **Hybrid Search** - Combine keyword (BM25) + semantic search
- [ ] **Re-ranking** - Two-stage retrieval with cross-encoder
- [ ] **Query Expansion** - Generate query variations for better retrieval
- [ ] **Contextual Chunk Headers** - Add metadata to chunks for better context
- [ ] **Multi-Query Retrieval** - LLM generates sub-questions for complex queries

### Data & Analytics

- [ ] **Admin Dashboard** - View usage metrics, top queries, error rates
- [ ] **Evaluation Metrics** - Track precision@K, recall, MRR for retrieval quality
- [ ] **A/B Testing** - Test different prompt variations
- [ ] **User Feedback Loop** - Thumbs up/down for answers
- [ ] **Conversation Analytics** - Most discussed topics, average conversation length

### Collaboration & Sharing

- [ ] **Export Conversations** - Download as PDF, JSON, or text
- [ ] **Share Conversations** - Generate shareable links
- [ ] **Multi-User Conversations** - Collaborative chat sessions
- [ ] **Email Conversation Transcript** - Send conversation via email

### Advanced Features

- [ ] **Real Documentation Integration** - Scrape Python/Stripe/GitHub docs
- [ ] **Multi-Language Support** - Internationalization (i18n)
- [ ] **Voice Input** - Speech-to-text for queries
- [ ] **File Upload** - Add custom documents to knowledge base
- [ ] **API Documentation** - OpenAPI/Swagger docs for backend
- [ ] **Rate Limiting Per User** - User-specific rate limits instead of IP-based

---

## 📁 Project Structure

```
kb-rag-project/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, endpoints
│   │   ├── rag.py               # RAG system implementation
│   │   ├── models.py            # SQLAlchemy database models
│   │   ├── database.py          # Database connection
│   │   └── logger.py            # Logging configuration
│   ├── data/
│   │   └── knowledge_base.json  # KB articles (sample data)
│   ├── requirements.txt         # Python dependencies
│   └── railway.toml             # Railway deployment config
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Main chat page
│   │   ├── layout.tsx           # Root layout with Clerk
│   │   ├── types.ts             # TypeScript type definitions
│   │   ├── api/
│   │   │   └── client.ts        # API client functions
│   │   └── components/
│   │       ├── ChatMessage.tsx  # Message bubble component
│   │       └── ConversationList.tsx  # Sidebar component
│   ├── public/                  # Static assets
│   ├── .env.local               # Environment variables (not committed)
│   ├── package.json             # Node dependencies
│   ├── tsconfig.json            # TypeScript configuration
│   └── tailwind.config.ts       # TailwindCSS configuration
│
├── learning-log/                # Daily learning logs
│   ├── 2025-10-27.md
│   ├── 2025-10-28.md
│   └── 2025-10-29.md
│
├── CLAUDE.md                    # Claude Code project instructions
└── README.md                    # This file
```

---

## 📚 Learning Resources

This project was built as a learning exercise. Key concepts covered:

### TypeScript/React Concepts
- Component composition and props
- Callback functions for parent-child communication
- Array methods: `.reduce()`, `.map()`, `.filter()`, `.find()`
- TypeScript types: `Record<K, V>`, `Promise<T>`, interfaces
- React hooks: `useState`, `useEffect`, `useRef`
- Event handling: `stopPropagation()`, keyboard events
- Flexbox layouts and TailwindCSS

### Backend Concepts
- FastAPI routing and dependency injection
- Pydantic models for validation
- SQLAlchemy ORM for database operations
- Vector embeddings and similarity search
- LLM prompt engineering
- Rate limiting and security
- Error logging and monitoring

### RAG Concepts
- Semantic search with embeddings
- Vector databases (ChromaDB)
- Context injection for LLMs
- Source attribution and citations
- Chunking strategies

### DevOps & Deployment
- Git workflow and branching
- Environment variable management
- Railway and Vercel deployment
- Auto-deployment from GitHub
- Production monitoring

---

## 🤝 Contributing

This is a personal learning project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **Groq** for providing fast LLM inference
- **Clerk** for authentication infrastructure
- **Railway** and **Vercel** for hosting
- **Anthropic** for Claude Code assistance during development

---

## 📧 Contact

**Developer:** Mark Hashimoto
**Project Link:** [https://github.com/yourusername/kb-rag-project](https://github.com/yourusername/kb-rag-project)
**Live Demo:** [https://kb-rag-project.vercel.app](https://kb-rag-project.vercel.app)

---

**Built with 🤖 Claude Code**
