/**
 * API client for backend communication
 */

import { Message } from './types';

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

/**
 * Conversation type matching backend model
 */
export interface Conversation {
    id: number;
    user_id: string;
    messages: Array<{
        id: string;
        text: string;
        sender: string;
        timestamp: string;
        sources?: Array<{
            id: string;
            title: string;
            content: string;
            category: string;
            tags: string[];
        }>;
    }>;
    title: string | null;
    created_at: string;
    updated_at: string | null;
}


/**
 * Save a conversation to the database
 */
export async function saveConversation(
    userId: string,
    messages: Message[]
): Promise<Conversation> {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
            messages: messages,
            title: null, // Auto-generate later or use first message
        }),
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Update an existing conversation
 */
export async function updateConversation(
    conversationId: number,
    userId: string,
    messages: Message[]
): Promise<Conversation> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
            messages: messages,
        }),
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: string):
Promise<Conversation[]> {
    const response = await fetch(`${API_BASE_URL}/conversations/${userId}`);

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
}

/**
 * Get a specific conversation
 */
export async function getConversation(
    userId: string,
    conversationId: number
): Promise<Conversation> {
    const response = await fetch(`${API_BASE_URL}/conversations/${userId}/${conversationId}`);
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}