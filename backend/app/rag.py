"""
RAG (Retrieval Augmented Generation) Pipeline
Handles embeddings, vector search, and LLM generation
"""

import chromadb
from sentence_transformers import SentenceTransformer
from groq import Groq
import os
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()


class RAGSystem:
    """RAG system combining embeddings, vector search, and LLM"""
    def __init__(self, collection_name: str = "knowledge_base"):
        """Initialise the RAG system"""
        print("🚀 Initializing RAG system...")

        # Load embedding model (converts text to 384-dimensional vectors)
        # all-MiniLM-L6-v2: small, fast, good for semantic search
        print("📥 Loading embedding model...")
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

        # Initialise ChromaDB (Vector database)
        print("🗄️  Setting up ChromaDB...")
        self.chroma_client = chromadb.Client()

        # Create or get collection (like a table in SQL)
        self.collection = self.chroma_client.get_or_create_collection(
            name=collection_name,
            metadata={"description": "Customer support knowledge base"}
        )

        # Initialise Groq client
        print("🤖 Connecting to Groq...")
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

        print("✅ RAG system ready!")

    def index_articles(self, articles: List[Dict]):
        """
        Convert articles to embeddings and store in vector database
        Args:
            articles: List of articles dicts with id, title, content, category, tags
        """
        print(f"📚 Indexing {len(articles)} articles...")

        # Extract article IDs
        ids = [article['id'] for article in articles]

        # Combine title + content for better search results
        # (title gives context, content has the details)
        documents = [f"{article['title']}\n\n{article['content']}" for article in articles]

        # Store metadata (ChromaDB doesn't support lists, so convert tags to string)
        metadatas = [
            {
                'title': article['title'],
                'category': article['category'],
                'tags': ','.join(article['tags'])
            }
            for article in articles
            ]

        # Generate embeddings for all documents
        # This converts each article into a 384-number vector
        print("🔢 Generating embeddings...")
        embeddings = self.embedding_model.encode(documents).tolist()

        # Store everything in ChromaDB
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )

        print(f"✅ Indexed {len(articles)} articles successfully!")

    def search_relevant_articles(self, query: str, n_results: int = 3) -> List[Dict]:
        """
        Search for articles most relevant to the query using vector similarity
        Args:
            query: User's question
            n_results: Number of top results to return (default 3)
        Returns:
            List of relevant articles with metadata
        """
        # Convert user's question to embedding (same 384-dimensional vector)
        query_embedding = self.embedding_model.encode(query).tolist()

        # Search ChromaDB for similar embeddings
        # This uses cosine similarity to find closest matches
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )

        # Format results into a clean list of dicts
        relevant_articles = []
        for i in range(len(results['ids'][0])):
            relevant_articles.append({
                'id': results['ids'][0][i],
                'content': results['documents'][0][i],
                'title': results['metadatas'][0][i]['title'],
                'category': results['metadatas'][0][i]['category'],
                'tags': results['metadatas'][0][i]['tags'].split(','),
                'distance': results['distances'][0][i] if 'distances' in results else None
            })

        return relevant_articles
        
    def generate_answer(self, query: str, relevant_articles: List[Dict]) -> str:
        """
        Generate an answer using Ollama LLM based on retrieved articles
        Args:
            query: User's question
            relevant_articles: List of relevant articles from vector search
        Returns:
            generated answer string
        """
        # Build context from relevant articles
        # This creates a string with all the article content
        context = "\n\n".join([
            f"Article: {article['title']} \n{article['content']}"
            for article in relevant_articles
        ])

        # Create prompt for LLM (prompt engineering)
        # This tells the LLM how to behave and what to do
        prompt = f"""You are a helpful customer support assistant.
        Answer the user's question based on the following knowledge base articles.
        Knowledge Base Articles: {context}
        User question: {query}
        Instructions:
        - Answer based ONLY on the information in the articles above
        - If the articles don't contain relevant information, say "I don't have information about that in my knowledge base"
        - Be concise and helpful
        - Cite which article(s) you used if relevant

        Answer:"""

        # Call Groq to generate response
        response = self.groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful customer support assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        return response.choices[0].message.content

    def query(self, user_question: str, n_results: int = 3) -> Dict:
        """
        Complete RAG pipeline: search + generate
        Args:
            user_question: User's question
            n_results: Number of articles to retrieve (default 3)
        Returns:
            Dictionary with 'answer' and 'sources'
        """
        # Step 1: Find relevant articles using vector search
        relevant_articles = self.search_relevant_articles(user_question, n_results)

        # Step 2: Generate answer using LLM with the retrieved context
        answer = self.generate_answer(user_question, relevant_articles)

        return {
            'answer': answer,
            'sources': relevant_articles
        }