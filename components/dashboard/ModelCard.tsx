import { useState, useEffect } from 'react';
import { UserIcon, CalendarIcon } from '@heroicons/react/24/outline';

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
    <div className="bg-gray-900 hover:bg-gray-800 rounded-xl p-6 transition-all duration-300 group ring-1 ring-gray-700/50 hover:ring-2 hover:ring-indigo-500/20">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-6">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-300 text-lg">Discovering cosmic models...</p>
        </div>
      ) : error ? (
        <div className="text-pink-400 text-sm text-center p-4">
          ⚠️ Interstellar communication failed
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-100 truncate">
              {modelData?.modelName || `Stellar Model #${index + 1}`}
            </h2>
            <span className="px-2 py-1 text-xs font-medium text-indigo-400 bg-indigo-900/30 rounded-full backdrop-blur-sm">
              {modelData?.role || 'Unknown'}
            </span>
          </div>

          {/* {modelData?.textSample && (
            <p className="text-gray-300 text-sm h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-800/50 scrollbar-track-gray-900">
              {modelData.textSample}
            </p>
          )} */}

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4 text-indigo-400" />
              <span className="text-gray-300 text-sm font-mono">
                {modelData?.address ? 
                  `${modelData.address.slice(0, 6)}...${modelData.address.slice(-4)}` : 
                  'Unknown origin'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-indigo-400" />
              <span className="text-gray-300 text-sm">
                {modelData?.timestamp ? 
                  new Date(modelData.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 
                  'Timeless'}
              </span>
            </div>
          </div>

          <button
            onClick={() => onMint(model)}
            disabled={isMinting || isLoading}
            className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-gray-100 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-indigo-500/20 relative overflow-hidden"
          >
            <span className="relative z-10">{isMinting ? "Launching NFT..." : "Mint Cosmic NFT"}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20" />
          </button>
          
          <p className="text-center text-xs text-indigo-400/80 mt-2 font-space">
            🌌 NFTs minting powered by Base
          </p>
        </div>
      )}
    </div>
  );
}