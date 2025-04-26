'use client';

import { useQuery } from '@apollo/client';
import { GET_PUBLIC_MODELS } from '@/lib/queries';
import { apolloClient } from '@/lib/apollo-client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useContract } from "@/context/ContractContext";

type ModelMetadata = {
  modelName: string;
  role: string;
  description?: string;
  textSample?: string;
  timestamp?: string;
  version?: string;
  visibility?: string;
};

type PublicModel = {
  tokenId: string;
  owner: string;
  metadata: ModelMetadata;
  timestamp: Date;
  metadataURI: string;
};

export default function PublicModelsList() {
  const router = useRouter();
  const { account } = useContract();
  const [sortedModels, setSortedModels] = useState<PublicModel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);

  const { loading, error, data } = useQuery(GET_PUBLIC_MODELS, {
    client: apolloClient,
    fetchPolicy: 'cache-and-network'
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      if (!data?.publicModels) return;

      const models = await Promise.all(
        data.publicModels.map(async (model: any) => {
          try {
            const response = await fetch(model.metadataURI);
            if (!response.ok) throw new Error('Failed to fetch metadata');
            
            const metadata: ModelMetadata = await response.json();
            
            if (metadata.visibility !== 'Public') return null;

            return {
              tokenId: model.id.includes('-') ? model.id.split('-')[1] : model.id,
              owner: model.owner,
              metadata,
              timestamp: new Date(Number(model.blockTimestamp) * 1000),
              metadataURI: model.metadataURI
            };
          } catch (error) {
            console.error('Error loading model metadata:', error);
            return null;
          }
        })
      );

      const validModels = models.filter(Boolean) as PublicModel[];
      const sorted = validModels.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setSortedModels(sorted);
    };

    loadModels();
  }, [data]);

  const filteredModels = useMemo(() => {
    if (!searchQuery) return sortedModels;
    
    const query = searchQuery.toLowerCase();
    return sortedModels.filter(model => {
      const nameMatch = model.metadata.modelName.toLowerCase().includes(query);
      const ownerMatch = model.owner.toLowerCase().includes(query);
      return nameMatch || ownerMatch;
    });
  }, [sortedModels, searchQuery]);

  const handleChatNavigation = (model: PublicModel) => {
    try {
      const encodedMetadata = encodeURIComponent(JSON.stringify({
        modelName: model.metadata.modelName,
        role: model.metadata.role,
        textSample: model.metadata.textSample,
        timestamp: model.metadata.timestamp,
        metadataURI: model.metadataURI
      }));
      
      router.push(`/chat/${model.tokenId.toString()}?metadata=${encodedMetadata}`);
    } catch (error) {
      console.error('Error navigating to chat:', error);
      alert('Could not start chat. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-red-500 text-lg text-center">
          Error loading models: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div id="public-models" className="min-h-screen bg-slate-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center">
            🌟 Public AI Models
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <div className="relative w-full max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search models..."
                className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-200 placeholder-slate-400 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {isClient && account?.status === 'connected' && (
              <button
                onClick={() => account?.address && setSearchQuery(account.address)}
                className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-all duration-200 whitespace-nowrap"
              >
                Show My Models
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-6">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"/>
            <p className="text-slate-300 text-lg">Discovering AI models...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredModels.map((model) => (
              <div 
                key={model.tokenId}
                className="bg-slate-800/50 hover:bg-slate-800/70 rounded-xl p-4 sm:p-6 transition-all duration-300 group flex flex-col sm:flex-row items-start sm:items-center justify-between"
              >
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-white truncate">
                      {model.metadata.modelName}
                    </h2>
                    <span className="px-2 py-1 text-xs font-medium text-blue-300 bg-blue-900/30 rounded-full self-start sm:self-center">
                      {model.metadata.role}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-slate-400" />
                      <span className="font-mono break-all sm:break-normal">
                        {model.owner.slice(0, 6)}...{model.owner.slice(-4)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-slate-400" />
                      <span>
                        {model.timestamp.toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                    </div>
                    {model.metadata.version && (
                      <div className="flex items-center gap-2">
                        <CodeIcon className="h-4 w-4 text-slate-400" />
                        <span>v{model.metadata.version}</span>
                      </div>
                    )}
                  </div>

                  {model.metadata.description && (
                    <p className="mt-2 text-slate-400 text-sm line-clamp-2">
                      {model.metadata.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 sm:mt-0 sm:ml-4 w-full sm:w-auto">
                  <button
                    onClick={() => handleChatNavigation(model)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>Chat</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredModels.length === 0 && (
          <div className="text-center py-8 sm:py-16 space-y-4">
            <p className="text-lg sm:text-xl text-slate-400 px-4">
              {searchQuery ? 
                "🔍 No models matching your search..." : 
                "🎯 No public models available. Create one to get started!"
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm sm:text-base"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Icon components remain unchanged
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}