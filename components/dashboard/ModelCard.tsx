// components/ModelCard.tsx
import { useState, useEffect } from 'react';
import styles from '@/app/dashboard/[address]/Dashboard.module.css';

interface ModelData {
  address: string;
  modelName: string;
  textSample: string;
  role: string;
  visibility: string;
  fileUrl?: string;
  timestamp: string;
}

export default function ModelCard({
  model,
  index,
  isMinting,
  onMint
}: {
  model: string;
  index: number;
  isMinting: boolean;
  onMint: (hash: string) => void;
}) {
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModelData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(model);
        if (!response.ok) throw new Error('Failed to fetch model data');
        const data = await response.json();
        setModelData(data);
      } catch (error) {
        console.error('Error fetching model data:', error);
        setError('Failed to load model details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchModelData();
  }, [model]);

  return (
    <div className={styles.card}>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading model details...</p>
        </div>
      ) : error ? (
        <div className={styles.errorMessage}>
          ⚠️ Error loading model details
        </div>
      ) : (
        <>
          <h3>{modelData?.modelName || `Unnamed Model #${index + 1}`}</h3>
          <div className={styles.metaInfo}>
            <p>Role: {modelData?.role || 'Unknown'}</p>
            <p>Visibility: {modelData?.visibility || 'Unknown'}</p>
            <p>Created: {new Date(modelData?.timestamp || '').toLocaleDateString()}</p>
          </div>
        </>
      )}

      {/* <a 
        href={model} 
        target="_blank" 
        rel="noopener" 
        className={styles.link}
      >
        View Full Metadata
      </a> */}
      
      <button
        onClick={() => onMint(model)}
        disabled={isMinting || isLoading}
        className={styles.mintButton}
      >
        {isMinting ? "Minting..." : "Mint as NFT"}
      </button>
    </div>
  );
}