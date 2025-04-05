import { useEffect } from "react";
import { useChannelStore } from "@/store/channelStore";
import { ChannelList } from "@/components/channels/ChannelList";
import { mockChannels } from "@/lib/mock-data";

const FavoritesPage = () => {
  const { channels, favorites, setChannels } = useChannelStore((state) => ({
    channels: state.channels,
    favorites: state.favorites,
    setChannels: state.setChannels,
  }));

  // Load mock data for now
  useEffect(() => {
    if (channels.length === 0) {
      setChannels(mockChannels);
    }
  }, [channels.length, setChannels]);

  const favoriteChannels = channels.filter(channel => 
    favorites.includes(channel.id)
  );

  return (
    <main className="w-full min-h-screen space-y-6">
      <h1 className="text-3xl font-bold">Your Favorites</h1>
      
      {favoriteChannels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-xl font-medium mb-2">No favorites yet</h2>
          <p className="text-muted-foreground mb-4">
            Add channels to your favorites by clicking the heart icon on any channel.
          </p>
        </div>
      ) : (
        <ChannelList channels={favoriteChannels} />
      )}
    </main>
  );
};

export default FavoritesPage;