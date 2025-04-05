export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group: string;
  epgId?: string;
}

export interface ChannelGroup {
  id: string;
  name: string;
  channels: Channel[];
}

export interface UserPreferences {
  favorites: string[]; // Channel IDs
  recentlyWatched: string[]; // Channel IDs
}