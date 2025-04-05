import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/use-chat';
import { Message as MessageType } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send, Paperclip, X, Reply, MoreVertical, Trash2 } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const Message = ({ 
  message, 
  isCurrentUser, 
  onReply, 
  onDelete 
}: { 
  message: MessageType; 
  isCurrentUser: boolean;
  onReply: () => void;
  onDelete: () => void;
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const renderFilePreview = () => {
    if (!message.fileURL) return null;

    switch (message.fileType) {
      case 'image':
        return (
          <div className="mt-2 rounded-md overflow-hidden">
            <img 
              src={message.fileURL} 
              alt={message.fileName || 'Image'} 
              className="max-w-[200px] max-h-[200px] object-contain"
            />
          </div>
        );
      case 'video':
        return (
          <div className="mt-2 rounded-md overflow-hidden">
            <video 
              src={message.fileURL} 
              controls 
              className="max-w-[200px] max-h-[200px]"
            />
          </div>
        );
      case 'audio':
        return (
          <div className="mt-2">
            <audio src={message.fileURL} controls className="w-full" />
          </div>
        );
      case 'file':
        return (
          <div className="mt-2">
            <a 
              href={message.fileURL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 bg-secondary rounded-md hover:bg-secondary/80"
            >
              <Paperclip size={16} />
              <span className="text-sm truncate">{message.fileName}</span>
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        "group flex gap-2 relative p-2 rounded-lg hover:bg-muted/30",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback>{message.senderName[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "flex flex-col max-w-[70%]",
        isCurrentUser ? "items-end" : "items-start"
      )}>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs font-medium",
            message.isAdmin ? "text-red-500" : "text-muted-foreground"
          )}>
            {message.senderName}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        
        {message.replyTo && (
          <div className={cn(
            "text-xs bg-muted p-1 rounded-md mb-1 max-w-[300px] overflow-hidden",
            isCurrentUser ? "text-right" : "text-left"
          )}>
            <span className="font-medium">{message.replyTo.senderName}: </span>
            <span className="text-muted-foreground truncate">{message.replyTo.text}</span>
          </div>
        )}
        
        <div className={cn(
          "bg-primary-foreground p-2 rounded-md",
          isCurrentUser ? "rounded-tr-none" : "rounded-tl-none"
        )}>
          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
          {renderFilePreview()}
        </div>
      </div>
      
      {showOptions && (
        <div className={cn(
          "absolute top-2 flex gap-1",
          isCurrentUser ? "left-2" : "right-2"
        )}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={onReply}
          >
            <Reply size={14} />
          </Button>
          
          {isCurrentUser && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-destructive hover:text-destructive" 
              onClick={onDelete}
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export function ChatContainer() {
  const {
    currentUser,
    loading,
    publicMessages,
    privateChats,
    privateMessages,
    users,
    selectedChat,
    replyingTo,
    sendPublicMessage,
    createPrivateChat,
    sendPrivateMessage,
    deleteMessage,
    searchUsers,
    setSelectedChat,
    setReplyingTo
  } = useChat();
  
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof users>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [publicMessages, privateMessages]);
  
  // Update search results when query changes
  useEffect(() => {
    if (searchQuery) {
      setSearchResults(searchUsers(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchUsers]);
  
  const handleSendMessage = () => {
    if (!message.trim() && !file) return;
    
    if (selectedChat === 'public') {
      sendPublicMessage(message, file || undefined);
    } else if (selectedChat) {
      sendPrivateMessage(selectedChat, message, file || undefined);
    }
    
    setMessage('');
    setFile(null);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleUserSelect = async (userId: string) => {
    const chatId = await createPrivateChat(userId);
    if (chatId) {
      setSelectedChat(chatId);
      setShowUserSearch(false);
      setSearchQuery('');
    }
  };
  
  const handleDeleteMessage = (messageId: string) => {
    if (selectedChat === 'public') {
      deleteMessage(messageId, false);
    } else if (selectedChat) {
      deleteMessage(messageId, true, selectedChat);
    }
  };
  
  const renderMessages = () => {
    if (selectedChat === 'public') {
      return publicMessages.map((msg) => (
        <Message 
          key={msg.id} 
          message={msg} 
          isCurrentUser={currentUser?.uid === msg.senderId}
          onReply={() => setReplyingTo(msg)}
          onDelete={() => handleDeleteMessage(msg.id)}
        />
      ));
    } else if (selectedChat && privateMessages[selectedChat]) {
      return privateMessages[selectedChat].map((msg) => (
        <Message 
          key={msg.id} 
          message={msg} 
          isCurrentUser={currentUser?.uid === msg.senderId}
          onReply={() => setReplyingTo(msg)}
          onDelete={() => handleDeleteMessage(msg.id)}
        />
      ));
    }
    return null;
  };
  
  const renderChatHeader = () => {
    if (selectedChat === 'public') {
      return 'Public Chat';
    } else if (selectedChat) {
      const chat = privateChats.find(c => c.id === selectedChat);
      if (chat && chat.otherUser) {
        return chat.otherUser.username;
      }
    }
    return '';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-4">
        <h2 className="text-xl font-semibold">Please sign in to use the chat</h2>
        <p className="text-muted-foreground">You need to be logged in to send and receive messages</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b bg-card">
        <h2 className="text-lg font-semibold">{renderChatHeader()}</h2>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowUserSearch(true)}
          >
            <Search size={18} />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 border-r bg-muted/30 hidden md:block">
          <Tabs defaultValue="chats">
            <TabsList className="w-full">
              <TabsTrigger value="chats" className="flex-1">Chats</TabsTrigger>
              <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chats" className="p-0">
              <ScrollArea className="h-[calc(600px-88px)]">
                <div className="p-2">
                  <Button
                    variant={selectedChat === 'public' ? 'secondary' : 'ghost'}
                    className="w-full justify-start mb-1"
                    onClick={() => setSelectedChat('public')}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>P</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Public Chat</span>
                        <span className="text-xs text-muted-foreground">Everyone</span>
                      </div>
                    </div>
                  </Button>
                  
                  {privateChats.map((chat) => (
                    <Button
                      key={chat.id}
                      variant={selectedChat === chat.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start mb-1"
                      onClick={() => setSelectedChat(chat.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {chat.otherUser?.username?.[0].toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start overflow-hidden">
                          <span className="font-medium">{chat.otherUser?.username}</span>
                          {chat.lastMessage && (
                            <span className="text-xs text-muted-foreground truncate w-full">
                              {chat.lastMessage.senderId === currentUser.uid ? 'You: ' : ''}
                              {chat.lastMessage.text}
                            </span>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="users" className="p-0">
              <div className="p-2">
                <div className="relative mb-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <ScrollArea className="h-[calc(600px-130px)]">
                  {searchQuery ? (
                    searchResults.length > 0 ? (
                      searchResults.map((user) => (
                        <Button
                          key={user.uid}
                          variant="ghost"
                          className="w-full justify-start mb-1"
                          onClick={() => handleUserSelect(user.uid)}
                          disabled={user.uid === currentUser.uid}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start">
                              <span className={cn(
                                "font-medium",
                                user.isAdmin ? "text-red-500" : ""
                              )}>
                                {user.username}
                                {user.isAdmin && <span className="ml-1">(Admin)</span>}
                              </span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          </div>
                        </Button>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground p-4">No users found</p>
                    )
                  ) : (
                    users
                      .filter(user => user.uid !== currentUser.uid)
                      .map((user) => (
                        <Button
                          key={user.uid}
                          variant="ghost"
                          className="w-full justify-start mb-1"
                          onClick={() => handleUserSelect(user.uid)}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start">
                              <span className={cn(
                                "font-medium",
                                user.isAdmin ? "text-red-500" : ""
                              )}>
                                {user.username}
                                {user.isAdmin && <span className="ml-1">(Admin)</span>}
                              </span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          </div>
                        </Button>
                      ))
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {renderMessages()}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {replyingTo && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 border-t">
              <div className="flex-1 text-sm">
                <span className="font-medium">Replying to {replyingTo.senderName}: </span>
                <span className="text-muted-foreground">{replyingTo.text.substring(0, 50)}{replyingTo.text.length > 50 ? '...' : ''}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => setReplyingTo(null)}
              >
                <X size={14} />
              </Button>
            </div>
          )}
          
          {file && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 border-t">
              <div className="flex-1 text-sm">
                <span className="font-medium">File: </span>
                <span className="text-muted-foreground">{file.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => setFile(null)}
              >
                <X size={14} />
              </Button>
            </div>
          )}
          
          <div className="p-2 border-t flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={18} />
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
              />
            </Button>
            
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            
            <Button onClick={handleSendMessage}>
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
      
      <Dialog open={showUserSearch} onOpenChange={setShowUserSearch}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search Users</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username or email..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <ScrollArea className="h-[300px] mt-2">
            {searchResults.length > 0 ? (
              searchResults
                .filter(user => user.uid !== currentUser.uid)
                .map((user) => (
                  <Card 
                    key={user.uid} 
                    className="mb-2 cursor-pointer hover:bg-muted/50"
                    onClick={() => handleUserSelect(user.uid)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={cn(
                              "font-medium",
                              user.isAdmin ? "text-red-500" : ""
                            )}>
                              {user.username}
                            </p>
                            {user.isAdmin && (
                              <Badge variant="outline" className="text-red-500 border-red-500">Admin</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : searchQuery ? (
              <p className="text-center text-muted-foreground p-4">No users found</p>
            ) : (
              <p className="text-center text-muted-foreground p-4">Type to search users</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}