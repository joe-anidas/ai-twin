
// This file should be named 'page.tsx' in the app/chat/[tokenId]/ directory
import { Suspense } from 'react';
import ChatPage from './ChatClient';

// Server component
export default function ChatPageWrapper({ 
  params 
}: { 
  params: { tokenId: string } 
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPage tokenId={params.tokenId} />
    </Suspense>
  );
}