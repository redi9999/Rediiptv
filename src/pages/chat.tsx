import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fine } from "@/lib/fine";
import { auth, database, storage } from "@/lib/firebase";
import { ref, onValue, push, set, query, orderByChild, equalTo, get } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Send, 
  Image, 
  File, 
  Mic, 
  Video, 
  MoreVertical, 
  Reply, 
  Copy, 
  Trash2,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Message {
  id: string;
  text: string;
  userId: string;
  username: string;
  timestamp: number;
  fileUrl?: string;
  fileType?: string;
  replyTo?: {
    id: string;
    text: string;
    username: string;
  };
}

interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [privateMessages, setPrivateMessages] = useState<{[key: string]: Message[]}>({});
  const [privateChats, setPrivateChats] = useState<User[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState("public");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      // Get user data from database
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setCurrentUser({
          id: user.uid,
          email: user.email || "",
          username: userData.username,
          isAdmin: user.email === "redi.shqipez@gmail.com"
        });
      } else {
        // If user doesn't exist in database yet, create a new entry
        const username = user.displayName || user.email?.split('@')[0] || "user" + Math.floor(Math.random() * 1000);
        await set(userRef, {
          email: user.email,
          username: username,
          createdAt: Date.now()
        });
        
        setCurrentUser({
          id: user.uid,
          email: user.email || "",
          username: username,
          isAdmin: user.email === "redi.shqipez@gmail.com"
        });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Load all users
  useEffect(() => {
    const usersRef = ref(database, "users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersArray = Object.keys(usersData).map(key => ({
          id: key,
          email: usersData[key].email,
          username: usersData[key].username,
          isAdmin: usersData[key].email === "redi.shqipez@gmail.com"
        }));
        setUsers(usersArray);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load public messages
  useEffect(() => {
    const messagesRef = ref(database, "messages");
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messagesArray = Object.keys(messagesData).map(key => ({
          id: key,
          ...messagesData[key]
        }));
        
        // Sort messages by timestamp
        messagesArray.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messagesArray);
        
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load private chats
  useEffect(() => {
    if (!currentUser) return;

    const privateChatsRef = ref(database, `privateChats/${currentUser.id}`);
    const unsubscribe = onValue(privateChatsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const chatsData = snapshot.val();
        const chatUserIds = Object.keys(chatsData);
        
        // Get user details for each chat
        const chatUsers: User[] = [];
        for (const userId of chatUserIds) {
          const userRef = ref(database, `users/${userId}`);
          const userSnapshot = await get(userRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            chatUsers.push({
              id: userId,
              email: userData.email,
              username: userData.username,
              isAdmin: userData.email === "redi.shqipez@gmail.com"
            });
          }
        }
        
        setPrivateChats(chatUsers);
        
        // Load messages for each chat
        const allPrivateMessages: {[key: string]: Message[]} = {};
        for (const userId of chatUserIds) {
          const messagesRef = ref(database, `privateMessages/${currentUser.id}/${userId}`);
          const messagesSnapshot = await get(messagesRef);
          
          if (messagesSnapshot.exists()) {
            const messagesData = messagesSnapshot.val();
            const messagesArray = Object.keys(messagesData).map(key => ({
              id: key,
              ...messagesData[key]
            }));
            
            // Sort messages by timestamp
            messagesArray.sort((a, b) => a.timestamp - b.timestamp);
            allPrivateMessages[userId] = messagesArray;
          } else {
            allPrivateMessages[userId] = [];
          }
        }
        
        setPrivateMessages(allPrivateMessages);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Handle sending a message
  const sendMessage = async () => {
    if (!currentUser || (!messageText.trim() && !file)) return;
    
    try {
      let fileUrl = "";
      let fileType = "";
      
      // Upload file if present
      if (file) {
        setIsUploading(true);
        const fileId = uuidv4();
        const fileExtension = file.name.split('.').pop();
        
        if (file.type.startsWith('image/')) {
          fileType = 'image';
        } else if (file.type.startsWith('video/')) {
          fileType = 'video';
        } else if (file.type.startsWith('audio/')) {
          fileType = 'audio';
        } else {
          fileType = 'file';
        }
        
        const fileStorageRef = storageRef(storage, `files/${fileId}.${fileExtension}`);
        await uploadBytes(fileStorageRef, file);
        fileUrl = await getDownloadURL(fileStorageRef);
        setIsUploading(false);
      }
      
      const newMessage = {
        text: messageText.trim(),
        userId: currentUser.id,
        username: currentUser.username,
        timestamp: Date.now(),
        ...(fileUrl && { fileUrl, fileType }),
        ...(replyingTo && { 
          replyTo: {
            id: replyingTo.id,
            text: replyingTo.text,
            username: replyingTo.username
          }
        })
      };
      
      // Send to public or private chat
      if (activeTab === "public") {
        const messagesRef = ref(database, "messages");
        const newMessageRef = push(messagesRef);
        await set(newMessageRef, newMessage);
      } else if (selectedUser) {
        // Send to private chat
        const senderRef = ref(database, `privateMessages/${currentUser.id}/${selectedUser.id}`);
        const receiverRef = ref(database, `privateMessages/${selectedUser.id}/${currentUser.id}`);
        
        const newMessageRef = push(senderRef);
        await set(newMessageRef, newMessage);
        
        // Also save in receiver's messages
        await set(ref(database, `privateMessages/${selectedUser.id}/${currentUser.id}/${newMessageRef.key}`), newMessage);
        
        // Update chat list for both users
        await set(ref(database, `privateChats/${currentUser.id}/${selectedUser.id}`), { lastMessageAt: Date.now() });
        await set(ref(database, `privateChats/${selectedUser.id}/${currentUser.id}`), { lastMessageAt: Date.now() });
      }
      
      // Reset state
      setMessageText("");
      setFile(null);
      setReplyingTo(null);
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle file selection
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Handle user search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = users.filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(results);
  };

  // Start a private chat
  const startPrivateChat = (user: User) => {
    setSelectedUser(user);
    setActiveTab("private");
    setSearchQuery("");
    setSearchResults([]);
  };

  // Handle message actions
  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Message copied to clipboard",
    });
  };

  const handleReplyMessage = (message: Message) => {
    setReplyingTo(message);
  };

  const handleDeleteMessage = async (message: Message) => {
    if (!currentUser) return;
    
    // Only allow deletion if user is admin or message owner
    if (currentUser.isAdmin || message.userId === currentUser.id) {
      try {
        if (activeTab === "public") {
          await set(ref(database, `messages/${message.id}`), null);
        } else if (selectedUser) {
          await set(ref(database, `privateMessages/${currentUser.id}/${selectedUser.id}/${message.id}`), null);
          await set(ref(database, `privateMessages/${selectedUser.id}/${currentUser.id}/${message.id}`), null);
        }
        
        toast({
          description: "Message deleted",
        });
      } catch (error) {
        console.error("Error deleting message:", error);
        toast({
          title: "Error",
          description: "Failed to delete message",
          variant: "destructive",
        });
      }
    }
  };

  // Render file preview
  const renderFilePreview = (fileUrl: string, fileType: string) => {
    switch (fileType) {
      case 'image':
        return <img src={fileUrl} alt="Shared image" className="rounded-md max-h-60 object-contain" />;
      case 'video':
        return (
          <video controls className="rounded-md max-h-60 w-full">
            <source src={fileUrl} />
            Your browser does not support video playback.
          </video>
        );
      case 'audio':
        return (
          <audio controls className="w-full">
            <source src={fileUrl} />
            Your browser does not support audio playback.
          </audio>
        );
      default:
        return (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
            <File size={20} />
            Download file
          </a>
        );
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen flex flex-col bg-background">
      <div className="container mx-auto p-4 flex flex-col h-screen max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Chat Room</h1>
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>{currentUser.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{currentUser.username}</p>
              <p className="text-xs text-muted-foreground">{currentUser.isAdmin ? "Admin" : "User"}</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="public">Public Chat</TabsTrigger>
              <TabsTrigger value="private">Private Chats</TabsTrigger>
            </TabsList>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Find Users
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Search Users</DialogTitle>
                  <DialogDescription>
                    Find users to start a private conversation
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 mb-4">
                  <Input 
                    placeholder="Search by username or email" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch}>Search</Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map(user => (
                      <div 
                        key={user.id} 
                        className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                        onClick={() => startPrivateChat(user)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">Chat</Button>
                      </div>
                    ))
                  ) : searchQuery ? (
                    <p className="text-center text-muted-foreground">No users found</p>
                  ) : (
                    <p className="text-center text-muted-foreground">Type to search for users</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="public" className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-2">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex flex-col ${message.userId === currentUser.id ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.userId === currentUser.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className={`font-medium text-sm ${
                          message.username === "redi.shqipez@gmail.com" || users.find(u => u.id === message.userId)?.isAdmin 
                            ? 'text-red-500' 
                            : ''
                        }`}
                      >
                        {message.username}
                      </span>
                      <span className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleReplyMessage(message)}>
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyMessage(message.text)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </DropdownMenuItem>
                          {(currentUser.isAdmin || message.userId === currentUser.id) && (
                            <DropdownMenuItem 
                              onClick={() => handleDeleteMessage(message)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {message.replyTo && (
                      <div className="bg-background/20 p-2 rounded mb-2 text-sm">
                        <p className="font-medium text-xs">{message.replyTo.username}</p>
                        <p className="truncate">{message.replyTo.text}</p>
                      </div>
                    )}
                    
                    {message.text && <p>{message.text}</p>}
                    
                    {message.fileUrl && (
                      <div className="mt-2">
                        {renderFilePreview(message.fileUrl, message.fileType || 'file')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {replyingTo && (
              <div className="flex items-center gap-2 bg-muted p-2 rounded-md mb-2">
                <div className="flex-1">
                  <p className="text-xs font-medium">Replying to {replyingTo.username}</p>
                  <p className="text-sm truncate">{replyingTo.text}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => setReplyingTo(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {file && (
              <div className="flex items-center gap-2 bg-muted p-2 rounded-md mb-2">
                <div className="flex-1">
                  <p className="text-sm truncate">{file.name}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => setFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex gap-2">
              <Textarea
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="min-h-[60px]"
              />
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleFileSelect}
                  disabled={isUploading}
                >
                  <Image className="h-4 w-4" />
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={(!messageText.trim() && !file) || isUploading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="private" className="flex-1 flex">
            <div className="w-1/3 border-r pr-2 overflow-y-auto">
              <h3 className="font-medium mb-2">Private Chats</h3>
              {privateChats.length > 0 ? (
                <div className="space-y-1">
                  {privateChats.map(user => (
                    <div 
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-2 rounded-md cursor-pointer flex items-center gap-2 ${
                        selectedUser?.id === user.id ? 'bg-accent' : 'hover:bg-muted'
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className={`font-medium ${user.isAdmin ? 'text-red-500' : ''}`}>
                          {user.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {privateMessages[user.id]?.length > 0 
                            ? privateMessages[user.id][privateMessages[user.id].length - 1].text || "Shared a file"
                            : "No messages yet"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No private chats yet</p>
              )}
            </div>
            
            <div className="flex-1 flex flex-col pl-2">
              {selectedUser ? (
                <>
                  <div className="border-b pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>{selectedUser.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className={`font-medium ${selectedUser.isAdmin ? 'text-red-500' : ''}`}>
                          {selectedUser.username}
                        </p>
                        <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-2">
                    {privateMessages[selectedUser.id]?.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex flex-col ${message.userId === currentUser.id ? 'items-end' : 'items-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.userId === currentUser.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleReplyMessage(message)}>
                                  <Reply className="h-4 w-4 mr-2" />
                                  Reply
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCopyMessage(message.text)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy
                                </DropdownMenuItem>
                                {(currentUser.isAdmin || message.userId === currentUser.id) && (
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteMessage(message)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          {message.replyTo && (
                            <div className="bg-background/20 p-2 rounded mb-2 text-sm">
                              <p className="font-medium text-xs">{message.replyTo.username}</p>
                              <p className="truncate">{message.replyTo.text}</p>
                            </div>
                          )}
                          
                          {message.text && <p>{message.text}</p>}
                          
                          {message.fileUrl && (
                            <div className="mt-2">
                              {renderFilePreview(message.fileUrl, message.fileType || 'file')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {replyingTo && (
                    <div className="flex items-center gap-2 bg-muted p-2 rounded-md mb-2">
                      <div className="flex-1">
                        <p className="text-xs font-medium">Replying to {replyingTo.username}</p>
                        <p className="text-sm truncate">{replyingTo.text}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => setReplyingTo(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {file && (
                    <div className="flex items-center gap-2 bg-muted p-2 rounded-md mb-2">
                      <div className="flex-1">
                        <p className="text-sm truncate">{file.name}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => setFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="min-h-[60px]"
                    />
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handleFileSelect}
                        disabled={isUploading}
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={sendMessage} 
                        disabled={(!messageText.trim() && !file) || isUploading}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <Card className="p-6 text-center">
                    <p className="mb-4">Select a chat or search for users to start a conversation</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>Find Users</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Search Users</DialogTitle>
                          <DialogDescription>
                            Find users to start a private conversation
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-2 mb-4">
                          <Input 
                            placeholder="Search by username or email" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          />
                          <Button onClick={handleSearch}>Search</Button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {searchResults.length > 0 ? (
                            searchResults.map(user => (
                              <div 
                                key={user.id} 
                                className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                                onClick={() => startPrivateChat(user)}
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar>
                                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{user.username}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost">Chat</Button>
                              </div>
                            ))
                          ) : searchQuery ? (
                            <p className="text-center text-muted-foreground">No users found</p>
                          ) : (
                            <p className="text-center text-muted-foreground">Type to search for users</p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default ChatPage;