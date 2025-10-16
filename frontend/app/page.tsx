'use client';
import { useState, useEffect, useRef } from 'react';
import { Message } from './types';
import ChatMessage from './components/ChatMessage';

/**
 * Home page component - Main chat interface
 */
export default function Home() {
  /** State to store all chat messages */
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);

  /** State to store the current input text */
  const [input, setInput] = useState('');

  /** Track if component has mounted (client-side only) */
  const [isMounted, setIsMounted] = useState(false);

  /** Track if AI is currently generating a response */
  const [isLoading, setIsLoading] = useState(false);

  /** Reference to the messages container for auto-scrolling */
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Set mounted flag after component loads on client
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * Scroll to bottom whenever messages change or loading state changes
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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

    // Simulate AI response (later this will be a real API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'This is a mock response. When we connect the RAG backend, real AI responses will appear here!',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000); // 2 second delay to simulate API call

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
    <div className='flex flex-col h-screen bg-gray-50'>
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
          <button
            onClick={handleClearChat}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
          >
            Clear Chat
          </button>
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
            className='bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium'
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
