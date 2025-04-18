'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';

interface ChatMetadata {
  modelName: string;
  role: string;
  textSample: string;
  timestamp: string;
}

export default function ChatPage({ params }: { params: { tokenId: string } }) {
  const searchParams = useSearchParams();
  const [metadata, setMetadata] = useState<ChatMetadata | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const encodedMetadata = searchParams.get('metadata');
    if (encodedMetadata) {
      try {
        const decodedMetadata = decodeURIComponent(encodedMetadata);
        const parsedMetadata = JSON.parse(decodedMetadata);
        setMetadata(parsedMetadata);
      } catch (err) {
        console.error('Error parsing metadata:', err);
        setError('Invalid chat configuration. Please try again.');
      }
    }
  }, [searchParams]);

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
          messages: [{ role: 'user', content: newMessage }],
          metadata: {
            modelName: metadata.modelName,
            role: metadata.role,
            textSample: metadata.textSample
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I can't respond right now. Please ask me about ${metadata.role}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading AI clone...</p>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        <h1>{metadata.modelName}</h1>
        <p>{metadata.role} Specialist</p>
        <p className={styles.timestamp}>
          Created: {new Date(metadata.timestamp).toLocaleDateString()}
        </p>
      </header>

      <div className={styles.messageArea}>
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`${styles.message} ${
              msg.role === 'user' ? styles.messageUser : styles.messageAssistant
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.dotFlashing}></div>
          </div>
        )}
      </div>

      <form className={styles.chatForm} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.chatInput}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask about ${metadata.role}`}
          required
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}