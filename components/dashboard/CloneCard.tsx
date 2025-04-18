// components/CloneCard.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/dashboard/[address]/Dashboard.module.css';

interface CloneMetadata {
  modelName?: string;
  role?: string;
  visibility?: string;
  timestamp?: string;
}

export default function CloneCard({ clone }: { clone: { tokenId: bigint; metadata: string } }) {
  const router = useRouter();
  const [cloneData, setCloneData] = useState<CloneMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(clone.metadata);
        if (!response.ok) throw new Error('Failed to load metadata');
        const data = await response.json();
        setCloneData(data);
      } catch (error) {
        console.error('Error fetching clone metadata:', error);
        setError('Failed to load clone details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [clone.metadata]);

  const handleChatClick = () => {
    router.push(`/chat/${clone.tokenId.toString()}?metadata=${encodeURIComponent(clone.metadata)}`);
  };

  return (
    <div className={styles.card}>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading clone details...</p>
        </div>
      ) : error ? (
        <div className={styles.errorMessage}>
          ⚠️ Error loading clone details
        </div>
      ) : (
        <>
          <h3>{cloneData?.modelName || `Clone #${clone.tokenId.toString()}`}</h3>
          <div className={styles.metaInfo}>
            {cloneData?.role && <p>Role: {cloneData.role}</p>}
            {cloneData?.visibility && <p>Visibility: {cloneData.visibility}</p>}
            {cloneData?.timestamp && (
              <p>Created: {new Date(cloneData.timestamp).toLocaleDateString()}</p>
            )}
          </div>
        </>
      )}
      
      <button
        onClick={handleChatClick}
        className={styles.linkButton}
        disabled={isLoading || error !== null}
      >
        {isLoading ? 'Loading...' : 'Chat with Model'}
      </button>
    </div>
  );
}