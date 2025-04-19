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

        // Sort models by timestamp descending (newest first)
        const sortedModels = models.sort((a, b) => 
          new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime()
        );

        setPublicModels(sortedModels);
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
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-12 text-center">
          🌌 Public AI Models
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-300 text-lg">Loading cosmic models...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {publicModels.map((model) => (
              <div 
                key={model.tokenId}
                className="group bg-slate-800/50 hover:bg-slate-800/70 backdrop-blur-lg rounded-2xl p-6 transition-all duration-300 ease-out hover:transform hover:scale-[1.005]"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  {/* Model Information */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-2xl font-semibold text-white">
                        {model.metadata.modelName}
                      </h2>
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-blue-200 text-sm">
                        {model.metadata.role}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-slate-300">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">
                          <UserIcon className="h-5 w-5" />
                        </span>
                        <span>
                          {model.owner.slice(0, 6)}...{model.owner.slice(-4)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">
                          <CalendarIcon className="h-5 w-5" />
                        </span>
                        <span>
                          {new Date(model.metadata.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Button */}
                  <button
                    onClick={() => handleChatNavigation(model)}
                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/20"
                  >
                    Start Chat →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && publicModels.length === 0 && (
          <div className="text-center py-24">
            <p className="text-2xl text-slate-400">
              🚀 No public models discovered yet... Be the first to launch one!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Add these icons (or use your preferred icon library)
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}