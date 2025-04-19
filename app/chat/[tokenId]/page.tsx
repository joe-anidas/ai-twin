
import ChatClient from './ChatClient';

export default function ChatPage({ params }: { params: { tokenId: string } }) {
  return <ChatClient tokenId={params.tokenId} />;
}