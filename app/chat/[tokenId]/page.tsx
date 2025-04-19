
import ChatClient from './ChatClient';

export default async function ChatPage({ params }: { params: { tokenId: string } }) {
  return <ChatClient tokenId={params.tokenId} />;
}
