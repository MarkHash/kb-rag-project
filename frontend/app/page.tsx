'use client';
import { useState, useEffect, useRef } from 'react';
import { Message, Source } from './types';
import ChatMessage from './components/ChatMessage';
import { UserButton, useUser } from '@clerk/nextjs';
import { sendChatMessage, saveConversation, updateConversation, getUserConversations, deleteConversation, Conversation } from './api/client';
import ConversationList from './components/ConversationList';

/**
 * Home page component - Main chat interface
 */
export default function Home() {
  /** State to store all chat messages */
  const [messages, setMessages] = useState<Message[]>([]);

  /** Get current user from Clerk */
  const { user, isLoaded } = useUser();

  /** State to store the current input text */
  const [input, setInput] = useState('');

  /** Track if component has mounted (client-side only) */
  const [isMounted, setIsMounted] = useState(false);

  /** Track if AI is currently generating a response */
  const [isLoading, setIsLoading] = useState(false);

  /** Track the current conversation ID in the database */
  const [conversationId, setConversationId] = useState<number | null>(null);

  /** Track if we're currently loading data to prevent saving during load */
  const [isLoadingData, setIsLoadingData] = useState(false);

  /** Track if we're currently creating a new conversation to prevent duplicates */
  const [isCreating, setIsCreating] = useState(false);

  /** Reference to the messages container for auto-scrolling */
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /** Store all user conversations for the sidebar */
  const [conversations, setConversations] = useState<Conversation[]>([]);

  /**
   * Set mounted flag after component loads on client
   */
  useEffect(() => {
    setIsMounted(true);

    const loadConversations = async () => {
      if (isLoaded && user) {
        setIsLoadingData(true);
        try {
          const loadConversations = await getUserConversations(user.id);
          setConversations(loadConversations); // Store all conversations for sidebar

          // Find the most recent conversation with user messages
          const conversationWithMessages = loadConversations.find(conv =>
            conv.messages.some((msg: { sender: string }) => msg.sender === 'user')
          );

          if (conversationWithMessages) {
            setConversationId(conversationWithMessages.id);
            const messagesWithDates = conversationWithMessages.messages.map((msg: { id: string; text: string; sender: string; timestamp: string; sources?: Source[] }) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
              sender: msg.sender as 'user' | 'assistant' | 'system',
            }));
            setMessages(messagesWithDates);
            setIsLoadingData(false);
          } else {
            // No conversations found - show welcome message
            setMessages([
               {
                id: '1',
                text: 'Hello! How can I help you today?',
                sender: 'assistant',
                timestamp: new Date(),
              },
            ]);
            setIsLoadingData(false);
          }
        } catch (error) {
        console.error('Failed to load conversations:', error);
          setIsLoadingData(false);
        }
      }
    }
    loadConversations();
  }, [isLoaded, user]);

  /**
   * Scroll to bottom whenever messages change or loading state changes
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  /**
   * Save messages to database whenever they change
   * This ensures conversation persists across page refreshes
   */
  useEffect(() => {
    const saveToDataBase = async () => {
      // Don't save if not ready
      if (!isMounted || !isLoaded || !user || messages.length === 0) {
        return;
      }

      // Only save if conversation exists OR we have user messages (not just welcome)
      const hasUserMessages = messages.some(m => m.sender === 'user');
      if (!conversationId && !hasUserMessages) {
        return;
      }

      // Prevent duplicate conversation creation
      if (!conversationId && isCreating) {
        return;
      }

      try {
        if (conversationId) {
          // Update existing conversation
          await updateConversation(conversationId, user.id, messages);
        } else {
          // Create new conversation (first user message)
          setIsCreating(true);
          const newConversation = await saveConversation(user.id, messages);
          setConversationId(newConversation.id);
          setIsCreating(false);
        }
        // Refresh sidebar to show updated conversation list
        await refreshConversations();
      } catch (error) {
        console.error('Failed to save conversation:', error);
        setIsCreating(false);
      }
    };
    saveToDataBase();
  }, [messages, isMounted, isLoaded, user, conversationId, isLoadingData, isCreating]);

  /**
   * Clears all messages and resets to initial state
   */
  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        text: 'Hello! How can I help you today?',
        sender: 'assistant',
        timestamp: new Date(),
      },
    ]);
    setInput(''); // Clear any text in input

    // Set conversationId back to null
    setConversationId(null);
  };

  /**
   * Load a specific conversation when clicked in sidebar
   */
  const handleSelectConversation = async (conversationId: number) => {
    if (!user) return;

    try {
      const loadedConversations = await getUserConversations(user.id);
      const conversation = loadedConversations.find(c => c.id === conversationId);

      if (conversation) {
        setConversationId(conversation.id);
        const messagesWithDates = conversation.messages.map((msg: { id: string; text: string; sender: string; timestamp: string; sources?: Source[] }) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          sender: msg.sender as 'user' | 'assistant' | 'system',
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  /**
   * Delete a conversation
   */
  const handleDeleteConversation = async (conversationIdToDelete: number) => {
    if (!user) return;

    try {
      await deleteConversation(conversationIdToDelete, user.id);

      // Remove from local state
      setConversations(prev => prev.filter(c => c.id !== conversationIdToDelete));

      // If deleted conversation is current one, start new chat
      if (conversationId === conversationIdToDelete) {
        handleClearChat();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  /**
   * Refresh conversations list after creating/updating
   */
  const refreshConversations = async () => {
    if (!user) return;

    try {
      const loadedConversations = await getUserConversations(user.id);
      setConversations(loadedConversations);
    } catch (error) {
      console.error('Failed to refresh conversations:', error);
    }
  };

  /**
   * Handles sending a new message
   */
  const handleSend = async () => {
    if (input.trim() === '') return; // Don't send empty messages
    if (isLoading) return;

    // Create new user message
    const newMessage: Message = {
      id: Date.now().toString(), // Simple ID using timestamp
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add user message to the list
    setMessages((prev) => [...prev, newMessage]);

    // Clear input
    setInput('');

    // Set loading state
    setIsLoading(true);

    try {
      // Call backend API
      const response = await sendChatMessage(newMessage.text);

      // Create AI response message
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.answer,
        sender: 'assistant',
        timestamp: new Date(),
        sources: response.sources,
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      // Handle error = show error message to user
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error connecting to the server. Please make sure the backend is running.',
        sender: 'system',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      console.error('Chat error:', error);
    } finally {
      // Always stop loading, whether success or error
      setIsLoading(false);
    }
  };

  /**
   * Handles Enter key press to send message
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Scrolls to the bottom of the messages container
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth'});
  };

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar - Conversation List */}
      {isLoaded && user && (
        <ConversationList
          conversations={conversations}
          currentConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onNewChat={handleClearChat}
          />
      )}

      {/* Main Chat Area */}
      <div className='flex flex-col flex-1'>
      {/* Header */}
      <header className='bg-white shadow-sm p-4 border-b border-gray-200'>
        <div className='max-w-4xl mx-auto flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-800'>
              AI Knowledge Base Chat
            </h1>
            <p className='text-sm text-gray-600'>
              Ask questions about our knowledge base
            </p>
          </div>

          <div className='flex items-center gap-3'>
            {/* Show user greeting when loaded */}
            {isLoaded && user && (
              <p className='text-sm text-gray-600'>
                Hello, {user.firstName || user.emailAddresses[0].emailAddress}
              </p>
            )}
          
            <button
              onClick={handleClearChat}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
            >
              Clear Chat
            </button>

            {/* Clerk's pre-built user button with avatar & sign out */}
            <UserButton />
          </div>
        </div>
      </header>

      {/* Messages Area - Centered with max width */}
      <div className='flex-1 overflow-y-auto p-4'>
        <div className='max-w-4xl mx-auto space-y-4'>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} isMounted={isMounted} />
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className='flex justify-start'>
              <div className='bg-white text-gray-800 shadow rounded-lg p-3 max-w-[70%]'>
                <div className='flex items-center gap-2'>
                  <div className='flex gap-1'>
                    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '0ms' }}></div>
                    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '150ms' }}></div>
                    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className='text-sm text-gray-600'>AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          {/* Invisible element at the bottom for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Centered with max width */}
      <div className='bg-white border-t border-gray-200 p-4'>
        <div className='max-w-4xl mx-auto flex gap-2'>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder='Type your question...'
            className='flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg transition-colors font-medium ${
              isLoading
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' // Disabled Style
                : 'bg-blue-500 text-white hover:bg-blue-600' // Normal style
              }`}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
