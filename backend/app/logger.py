"""
Logging configuration for the applicaton
"""
import logging
import sys

# Configure logging format
logging.basicConfig(
    level=logging.INFO,
    format='%(ascrime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Create logger for the app
logger = logging.getLogger("kb-rag-api")