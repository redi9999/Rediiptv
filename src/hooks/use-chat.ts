import { useState, useEffect } from 'react';
import { 
  ref, 
  push, 
  set, 
  onValue, 
  query, 
  orderByChild, 
  limitToLast, 
  get, 
  update,
  remove
} from 'firebase/database';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { database, auth, storage } from '@/lib/firebase';
import { User, Message, ChatRoom } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

export function useChat() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [publicMessages, setPublicMessages] = useState<Message[]>([]);
  const [privateChats, setPrivateChats] = useState<ChatRoom[]>([]);
  const [privateMessages, setPrivateMessages] = useState<Record<string, Message[]>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>('public');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const { toast } = useToast();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user data from database
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setCurrentUser({
            uid: user.uid,
            email: user.email || '',
            username: userData.username,
            isAdmin: userData.email === 'redi.shqipez@gmail.com',
            photoURL: user.photoURL || undefined,
            createdAt: userData.createdAt
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load public messages
  useEffect(() => {
    const messagesRef = query(
      ref(database, 'messages/public'),
      orderByChild('timestamp'),
      limitToLast(100)
    );

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((childSnapshot) => {
        messages.push({
          id: childSnapshot.key as string,
          ...childSnapshot.val()
        });
      });
      setPublicMessages(messages);
    });

    return () => unsubscribe();
  }, []);

  // Load users
  useEffect(() => {
    const usersRef = ref(database, 'users');
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersList: User[] = [];
      snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();
        usersList.push({
          uid: childSnapshot.key as string,
          ...userData
        });
      });
      setUsers(usersList);
    });

    return () => unsubscribe();
  }, []);

  // Load private chats
  useEffect(() => {
    if (!currentUser) return;

    const chatsRef = query(
      ref(database, `userChats/${currentUser.uid}`)
    );
    
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const chats: ChatRoom[] = [];
      snapshot.forEach((childSnapshot) => {
        chats.push({
          id: childSnapshot.key as string,
          ...childSnapshot.val()
        });
      });
      setPrivateChats(chats);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Load private messages when a chat is selected
  useEffect(() => {
    if (!currentUser || !selectedChat || selectedChat === 'public') return;

    const messagesRef = query(
      ref(database, `messages/private/${selectedChat}`),
      orderByChild('timestamp'),
      limitToLast(100)
    );
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((childSnapshot) => {
        messages.push({
          id: childSnapshot.key as string,
          ...childSnapshot.val()
        });
      });
      
      setPrivateMessages(prev => ({
        ...prev,
        [selectedChat]: messages
      }));
    });

    return () => unsubscribe();
  }, [currentUser, selectedChat]);

  // Sign up function
  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Check if username is already taken
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      let isUsernameTaken = false;
      
      snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();
        if (userData.username.toLowerCase() === username.toLowerCase()) {
          isUsernameTaken = true;
        }
      });

      if (isUsernameTaken) {
        throw new Error('Username is already taken');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile
      await updateProfile(user, {
        displayName: username
      });
      
      // Save user to database
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        email,
        username,
        isAdmin: email === 'redi.shqipez@gmail.com',
        createdAt: Date.now()
      });

      toast({
        title: "Account created",
        description: "You have successfully signed up!",
      });

      return user;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      return userCredential.user;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Send message to public chat
  const sendPublicMessage = async (text: string, file?: File) => {
    if (!currentUser) return;
    
    try {
      let fileURL = '';
      let fileType: 'image' | 'video' | 'audio' | 'file' | undefined;
      let fileName = '';
      
      if (file) {
        fileName = file.name;
        // Determine file type
        if (file.type.startsWith('image/')) {
          fileType = 'image';
        } else if (file.type.startsWith('video/')) {
          fileType = 'video';
        } else if (file.type.startsWith('audio/')) {
          fileType = 'audio';
        } else {
          fileType = 'file';
        }
        
        // Upload file to storage
        const fileRef = storageRef(storage, `files/${currentUser.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        fileURL = await getDownloadURL(fileRef);
      }
      
      const messageData: Omit<Message, 'id'> = {
        text,
        senderId: currentUser.uid,
        senderName: currentUser.username,
        isAdmin: currentUser.isAdmin,
        timestamp: Date.now(),
        ...(fileURL && { fileURL, fileType, fileName }),
        ...(replyingTo && {
          replyTo: {
            id: replyingTo.id,
            text: replyingTo.text,
            senderName: replyingTo.senderName
          }
        })
      };
      
      const newMessageRef = push(ref(database, 'messages/public'));
      await set(newMessageRef, messageData);
      
      // Clear reply state
      setReplyingTo(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Create or get private chat
  const createPrivateChat = async (otherUserId: string) => {
    if (!currentUser) return null;
    
    try {
      // Check if chat already exists
      const userChatsRef = ref(database, `userChats/${currentUser.uid}`);
      const snapshot = await get(userChatsRef);
      
      let existingChatId: string | null = null;
      
      snapshot.forEach((childSnapshot) => {
        const chatData = childSnapshot.val();
        if (chatData.participants && 
            chatData.participants.includes(otherUserId)) {
          existingChatId = childSnapshot.key;
        }
      });
      
      if (existingChatId) {
        setSelectedChat(existingChatId);
        return existingChatId;
      }
      
      // Create new chat
      const chatId = uuidv4();
      const otherUser = users.find(user => user.uid === otherUserId);
      
      if (!otherUser) {
        throw new Error('User not found');
      }
      
      const chatData: ChatRoom = {
        id: chatId,
        type: 'private',
        participants: [currentUser.uid, otherUserId],
        createdAt: Date.now()
      };
      
      // Add chat to both users
      await set(ref(database, `userChats/${currentUser.uid}/${chatId}`), {
        ...chatData,
        otherUser: {
          uid: otherUser.uid,
          username: otherUser.username
        }
      });
      
      await set(ref(database, `userChats/${otherUserId}/${chatId}`), {
        ...chatData,
        otherUser: {
          uid: currentUser.uid,
          username: currentUser.username
        }
      });
      
      setSelectedChat(chatId);
      return chatId;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Send private message
  const sendPrivateMessage = async (chatId: string, text: string, file?: File) => {
    if (!currentUser) return;
    
    try {
      let fileURL = '';
      let fileType: 'image' | 'video' | 'audio' | 'file' | undefined;
      let fileName = '';
      
      if (file) {
        fileName = file.name;
        // Determine file type
        if (file.type.startsWith('image/')) {
          fileType = 'image';
        } else if (file.type.startsWith('video/')) {
          fileType = 'video';
        } else if (file.type.startsWith('audio/')) {
          fileType = 'audio';
        } else {
          fileType = 'file';
        }
        
        // Upload file to storage
        const fileRef = storageRef(storage, `files/${currentUser.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        fileURL = await getDownloadURL(fileRef);
      }
      
      const messageData: Omit<Message, 'id'> = {
        text,
        senderId: currentUser.uid,
        senderName: currentUser.username,
        isAdmin: currentUser.isAdmin,
        timestamp: Date.now(),
        ...(fileURL && { fileURL, fileType, fileName }),
        ...(replyingTo && {
          replyTo: {
            id: replyingTo.id,
            text: replyingTo.text,
            senderName: replyingTo.senderName
          }
        })
      };
      
      const newMessageRef = push(ref(database, `messages/private/${chatId}`));
      await set(newMessageRef, messageData);
      
      // Update last message in chat
      const chat = privateChats.find(chat => chat.id === chatId);
      if (chat) {
        const otherUserId = chat.participants?.find(id => id !== currentUser.uid);
        if (otherUserId) {
          // Update for current user
          await update(ref(database, `userChats/${currentUser.uid}/${chatId}`), {
            lastMessage: {
              text,
              timestamp: Date.now(),
              senderId: currentUser.uid
            }
          });
          
          // Update for other user
          await update(ref(database, `userChats/${otherUserId}/${chatId}`), {
            lastMessage: {
              text,
              timestamp: Date.now(),
              senderId: currentUser.uid
            }
          });
        }
      }
      
      // Clear reply state
      setReplyingTo(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string, isPrivate: boolean, chatId?: string) => {
    if (!currentUser) return;
    
    try {
      const path = isPrivate 
        ? `messages/private/${chatId}/${messageId}`
        : `messages/public/${messageId}`;
      
      await remove(ref(database, path));
      
      toast({
        title: "Message deleted",
        description: "Your message has been deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Search users
  const searchUsers = (query: string) => {
    if (!query) return [];
    
    return users.filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    currentUser,
    loading,
    publicMessages,
    privateChats,
    privateMessages,
    users,
    selectedChat,
    replyingTo,
    signUp,
    signIn,
    signOut,
    sendPublicMessage,
    createPrivateChat,
    sendPrivateMessage,
    deleteMessage,
    searchUsers,
    setSelectedChat,
    setReplyingTo
  };
}