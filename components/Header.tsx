
import React from 'react';
import { ShieldCheckIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-blue-500/20 p-4 shadow-2xl shadow-blue-500/5">
      <div className="container mx-auto flex items-center gap-4">
        <ShieldCheckIcon className="h-9 w-9 text-blue-400 animate-pulse" />
        <div>
            <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-white to-blue-300 text-transparent bg-clip-text">
                Agentic Honey-Pot
            </h1>
            <p className="text-xs text-gray-400">AI for Fraud Detection & Intelligence Extraction</p>
        </div>
      </div>
    </header>
  );
};
