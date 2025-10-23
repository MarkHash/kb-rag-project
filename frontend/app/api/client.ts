/**
 * API client for backend communication
 */


/** Base URL for backend API - uses environment variable or falls back to localhost */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Send a chat query to the backend
 */
export async function sendChatMessage(query: string): Promise<{
    answer: string;
    sources: Array<{
        id: string;
        title: string;
        content: string;
        category: string;
        tags: string[];
    }>;
}> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Get all knowledge base articles
 */
export async function getAllArticles() {
    const response = await fetch(`${API_BASE_URL}/articles`);

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
}