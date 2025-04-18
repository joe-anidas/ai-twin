// components/PublicModelsList.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { baseSepolia } from 'viem/chains';
import CloneNFTAbi from '@/artifacts/contracts/CloneNFT.sol/CloneNFT.json';
import { createPublicClient, http, type Address } from 'viem';
import styles from './styles/PublicModelsList.module.css';

type PublicModel = {
  tokenId: string;
  owner: string;
  metadataURI: string;
  metadata: {
    modelName: string;
    role: string;
    visibility: string;
    timestamp: string;
  };
};

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

export default function PublicModelsList() {
  const router = useRouter();
  const [publicModels, setPublicModels] = useState<PublicModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http()
  });

  const formatIPFSURI = (uri: string) => {
    if (uri.startsWith('ipfs://')) {
      return `${IPFS_GATEWAY}${uri.replace('ipfs://', '')}`;
    }
    return uri;
  };

  useEffect(() => {
    const fetchPublicModels = async () => {
      try {
        setLoading(true);
        setError('');

        const totalSupply = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CloneNFTAbi.abi,
          functionName: 'totalSupply',
        }) as bigint;

        const models: PublicModel[] = [];

        for (let i = 0; i < Number(totalSupply); i++) {
          try {
            const tokenId = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: CloneNFTAbi.abi,
              functionName: 'tokenByIndex',
              args: [BigInt(i)],
            }) as bigint;

            const [owner, metadataURI] = await Promise.all([
              publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: CloneNFTAbi.abi,
                functionName: 'ownerOf',
                args: [tokenId],
              }) as Promise<string>,
              publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: CloneNFTAbi.abi,
                functionName: 'tokenURI',
                args: [tokenId],
              }) as Promise<string>,
            ]);

            const formattedURI = formatIPFSURI(metadataURI);

            try {
              const response = await fetch(formattedURI);
              
              if (!response.ok) {
                console.error(`HTTP error for ${formattedURI}: ${response.status}`);
                continue;
              }

              const contentType = response.headers.get('content-type');
              if (!contentType?.includes('application/json')) {
                console.error(`Invalid content type for ${formattedURI}: ${contentType}`);
                continue;
              }

              const metadata = await response.json() as {
                modelName: string;
                role: string;
                visibility: string;
                timestamp: string;
              };

              if (metadata.visibility === 'Public') {
                models.push({
                  tokenId: tokenId.toString(),
                  owner: owner.toString(),
                  metadataURI: formattedURI,
                  metadata
                });
              }
            } catch (err) {
              console.error(`Error loading metadata for token ${tokenId}:`, err);
            }
          } catch (err) {
            console.error(`Error processing token ${i}:`, err);
          }
        }

        setPublicModels(models);
      } catch (err) {
        setError('Failed to load public models');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicModels();
  }, []);

  const handleChatNavigation = (model: PublicModel) => {
    try {
      const encodedMetadata = encodeURIComponent(
        JSON.stringify(model.metadata)
      );
      router.push(`/chat/${model.tokenId}?metadata=${encodedMetadata}`);
    } catch (error) {
      console.error('Error encoding metadata:', error);
      alert('Could not start chat. Please try again later.');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    // In the return statement
    <div className={styles.container}>
        <h1 className={styles.heading}>Public AI Models</h1>
        
        {loading ? (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading models...</p>
            </div>
        ) : (
            <div className={styles.grid}>
                {publicModels.map((model) => (
                    <div key={model.tokenId} className={styles.card}>
                        <h2 className={styles.modelName}>{model.metadata.modelName}</h2>
                        <p className={styles.role}>{model.metadata.role}</p>
                        
                        <div className={styles.metaContainer}>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Owner:</span>
                                <span className={styles.metaValue}>
                                    {model.owner.slice(0, 6)}...{model.owner.slice(-4)}
                                </span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Created:</span>
                                <span className={styles.metaValue}>
                                    {new Date(model.metadata.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleChatNavigation(model)}
                            className={styles.chatButton}
                        >
                            Chat with This Model
                        </button>
                    </div>
                ))}
            </div>
        )}

        {!loading && publicModels.length === 0 && (
            <div className={styles.emptyState}>
                No public models available
            </div>
        )}
    </div>
  );
}