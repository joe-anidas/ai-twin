import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserIcon, CalendarIcon, EyeIcon } from '@heroicons/react/24/outline';
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
    <div className="bg-gray-900 hover:bg-gray-800 rounded-xl p-6 transition-all duration-300 group ring-1 ring-gray-700/50 hover:ring-2 hover:ring-indigo-500/20">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-6">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-300 text-lg">Initializing neural interface...</p>
        </div>
      ) : error ? (
        <div className="text-pink-400 text-sm text-center p-4">
          ⚠️ Neural link connection failed
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-100 truncate">
              {cloneData?.modelName || `AI Clone #${clone.tokenId.toString()}`}
            </h2>
            <span className="px-2 py-1 text-xs font-medium text-indigo-400 bg-indigo-900/30 rounded-full backdrop-blur-sm">
              {cloneData?.role || 'Unknown protocol'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <EyeIcon className="h-4 w-4 text-indigo-400" />
              <span className="text-gray-300 text-sm">
                {cloneData?.visibility || 'Classified'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-indigo-400" />
              <span className="text-gray-300 text-sm">
                {cloneData?.timestamp ? 
                  new Date(cloneData.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 
                  'Timeless construct'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleChatClick}
              disabled={isLoading || error !== null || !cloneData}
              className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-gray-100 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-indigo-500/20 relative overflow-hidden"
            >
              <span className="relative z-10">
                {isLoading ? 'Decrypting interface...' : 'Initiate AI Dialogue'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20" />
            </button>

            <button
              onClick={handleViewInExplorer}
              disabled={!contractAddress}
              className="w-full px-4 py-2 border border-indigo-600/50 hover:border-indigo-500 text-indigo-400 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium hover:bg-indigo-900/20 relative overflow-hidden"
              title={!contractAddress ? "Contract address not available" : "View on BaseScan"}
            >
              <span className="relative z-10">Blockchain Explorer</span>
            </button>
          </div>

          {/* <p className="text-center text-xs text-indigo-400/80 mt-2 font-space">
            ⚡ Powered by Base L2 Protocol
          </p> */}
        </div>
      )}
    </div>
  );
}