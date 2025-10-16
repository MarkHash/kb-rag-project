import { Message } from '../types';

/**
 * Props for the ChatMessage component
 */
interface ChatMessageProps {
    /** The message data to display */
    message: Message;

    /** Whether the component has mounted on client (for timestamps) */
    isMounted: boolean;
}

/**
 * ChatMessage Component - Display a single chat message
 * 
 * Handles different styling for user, assistant, and system messages
 */
export default function ChatMessage({ message, isMounted }: ChatMessageProps) {
    return (
        <div className={`flex ${
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
    );
}