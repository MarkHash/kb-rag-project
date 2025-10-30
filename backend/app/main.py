"""
FastAPI backend for AI Knowledge Base Chat
Provides RAG capabilities with local LLM and embeddings
"""

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path
from pydantic import BaseModel
from app.rag import RAGSystem
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Conversation
from typing import Optional
from datetime import datetime
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.logger import logger

# Initialise rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialise FastAPI app
app = FastAPI(
    title="KB RAG API",
    description="AI-powered knowledge base with RAG",
    version="1.0.0"
)

# Custom rate limit error handler with logging
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    logger.warning(f"Rate limit exceeded for IP: {request.client.host}")
    return _rate_limit_exceeded_handler(request, exc)

# Add rate limiter to app
app.state.limiter = limiter

# Configure CORS (allow frontend to call backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "https://kb-rag-project-lh7cyx8y9-mark-hashimotos-projects.vercel.app",  # Vercel preview
        "https://kb-rag-project.vercel.app",  # Vercel production (if you have custom domain)
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

class ConversationCreate(BaseModel):
    """Request to create/update a conversation"""
    user_id: str
    messages: list[dict]
    title: Optional[str] = None

class ConversationResponse(BaseModel):
    """Response with conversation data"""
    id: int
    user_id: str
    messages: list[dict]
    title: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

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
@limiter.limit("10/minute")
async def chat(request: Request, query: QueryRequest):
    """
    Chat endpoint - using RAG
    Retrieves relevant articles and generates intelligent answers
    """
    try:
        # Use RAG pipeline to get answer + sources
        result = rag_system.query(query.query, n_results=3)
        
        return {
            "answer": result['answer'],
            "sources": result['sources'][:3]  # Return top 3 sources
        }
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while processing your request")

def generate_conversation_title(messages: list[dict]) -> str:
    """
    Generate a conversation title from the first user message.
    Takes first 50 characters of the first user message.
    """
    for message in messages:
        if message.get('sender') == 'user':
            text = message.get('text', '')
            # Take first 50 characters, add ellipsis if longer
            if len(text) > 50:
                return text[:50] + "..."
            return text
    return "New Conversation"

@app.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    conversation: ConversationCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new conversation for a user
    """
    try:
        title = conversation.title
        if not title:
            title = generate_conversation_title(conversation.messages)
        db_conversation = Conversation(
            user_id=conversation.user_id,
            messages=conversation.messages,
            title=title
        )
        db.add(db_conversation)
        db.commit()
        db.refresh(db_conversation)
        return db_conversation
    except Exception as e:
        logger.error(f"Error creating conversation for user {conversation.user_id}: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save conversation")

@app.get("/conversations/{user_id}", response_model=list[ConversationResponse])
async def get_user_conversations(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get all conversations for a specific user
    """
    conversations = db.query(Conversation).filter(
        Conversation.user_id == user_id
    ).order_by(Conversation.updated_at.desc()).all()
    return conversations


@app.get("/conversations/{user_id}/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    user_id: str,
    conversation_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific conversation
    """
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id,
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@app.put("/conversations/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: int,
    conversation: ConversationCreate,
    db: Session = Depends(get_db)
):
    """
    Update an existing conversation
    """
    try:
        db_conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == conversation.user_id,
        ).first()

        if not db_conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        db_conversation.messages = conversation.messages
        if conversation.title:
            db_conversation.title = conversation.title

        db.commit()
        db.refresh(db_conversation)
        return db_conversation
    except Exception as e:
        logger.error(f"Error updating conversation {conversation_id}: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update conversation")

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete a specific conversation
    Requires user_id as query parameter for security
    """
    try:
        db_conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        ).first()

        if not db_conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        db.delete(db_conversation)
        db.commit()
        return {"message": "Conversation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting conversation {conversation_id}: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete conversation")