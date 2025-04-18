// components/PublicModelsList.tsx
'use client';

import { useEffect, useState } from 'react';
import { baseSepolia } from 'viem/chains';
import CloneNFTAbi from '@/artifacts/contracts/CloneNFT.sol/CloneNFT.json';
import { createPublicClient, http, type Address } from 'viem';

type PublicModel = {
  tokenId: string;
  owner: string;
  metadataURI: string;
  modelName: string;
  role: string;
  timestamp: string;
};

// Replace with your actual contract address
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;

export default function PublicModelsList() {
  const [publicModels, setPublicModels] = useState<PublicModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create public client for baseSepolia
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http()
  });

  useEffect(() => {
    const fetchPublicModels = async () => {
      try {
        setLoading(true);
        setError('');

        // Get total supply of NFTs
        const totalSupply = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CloneNFTAbi.abi,
          functionName: 'totalSupply',
        }) as bigint;

        const models: PublicModel[] = [];

        // Iterate through all tokens
        for (let i = 0; i < Number(totalSupply); i++) {
          try {
            // Get token ID by index
            const tokenId = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: CloneNFTAbi.abi,
              functionName: 'tokenByIndex',
              args: [BigInt(i)],
            }) as bigint;

            // Get owner and metadata URI
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

            // Fetch metadata
            const response = await fetch(metadataURI);
            const metadata = await response.json() as {
              modelName: string;
              role: string;
              visibility: string;
              timestamp: string;
            };

            // Filter public models
            if (metadata.visibility === 'Public') {
              models.push({
                tokenId: tokenId.toString(),
                owner: owner.toString(),
                metadataURI: metadataURI,
                modelName: metadata.modelName,
                role: metadata.role,
                timestamp: metadata.timestamp,
              });
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
  }, []); // Runs once on component mount

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Public AI Models</h1>
      
      {loading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading models...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicModels.map((model) => (
            <div 
              key={model.tokenId}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{model.modelName}</h2>
              <p className="text-gray-600 mb-4 line-clamp-3">{model.role}</p>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Owner:</span>
                  <span className="ml-2 text-gray-700">
                    {model.owner.slice(0, 6)}...{model.owner.slice(-4)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <span className="ml-2 text-gray-700">
                    {new Date(model.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <a
                href={model.metadataURI}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-blue-600 hover:underline"
              >
                View Metadata →
              </a>
            </div>
          ))}
        </div>
      )}

      {!loading && publicModels.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No public models available
        </div>
      )}
    </div>
  );
}