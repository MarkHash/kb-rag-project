'use client';
import { Conversation } from '../api/client';

/**
 * Props for ConversationList component
 */
interface ConversationListProps {
  /** Array of all user's conversations */
  conversations: Conversation[];

  /** Currently selected conversation ID */
  currentConversationId: number | null;

  /** Callback when user clicks a conversation */
  onSelectConversation: (conversationId: number) => void;

  /** Callback when user clicks delete button */
  onDeleteConversation: (conversationId: number) => void;

  /** Callback when user clicks "New Chat" */
  onNewChat: () => void;
}

/**
 * Sidebar component showing list of conversations
 */
export default function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
}: ConversationListProps) {

  /**
   * Format timestamp to relative time (Today, Yesterday, etc.)
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays <= 7) return 'Last 7 Days';
    return 'Older';
  };

  /**
   * Group conversations by date category
   */
  const groupedConversations = conversations.reduce((groups, conv) => {
    const category = formatDate(conv.created_at); // "Today", "Yesterday", etc.
    if (!groups[category]) {
      groups[category] = [];  // Create empty array if category doesn't exist
    }
    groups[category].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  // Define order of categories
  const categoryOrder = ['Today', 'Yesterday', 'Last 7 Days', 'Older'];

  return (
    <div className='w-64 bg-gray-900 text-white flex flex-col h-screen'>
      {/* Header with New Chat button */}
      <div className='p-4 border-b border-gray-700'>
        <button
          onClick={onNewChat}
          className='w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors'
        >
          + New Chat
        </button>
      </div>

      {/* Conversation list */}
      <div className='flex-1 overflow-y-auto p-4'>
        {categoryOrder.map(category => {
          const convs = groupedConversations[category];
          if (!convs || convs.length === 0) return null;

          return (
            <div key={category} className='mb-6'>
              {/* Category header */}
              <h3 className='text-xs font-semibold text-gray-400 uppercase mb-2'>
                {category}
              </h3>

              {/* Conversations in this category */}
              <div className='space-y-1'>
                {convs.map(conv => (
                  <div
                    key={conv.id}
                    className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      currentConversationId === conv.id
                        ? 'bg-gray-700'
                        : 'hover:bg-gray-800'
                    }`}
                  >
                    {/* Conversation title - click to load */}
                    <div
                      onClick={() => onSelectConversation(conv.id)}
                      className='flex-1 truncate text-sm'
                    >
                      {conv.title || 'New Conversation'}
                    </div>

                    {/* Delete button - shows on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Don't trigger conversation select
                        if (window.confirm('Delete this conversation?')) {
                          onDeleteConversation(conv.id);
                        }
                      }}
                      className='opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-gray-600 rounded transition-opacity'
                      title='Delete conversation'
                    >
                      {/* Trash icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className='h-4 w-4 text-gray-400'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {conversations.length === 0 && (
          <div className='text-center text-gray-500 mt-8'>
            <p className='text-sm'>No conversations yet</p>
            <p className='text-xs mt-1'>Start a new chat to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}
