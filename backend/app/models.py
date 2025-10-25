"""
Database models for storing conversations
"""
from sqlalchemy import Column, String, Text, DateTime, Integer, JSON
from sqlalchemy.sql import func
from app.database import Base

class Conversation(Base):
    """
    Stores user conversations
    """
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False) # Clerk user ID
    title = Column(String, nullable=True) # Optional conversation title
    messages = Column(JSON, nullable=False) # Store messages as JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Conversation(id={self.id}, user_id={self.user_id})>"