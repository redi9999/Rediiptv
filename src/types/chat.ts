export interface User {
  uid: string;
  email: string;
  username: string;
  isAdmin: boolean;
  photoURL?: string;
  createdAt: number;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  isAdmin: boolean;
  timestamp: number;
  fileURL?: string;
  fileType?: 'image' | 'video' | 'audio' | 'file';
  fileName?: string;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
}

export interface ChatRoom {
  id: string;
  type: 'public' | 'private';
  participants?: string[];
  lastMessage?: {
    text: string;
    timestamp: number;
    senderId: string;
  };
  createdAt: number;
}