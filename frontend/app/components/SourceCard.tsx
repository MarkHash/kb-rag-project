'use client';
import { useState } from 'react';
import { Source } from '../types';

/**
 * Props for SourceCard component
 */
interface SourceCardProps {
    /** Source article to display */
    source: Source;
}

/**
 * SourceCard Component - Displays a single source citation
 * Expandable to show full article content
 */
export default function SourceCard({ source }: SourceCardProps) {
    /** Track if card is expanded */
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors'>
            {/* Clickable header */}
            <div className='cursor-pointer' onClick={() => setIsExpanded(!isExpanded)}>
                <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                        {/* Article title */}
                        <h4 className='font-semibold text-sm text-gray-800 mb-1'>
                            {source.title}
                        </h4>

                        {/* Category badge */}
                        <div className='flex items-center gap-2 mb-2'>
                            <span className='text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded'>
                                {source.category}
                            </span>
                        </div>

                        {/* Tags */}
                        {source.tags && source.tags.length > 0 && (
                            <div className='flex flex-wrap gap-1'>
                                {source.tags.map((tag, index) => (
                                    <span key={index} className='text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded'>
                                        {tag}
                                    </span>
                            ))}
                            </div>
                        )}
                    </div>

                    {/* Expand/collapse icon */}
                    <div className='ml-2 text-gray-500'>
                        {isExpanded ? (
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 15l7-7 7 7' />
                        </svg>
                        ) : (
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                            </svg>
                        )}
                    </div>
            </div>
        </div>

        {/* Expandable content */}
        {isExpanded && (
            <div className='mt-3 pt-3 border-t border-gray-300'>
                <p className='text-xs text-gray-700 whitespace-pre-wrap'>
                    {source.content}
                </p>
            </div>
        )}
        </div>
    );
}