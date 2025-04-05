import { useIsMobile } from '@/hooks/use-mobile';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { MobileChatDrawer } from '@/components/chat/MobileChatDrawer';
import { ProtectedRoute } from '@/components/auth/route-components';

function ChatPage() {
  const isMobile = useIsMobile();
  
  return (
    <main className="container mx-auto py-8 min-h-screen w-full">
      <h1 className="text-3xl font-bold mb-6">Chat</h1>
      
      {!isMobile && <ChatContainer />}
      <MobileChatDrawer />
    </main>
  );
}

export default function ProtectedChatPage() {
  return <ProtectedRoute Component={ChatPage} />;
}