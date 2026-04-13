
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { ChatMessage } from './ChatMessage';
import { SendIcon } from './icons';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col bg-black/20 backdrop-blur-md rounded-xl border border-blue-500/20 shadow-2xl shadow-blue-500/10 h-full max-h-[calc(100vh-8rem)]">
      <div className="p-4 border-b border-blue-500/20 text-lg font-semibold text-gray-200">
          Conversation Simulation
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4 [scrollbar-width:thin] [scrollbar-color:#3b82f6_#1f2937]">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && <ChatMessage message={{ sender: 'agent', text: '...' }} isLoading={true} />}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-blue-500/20">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type scammer message here..."
            className="flex-1 p-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 text-gray-100 placeholder-gray-500 focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 bg-blue-600 rounded-lg hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 animate-pulse-glow"
            aria-label="Send Message"
          >
            <SendIcon className="h-6 w-6 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};
