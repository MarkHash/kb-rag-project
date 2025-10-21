// types.ts
// This file defines the TypeScript types for our chat application

/**
 * Represents a single message in the chat
 */
export type Message = {
  /** Unique identifier for the message */
  id: string;

  /** The actual message content */
  text: string;

  /** Who sent the message: user, AI assistant, or system */
  sender: 'user' | 'assistant' | 'system';

  /** When the message was sent */
  timestamp: Date;

  /** Source articles used to generate the answer (assistant messages only) */
  sources?: Source[];
};

/**
 * Represents the source/citation for an AI response (matches backend)
 */
export type Source = {
  /** Unique identifier for the article */
  id: string;

  /** Title of the article */
  title: string;

  /** Full content of the article */
  content: string;

  /** Category of the article */
  category: string;

  /** Tags for the article */
  tags: string[];
};

/**
 * Represents an AI response with its sources
 */
export type ChatResponse = {
  /** The AI assistant's answer */
  answer: string;

  /** Array of source articles used to generate the answer */
  sources: Source[];

  /** Unique ID to track the conversation */
  conversationId: string;
};

