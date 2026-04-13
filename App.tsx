
// FIX: Corrected the React import statement to properly import hooks.
import React, { useCallback, useEffect, useState } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { AnalysisPanel } from './components/AnalysisPanel';
import { Header } from './components/Header';
import { Message, AnalysisResult } from './types';
import { getAgentResponse } from './services/geminiService';
import { initBackgroundAnimation } from './utils/backgroundAnimation';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'agent',
      text: "Hello. I am the Agentic Honey-Pot. Send a message to begin the simulation. I will analyze it for scam intent and report my findings.",
    },
  ]);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = document.getElementById('background-canvas') as HTMLCanvasElement;
    if (canvas) {
      const cleanup = initBackgroundAnimation(canvas);
      return cleanup; // Return the cleanup function to stop animation on component unmount
    }
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { sender: 'user', text };
    // On the first user message of a new conversation, reset the analysis history
    const isNewConversation = messages.filter(m => m.sender === 'user').length === 0;
    if (isNewConversation) {
        setAnalysisHistory([]);
    }

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAgentResponse(newMessages);
      if (result) {
        setMessages(prev => [...prev, { sender: 'agent', text: result.reply }]);
        setAnalysisHistory(prev => [...prev, result.analysis]);
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      setMessages(prev => [...prev, { sender: 'agent', text: "I'm sorry, I encountered a problem trying to respond. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen font-sans">
      <Header />
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 overflow-hidden">
        <div className="lg:col-span-2 h-full">
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
        </div>
        <div className="lg:col-span-3 h-full">
            <AnalysisPanel analysisHistory={analysisHistory} isLoading={isLoading} error={error} />
        </div>
      </main>
    </div>
  );
};

export default App;
