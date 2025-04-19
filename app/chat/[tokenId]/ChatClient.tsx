'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';

interface ChatMetadata {
  modelName: string;
  role: string;
  textSample: string;
  timestamp: string;
}

export default function ChatClient() {
  const searchParams = useSearchParams();
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
      <div className={styles.errorContainer}>
        <h2>Configuration Error</h2>
        <p>{error}</p>
        <a href="/dashboard" className={styles.errorLink}>
          Return to Dashboard
        </a>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Initializing AI clone...</p>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        <h1>{metadata.modelName}</h1>
        <div className={styles.metaInfo}>
          <span className={styles.roleBadge}>{metadata.role}</span>
          <span className={styles.timestamp}>
            Created: {new Date(metadata.timestamp).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
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
          <div className={styles.loadingMessage}>  
            <div className={styles.dotFlashing}></div>  
          </div>  
        )}  
        <div ref={messagesEndRef} />  
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
          aria-label="Chat input"  
        />  
        <button   
          type="submit"   
          className={styles.submitButton}  
          disabled={isLoading}  
        >  
          {isLoading ? (  
            <>  
              <span className={styles.buttonSpinner}></span>  
              Sending...  
            </>  
          ) : 'Send'}  
        </button>  
      </form>  
    </div>
  );
}