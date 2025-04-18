// app/chat/[tokenId]/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

interface ChatMetadata {
  modelName: string;
  role: string;
  textSample: string;
  visibility: string;
  timestamp: string;
}

export default function ChatPage({ params }: { params: { tokenId: string } }) {
  const searchParams = useSearchParams();
  const metadataUrl = searchParams.get('metadata');
  const [metadata, setMetadata] = useState<ChatMetadata | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        if (!metadataUrl) throw new Error('No metadata URL provided');
        
        const response = await fetch(decodeURIComponent(metadataUrl));
        if (!response.ok) throw new Error('Failed to fetch metadata');
        
        const data: ChatMetadata = await response.json();
        setMetadata(data);
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    };

    fetchMetadata();
  }, [metadataUrl]);

  // Scroll to bottom when messages change
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
      
      // Create conversation history with system prompt
      const chatHistory = [
        {
          role: 'system',
          content: `You are an AI clone twin named ${metadata.modelName}. 
          Your role is: ${metadata.role}. 
          Your knowledge base: ${metadata.textSample}.
          Always respond as the AI clone twin maintaining its characteristics.`
        },
        ...messages,
        { role: 'user', content: newMessage }
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: chatHistory,
          metadata: {
            modelName: metadata.modelName,
            role: metadata.role,
            textSample: metadata.textSample
          }
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!metadata) return <div className="p-4">Loading AI clone...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 h-screen flex flex-col">
      <div className="border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold">Chat with {metadata.modelName}</h1>
        <p className="text-gray-600">Role: {metadata.role}</p>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`p-4 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}>
            {msg.content}
          </div>
        ))}
        {isLoading && <div className="p-4 bg-gray-100 rounded-lg">Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
}