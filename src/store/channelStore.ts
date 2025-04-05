import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Channel, ChannelGroup } from '@/types/iptv';

interface ChannelState {
  channels: Channel[];
  groups: ChannelGroup[];
  favorites: string[];
  currentChannel: Channel | null;
  recentlyWatched: string[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setChannels: (channels: Channel[]) => void;
  setGroups: (groups: ChannelGroup[]) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  addToFavorites: (channelId: string) => void;
  removeFromFavorites: (channelId: string) => void;
  addToRecentlyWatched: (channelId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChannelStore = create<ChannelState>()(
  persist(
    (set) => ({
      channels: [],
      groups: [],
      favorites: [],
      currentChannel: null,
      recentlyWatched: [],
      isLoading: false,
      error: null,
      
      setChannels: (channels) => set({ channels }),
      setGroups: (groups) => set({ groups }),
      setCurrentChannel: (channel) => set({ currentChannel: channel }),
      addToFavorites: (channelId) => 
        set((state) => ({ 
          favorites: [...state.favorites, channelId] 
        })),
      removeFromFavorites: (channelId) => 
        set((state) => ({ 
          favorites: state.favorites.filter(id => id !== channelId) 
        })),
      addToRecentlyWatched: (channelId) => 
        set((state) => {
          const filtered = state.recentlyWatched.filter(id => id !== channelId);
          return { 
            recentlyWatched: [channelId, ...filtered].slice(0, 10) 
          };
        }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'iptv-channel-storage',
      partialize: (state) => ({ 
        favorites: state.favorites,
        recentlyWatched: state.recentlyWatched 
      }),
    }
  )
);