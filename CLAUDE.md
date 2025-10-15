# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Developer Context

**Learning Project:** This is a personal portfolio project to learn TypeScript and RAG implementation. The developer is learning TypeScript for the first time with Next.js/React.

**Assistance Style:**
- Provide clear explanations of TypeScript concepts before implementing them
- Add detailed comments in code explaining what each part does and why
- Explain React/Next.js patterns as they're introduced
- Use this as a teaching opportunity - don't just write code, explain the reasoning
- Break down complex concepts into smaller, digestible pieces
- Encourage hands-on practice by suggesting modifications for the developer to try

**Working Style:**
- **The developer runs all commands themselves** - Do NOT execute bash commands for setup, installation, or running servers
- Provide command instructions with explanations, then wait for the developer to run them
- Guide with "Run this command: `...`" rather than executing commands directly
- Exception: You may run read-only commands (ls, cat, grep) to inspect the codebase

**Daily Learning Log:**
- At the end of each work session, create/update a daily log in `learning-log/YYYY-MM-DD.md`
- Log format should include:
  - **What we built today:** Features/components implemented
  - **TypeScript concepts learned:** New TS patterns, types, interfaces used
  - **Commands used:** Key CLI commands with explanations
  - **Challenges faced:** Problems encountered and how we solved them
  - **Next steps:** What to work on in the next session
  - **Key takeaways:** Important lessons or "aha!" moments
- This helps track progress and serves as a personal reference guide

**Goal:** Enable the developer to implement similar features independently in the future.

## Project Overview

This is an AI-powered Customer Support Knowledge Base using RAG (Retrieval Augmented Generation). The project combines customer support domain expertise with AI/ML capabilities to enable semantic search and natural language question answering over knowledge base articles.

**Status:** Early planning phase - implementation following the 8-12 week roadmap in `next-project-plan.md`

## Architecture

Full-stack TypeScript + Python application with three layers:

```
Frontend (Next.js 15 + TypeScript) → Vercel
    ↓ HTTP REST API
Backend (FastAPI + Python) → Railway/Render
    ↓
Data (PostgreSQL + Pinecone/Weaviate)
```

### Frontend
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** TailwindCSS
- **Deployment:** Vercel
- **Features:** Chat interface, admin panel, conversation history

### Backend
- **Framework:** FastAPI with async support
- **Validation:** Pydantic for type-safe data models
- **AI/ML:** Hybrid approach (see below)
- **Orchestration:** LangChain (optional)
- **Deployment:** Railway (preferred for CLI experience)

### Data Layer
- **Relational DB:** PostgreSQL (articles, users, conversations)
- **Vector DB:** Pinecone free tier or ChromaDB (local)
- **Free tier:** Pinecone 1 index, 100K vectors

## Key Technical Decisions

### AI/ML Strategy: Hybrid Approach (Free → Paid)

**Development Phase (Weeks 4-8): Local/Free Models**
- **Embeddings:** sentence-transformers/all-MiniLM-L6-v2 (local, free)
- **LLM:** Ollama Llama 3.1 8B (local, free)
- **Vector DB:** ChromaDB (local) or Pinecone free tier
- **Cost:** $0/month
- **Purpose:** Learn RAG concepts, iterate fast without API costs

**Production Phase (Weeks 9-12): OpenAI API**
- **Embeddings:** OpenAI text-embedding-3-small
- **LLM:** OpenAI GPT-4o-mini
- **Vector DB:** Pinecone free tier (sufficient for demo)
- **Cost:** ~$15/month
- **Purpose:** Better quality for portfolio demo and interviews

**Why Hybrid:**
- Learn without spending money during development
- No API rate limits while experimenting
- Switch to OpenAI for better demo quality
- Shows understanding of multiple approaches in interviews

### RAG Pipeline Flow

**Development (Local Models):**
1. User query → Embed with sentence-transformers (local)
2. Vector search in ChromaDB/Pinecone to retrieve relevant KB articles
3. Inject retrieved docs into prompt context
4. Generate answer with Ollama Llama 3.1
5. Return answer with source citations

**Production (OpenAI):**
1. User query → Embed with OpenAI text-embedding-3-small
2. Vector search in Pinecone to retrieve relevant KB articles
3. Inject retrieved docs into prompt context
4. Generate answer with GPT-4o-mini
5. Return answer with source citations

### TypeScript Integration
- Frontend uses TypeScript strict mode
- Generate TypeScript client SDK from FastAPI OpenAPI schema
- Pydantic models in backend mirror TypeScript interfaces

### Environment Management
- Frontend: `.env.local` for Next.js environment variables
- Backend: Environment variables in Railway/Render dashboard
- Never commit API keys (OpenAI, Pinecone, database credentials)

## Development Commands

### Frontend (Next.js)
```bash
# Setup
npx create-next-app@latest --typescript --tailwind --app

# Development
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Deploy
git push origin main # Auto-deploys to Vercel via GitHub integration
```

### Backend (FastAPI)
```bash
# Setup
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn pydantic openai pinecone-client langchain sqlalchemy psycopg2-binary

# Development
uvicorn main:app --reload              # Start dev server at http://localhost:8000
uvicorn main:app --reload --port 8001  # Use different port if needed

# Testing
pytest                           # Run all tests
pytest tests/test_rag.py        # Run specific test file
pytest -v --cov=app             # Run with coverage

# API Documentation (auto-generated)
# Visit http://localhost:8000/docs for Swagger UI
# Visit http://localhost:8000/redoc for ReDoc
```

### Database
```bash
# Local PostgreSQL setup
psql -U postgres
CREATE DATABASE kb_rag_dev;

# Run migrations (if using Alembic)
alembic upgrade head
alembic revision --autogenerate -m "description"
```

## Project Phases (8-12 Weeks)

### Phase 1: Frontend (Weeks 1-3)
- Week 1: Next.js setup, TypeScript basics, chat UI, Vercel deployment
- Week 2: React patterns, state management, typed API calls
- Week 3: TailwindCSS styling, routing, admin panel, responsive design

### Phase 2: RAG Backend (Weeks 4-6)
- Week 4: FastAPI setup, OpenAI embeddings, Pinecone integration, basic RAG
- Week 5: GPT-4o-mini integration, prompt engineering, context injection
- Week 6: Admin CRUD API, auto-embedding generation, PostgreSQL integration

### Phase 3: Integration + Cloud (Weeks 7-9)
- Week 7: Frontend-backend integration, TypeScript SDK, error handling
- Week 8: Railway/Render deployment, cloud PostgreSQL, production Pinecone
- Week 9: Rate limiting, authentication, logging, performance optimization

### Phase 4: Production Features (Weeks 10-12)
- Week 10: Admin UI (article management, analytics)
- Week 11: User features (history, feedback, citations)
- Week 12: CI/CD (GitHub Actions), documentation, demo

## Code Quality Standards

### TypeScript
- Enable strict mode in `tsconfig.json`
- Define explicit types for all props and API responses
- Use interfaces for data structures, types for unions/utilities
- Avoid `any` type - use `unknown` if type is truly unknown

### Python
- Type hints for all functions (PEP 484)
- Pydantic models for all API request/response schemas
- Async/await for I/O operations (database, API calls)
- FastAPI dependency injection for database sessions, auth

### Testing Expectations
- Frontend: React Testing Library for components
- Backend: pytest for API endpoints and RAG pipeline
- Target: >70% test coverage
- Test RAG pipeline with mock embeddings to avoid API costs

## Common Patterns

### Frontend API Call Pattern
```typescript
// Use typed response with error handling
interface ChatResponse {
  answer: string;
  sources: Source[];
  conversation_id: string;
}

async function askQuestion(query: string): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
```

### Backend RAG Endpoint Pattern
```python
# FastAPI endpoint with Pydantic validation
from pydantic import BaseModel

class QueryRequest(BaseModel):
    query: str
    conversation_id: str | None = None

class QueryResponse(BaseModel):
    answer: str
    sources: list[Source]
    conversation_id: str

@app.post("/api/chat", response_model=QueryResponse)
async def chat(request: QueryRequest):
    # 1. Generate embedding
    embedding = await get_embedding(request.query)

    # 2. Search vector DB
    results = await vector_search(embedding, top_k=5)

    # 3. Build context from results
    context = build_context(results)

    # 4. Generate answer with LLM
    answer = await generate_answer(request.query, context)

    return QueryResponse(
        answer=answer,
        sources=results,
        conversation_id=request.conversation_id or generate_id()
    )
```

## Performance Targets

- **RAG Query Response:** <2 seconds end-to-end
- **Embedding Generation:** <500ms (OpenAI API)
- **Vector Search:** <100ms (Pinecone)
- **LLM Generation:** <1.5 seconds (GPT-4o-mini)
- **Cost:** <$20/month (OpenAI + Pinecone + Railway)

## Deployment Configuration

### Vercel (Frontend)
- Auto-deploy on push to `main` branch
- Environment variables: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`
- Build command: `npm run build`
- Output directory: `.next`

### Railway/Render (Backend)
- Auto-deploy on push to `main` branch
- Environment variables: `OPENAI_API_KEY`, `PINECONE_API_KEY`, `DATABASE_URL`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health check endpoint: `/health`

### Database Migration Strategy
- Use Alembic for schema migrations
- Run migrations before deploying new backend version
- Keep migrations in `alembic/versions/`

## Security Considerations

- **API Keys:** Never commit to git, use environment variables
- **Rate Limiting:** Implement on backend to prevent abuse (10 req/min per IP)
- **Authentication:** Start with simple API key auth, upgrade to OAuth later
- **CORS:** Configure for Vercel domain only (not wildcard)
- **Input Validation:** Pydantic validates all inputs, sanitize before DB queries

## Domain-Specific Context

This project leverages 10 years of customer support experience to solve real knowledge base search pain points:

- **Problem:** Traditional keyword search misses semantically similar articles
- **Solution:** Vector embeddings enable semantic search ("How do I reset password?" finds "Password recovery guide")
- **Problem:** Users need to read multiple articles to find answers
- **Solution:** RAG generates direct answers with source citations
- **Problem:** Support agents need fast answers during live chats
- **Solution:** <2s response time with relevant context

The customer support domain expertise should inform:
- UI/UX decisions (minimize clicks, show sources)
- Search relevance tuning (prefer official docs over community posts)
- Answer generation prompts (concise, actionable, empathetic tone)
- Analytics (track which articles are most useful, which queries fail)

## Future Enhancements (Post-MVP)

- Conversation memory (multi-turn dialogues)
- Agentic features (tool use, planning)
- Multi-language support
- Custom embeddings fine-tuned on KB articles
- A/B testing for prompt variations
- AWS integration (S3 for article uploads, Lambda for preprocessing)
