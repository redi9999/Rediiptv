import { useState, useEffect } from 'react';
import { useChat } from '@/hooks/use-chat';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChatContainer } from './ChatContainer';

export function MobileChatDrawer() {
  const [open, setOpen] = useState(false);
  const { currentUser, loading } = useChat();
  const isMobile = useIsMobile();
  
  // Close drawer when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setOpen(false);
    }
  }, [isMobile]);
  
  if (!isMobile) return null;
  
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button 
          className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <MessageSquare size={24} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Chat</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4 h-[calc(90vh-65px)]">
          {!currentUser ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <h2 className="text-xl font-semibold">Please sign in to use the chat</h2>
              <p className="text-muted-foreground">You need to be logged in to send and receive messages</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ChatContainer />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}