'use client';
import { useState, useEffect } from 'react';
import { Message } from './types';

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

  /**
   * Set mounted flag after component loads on client
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * Handles sending a new message
   */
  const handleSend = () => {
    if (input.trim() === '') return; // Don't send empty messages

    // Create new user message
    const newMessage: Message = {
      id: Date.now().toString(), // Simple ID using timestamp
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add message to the list
    setMessages([...messages, newMessage]);

    // Clear input
    setInput('');

    // TODO: Later we'll call the AI API here
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

  return (
    <div className='flex flex-col h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm p-4 border-b border-gray-200'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-2xl font-bold text-gray-800'>
            AI Knowledge Base Chat
          </h1>
          <p className='text-sm text-gray-600'>
            Ask questions about our knowledge base
          </p>
        </div>
      </header>

      {/* Messages Area - Centered with max width */}
      <div className='flex-1 overflow-y-auto p-4'>
        <div className='max-w-4xl mx-auto space-y-4'>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.sender === 'assistant'
                    ? 'bg-white text-gray-800 shadow'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <p className='text-sm'>{message.text}</p>
                {isMounted && (
                  <span className='text-xs opacity-70 mt-1 block'>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          ))}
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
