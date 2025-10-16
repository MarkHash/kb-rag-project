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
};

/**
 * Represents the source/citation for an AI response
 */
export type Source = {
  /** Unique identifier for the article */
  id: string;

  /** Title of the article */
  title: string;

  /** Optional link to the full article */
  url?: string;
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
