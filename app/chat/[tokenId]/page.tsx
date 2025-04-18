'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';

interface ChatMetadata {
  modelName: string;
  role: string;
  textSample: string;
}

export default function ChatPage({ params }: { params: { tokenId: string } }) {
  const searchParams = useSearchParams();
  const metadataUrl = searchParams.get('metadata');
  const [metadata, setMetadata] = useState<ChatMetadata | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch(decodeURIComponent(metadataUrl || ''));
        const data: ChatMetadata = await response.json();
        setMetadata(data);
      } catch (error) {
        console.error('Error loading metadata:', error);
      }
    };
    if (metadataUrl) fetchMetadata();
  }, [metadataUrl]);

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

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Please ask me about ' + metadata.role 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!metadata) return <div>Loading AI clone...</div>;

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        <h1>{metadata.modelName}</h1>
        <p>{metadata.role} Specialist</p>
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
        {isLoading && <div className={styles.loading}>Processing...</div>}
      </div>

      <form className={styles.chatForm} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.chatInput}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask about ${metadata.role}`}
          required
        />
        <button type="submit" className={styles.submitButton}>
          Send
        </button>
      </form>
    </div>
  );
}