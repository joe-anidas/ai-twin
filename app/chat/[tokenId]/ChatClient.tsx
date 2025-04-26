'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowPathIcon, ArrowUpCircleIcon } from '@heroicons/react/24/solid';
import { useContract } from "@/context/ContractContext";

interface ChatMetadata {
  modelName: string;
  role: string;
  textSample: string;
  timestamp: string;
}

export default function ChatClient() {
  const searchParams = useSearchParams();
  const { account } = useContract();
  const [metadata, setMetadata] = useState<ChatMetadata | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Validate metadata structure
  const isValidMetadata = (data: any): data is ChatMetadata => {
    return (
      typeof data === 'object' &&
      data !== null &&
      'modelName' in data &&
      'role' in data &&
      'textSample' in data &&
      'timestamp' in data
    );
  };

  useEffect(() => {
    const encodedMetadata = searchParams.get('metadata');
    if (encodedMetadata) {
      try {
        const decodedMetadata = decodeURIComponent(encodedMetadata);
        const parsedMetadata = JSON.parse(decodedMetadata);

        if (!isValidMetadata(parsedMetadata)) {  
          throw new Error('Invalid metadata format');  
        }  

        setMetadata(parsedMetadata);  
      } catch (err) {  
        console.error('Error parsing metadata:', err);  
        setError('Invalid chat configuration. Please create a new AI twin.');  
      }  
    }
  }, [searchParams]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !metadata) return;

    const newMessage = inputMessage;  
    setInputMessage('');  
    setMessages(prev => [...prev, { role: 'user', content: newMessage }]);  

    try {  
      setIsLoading(true);  

      const response = await fetch('/api/chat', {  
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({  
          messages: [  
            ...messages,  
            { role: 'user', content: newMessage }  
          ],  
          metadata: {  
            modelName: metadata.modelName,  
            role: metadata.role,  
            textSample: metadata.textSample  
          }
        }),  
      });  

      if (!response.ok) {  
        const errorData = await response.json();  
        throw new Error(errorData.error || 'Failed to get response');  
      }  

      const data = await response.json();  
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);  
    } catch (error) {  
      setMessages(prev => [...prev, {   
        role: 'assistant',   
        content: error instanceof Error ?   
          `Error: ${error.message}` :   
          `Sorry, I can't respond right now. Please ask me about ${metadata.role}`  
      }]);  
    } finally {  
      setIsLoading(false);  
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="max-w-2xl w-full bg-red-900/30 rounded-xl p-8 border border-red-800/50">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Quantum Flux Detected</h2>
          <p className="text-red-300">{error}</p>
          <Link
            href={account?.address ? `/dashboard/${account.address}` : '/'}
            className="mt-6 inline-flex items-center px-6 py-3 bg-red-600/30 hover:bg-red-600/40 border border-red-700/50 rounded-lg text-red-200 transition-all duration-200"
          >
            Recalibrate Dimensions
          </Link>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 space-y-6">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-300 text-lg">Initializing quantum entanglement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Groq Certification Badge */}
      <div className="hidden sm:fixed sm:bottom-4 sm:right-4 z-50 sm:flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-600 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border border-white/10 hover:shadow-xl transition-all">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <span className="text-white font-medium text-sm">Speed Certified by Groq</span>
      </div>

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-10 border-b border-gray-700/50 bg-gradient-to-r from-gray-900 via-gray-900/80 to-gray-900">
        <div className="max-w-4xl mx-auto p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href={account?.address ? `/dashboard/${account.address}` : '/'}
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                  />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-100 truncate">
                {metadata.modelName}
              </h1>
            </div>
            <span className="px-3 py-1 text-sm font-medium text-indigo-400 bg-indigo-900/30 rounded-full backdrop-blur-sm">
              {metadata.role}
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Created: {new Date(metadata.timestamp).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-36" /> {/* Adjust this value based on your header height */}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700/50 scrollbar-track-gray-900">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-indigo-600/30 border border-indigo-700/50'
                    : 'bg-gray-800/50 border border-gray-700/50'
                }`}
              >
                <p className="text-gray-100">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 text-gray-400">
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              <span>Processing quantum states...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm p-6"
      >
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask about ${metadata.role}`}
            disabled={isLoading}
            className="flex-1 px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100 placeholder-gray-500 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ArrowUpCircleIcon className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
}