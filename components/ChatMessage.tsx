
import React from 'react';
import { Message } from '../types';
import { UserIcon, BotIcon, HudLoaderIcon } from './icons';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center justify-center p-2">
        <HudLoaderIcon className="h-6 w-6 text-blue-300 animate-spin" />
    </div>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex items-start gap-3 animate-fadeIn ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center border-2 border-blue-500/50">
          <BotIcon className="h-5 w-5 text-blue-300" />
        </div>
      )}
      <div
        className={`max-w-md lg:max-w-lg px-4 py-3 rounded-xl shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-br-none'
            : 'bg-gray-700/80 text-gray-200 rounded-bl-none'
        }`}
      >
        {isLoading ? <LoadingIndicator /> : (
             <p className="text-sm break-words">{message.text}</p>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
          <UserIcon className="h-5 w-5 text-gray-300" />
        </div>
      )}
    </div>
  );
};
