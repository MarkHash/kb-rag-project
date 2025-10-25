"""
Script to create database tables
Run this once to initialise the database
"""
from app.database import engine, Base
from app.models import Conversation

# Import all models here so Base knows about them (Conversation is already imported above)

def create_tables():
    """Create all tables in the database"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")

if __name__ == "__main__":
    create_tables()