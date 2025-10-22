"""
FastAPI backend for AI Knowledge Base Chat
Provides RAG capabilities with local LLM and embeddings
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path
from pydantic import BaseModel
from app.rag import RAGSystem

# Initialise FastAPI app
app = FastAPI(
    title="KB RAG API",
    description="AI-powered knowledge base with RAG",
    version="1.0.0"
)

# Configure CORS (allow frontend to call backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "https://*.vercel.app",   # Vercel deployments
        "https://vercel.app",     # Vercel domains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_knowledge_base():
    """Load KB articles from JSON file"""
    kb_path = Path(__file__).parent.parent / "data" / "knowledge_base.json"
    with open(kb_path, 'r') as f:
        data = json.load(f)
    return data['articles']

# Store articles in memory (later we'll use a database)
KNOWLEDGE_BASE = load_knowledge_base()

# Initialise RAG system
rag_system = RAGSystem()

# Index all articles on startup
rag_system.index_articles(KNOWLEDGE_BASE)

# Pydantic models for API requests/responses
class Article(BaseModel):
    """Knowledge base article"""
    id: str
    title: str
    content: str
    category: str
    tags: list[str]


class QueryRequest(BaseModel):
    """Request body for chat queries"""
    query: str

class QueryResponse(BaseModel):
    """Response body for chat queries"""
    answer: str
    sources: list[Article]

# API Endpoints
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "KB RAG API is running",
        "version": "1.0.0",
        "status": "healthy",
    }

@app.get("/articles", response_model=list[Article])
async def get_articles():
    """Get all knowledge base articles"""
    return KNOWLEDGE_BASE

@app.get("/articles/{article_id}", response_model=Article)
async def get_article(article_id: str):
    """Get a specific article by ID"""
    for article in KNOWLEDGE_BASE:
        if article['id'] == article_id:
            return article
    return {"error": "Article not found"}

@app.post("/chat", response_model=QueryResponse)
async def chat(request: QueryRequest):
    """
    Chat endpoint - using RAG
    Retrieves relevant articles and generates intelligent answers
    """

    # Use RAG pipeline to get answer + sources
    result = rag_system.query(request.query, n_results=3)
    
    return {
        "answer": result['answer'],
        "sources": result['sources'][:3]  # Return top 3 sources
    }