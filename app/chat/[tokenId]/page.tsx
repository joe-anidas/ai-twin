// app/chat/[tokenId]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface ChatMetadata {
  modelName: string;
  role: string;
  visibility: string;
  timestamp: string;
  // Add other expected fields from your metadata
}

export default function ChatPage({ params }: { params: { tokenId: string } }) {
  const searchParams = useSearchParams();
  const metadataUrl = searchParams.get('metadata');
  
  const [metadata, setMetadata] = useState<ChatMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        if (!metadataUrl) {
          throw new Error('No metadata URL provided');
        }
        
        const response = await fetch(decodeURIComponent(metadataUrl));
        if (!response.ok) throw new Error('Failed to fetch metadata');
        
        const data: ChatMetadata = await response.json();
        setMetadata(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metadata');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [metadataUrl]);

  if (isLoading) return <div>Loading chat interface...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!metadata) return <div>No metadata found</div>;

  return (
    <div>
      <h1>Chat with {metadata.modelName}</h1>
      <div className="metadata-info">
        <p>Role: {metadata.role}</p>
        <p>Created: {new Date(metadata.timestamp).toLocaleDateString()}</p>
      </div>
      {/* Add your chat interface here */}
    </div>
  );
}