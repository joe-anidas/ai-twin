'use client';

import { useQuery } from '@apollo/client';
import { GET_PUBLIC_MODELS } from '@/lib/queries';
import { apolloClient } from '@/lib/apollo-client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ModelMetadata = {
  modelName: string;
  role: string;
  description?: string;
  textSample?: string;    // Added
  timestamp?: string;     // Added
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
  const [sortedModels, setSortedModels] = useState<PublicModel[]>([]);
  
  const { loading, error, data } = useQuery(GET_PUBLIC_MODELS, {
    client: apolloClient,
    fetchPolicy: 'cache-and-network'
  });

  useEffect(() => {
    const loadModels = async () => {
      if (!data?.publicModels) return;

      const models = await Promise.all(
        data.publicModels.map(async (model: any) => {
          try {
            const response = await fetch(model.metadataURI);
            if (!response.ok) throw new Error('Failed to fetch metadata');
            
            const metadata: ModelMetadata = await response.json();
            
            // Filter private models based on metadata
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

  const handleChatNavigation = (model: PublicModel) => {
    try {
      const encodedMetadata = encodeURIComponent(JSON.stringify({
        modelName: model.metadata.modelName,
        role: model.metadata.role,
        textSample: model.metadata.textSample, // Added from CloneCard
        timestamp: model.metadata.timestamp,   // Added from CloneCard
        metadataURI: model.metadataURI
      }));
      
      // Match the CloneCard's URL pattern exactly
      router.push(`/chat/${model.tokenId.toString()}?metadata=${encodedMetadata}`);
    } catch (error) {
      console.error('Error navigating to chat:', error);
      alert('Could not start chat. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">
          Error loading models: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-white mb-10 text-center">
          🌟 Public AI Models
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-6">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"/>
            <p className="text-slate-300 text-lg">Discovering AI models...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedModels.map((model) => (
              <div 
                key={model.tokenId}
                className="bg-slate-800/50 hover:bg-slate-800/70 rounded-xl p-6 transition-all duration-300 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white truncate">
                      {model.metadata.modelName}
                    </h2>
                    <span className="px-2 py-1 text-xs font-medium text-blue-300 bg-blue-900/30 rounded-full">
                      {model.metadata.role}
                    </span>
                  </div>
                  
                  {model.metadata.description && (
                    <p className="text-slate-400 text-sm h-20 overflow-y-auto">
                      {model.metadata.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300 text-sm font-mono">
                        {model.owner.slice(0, 6)}...{model.owner.slice(-4)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300 text-sm">
                        {model.timestamp.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {model.metadata.version && (
                      <div className="flex items-center space-x-2">
                        <CodeIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300 text-sm">
                          Version {model.metadata.version}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleChatNavigation(model)}
                    className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-all duration-200 flex items-center justify-center"
                  >
                    <span>Chat Now</span>
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && sortedModels.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <p className="text-xl text-slate-400">
              🎯 No public models available. Create one to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Icon components
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