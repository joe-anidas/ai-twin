// components/CloneCard.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/dashboard/[address]/Dashboard.module.css';
import { type Address } from 'viem';

interface CloneMetadata {
  modelName?: string;
  role?: string;
  visibility?: string;
  timestamp?: string;
  textSample?: string;
}

interface CloneCardProps {
  clone: { tokenId: bigint; metadata: string };
  contractAddress?: Address;
}

export default function CloneCard({ clone, contractAddress }: CloneCardProps) {
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
        
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Invalid metadata format');
        }

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
    if (!cloneData) return;
    
    try {
      const encodedMetadata = encodeURIComponent(JSON.stringify({
        modelName: cloneData.modelName,
        role: cloneData.role,
        textSample: cloneData.textSample,
        timestamp: cloneData.timestamp
      }));
      
      router.push(`/chat/${clone.tokenId.toString()}?metadata=${encodedMetadata}`);
    } catch (error) {
      console.error('Error encoding metadata:', error);
      setError('Failed to start chat session');
    }
  };

  const handleViewInExplorer = () => {
    if (!contractAddress) return;
    const explorerUrl = `https://sepolia.basescan.org/nft/${contractAddress}/${clone.tokenId.toString()}`;
    window.open(explorerUrl, '_blank');
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
          
          <div className={styles.buttonGroup}>
            <button
              onClick={handleChatClick}
              className={styles.primaryButton}
              disabled={isLoading || error !== null || !cloneData}
            >
              {isLoading ? 'Loading...' : 'Chat with Model'}
            </button>
            
            <button
              onClick={handleViewInExplorer}
              className={styles.secondaryButton}
              disabled={!contractAddress}
              title={!contractAddress ? "Contract address not available" : "View on BaseScan"}
            >
              View in Explorer
            </button>
          </div>
        </>
      )}
    </div>
  );
}