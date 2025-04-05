import { useEffect } from "react";
import { useChannelStore } from "@/store/channelStore";
import { ChannelList } from "@/components/channels/ChannelList";
import { mockChannels } from "@/lib/mock-data";

const HistoryPage = () => {
  const { channels, recentlyWatched, setChannels } = useChannelStore((state) => ({
    channels: state.channels,
    recentlyWatched: state.recentlyWatched,
    setChannels: state.setChannels,
  }));

  // Load mock data for now
  useEffect(() => {
    if (channels.length === 0) {
      setChannels(mockChannels);
    }
  }, [channels.length, setChannels]);

  const recentChannels = channels.filter(channel => 
    recentlyWatched.includes(channel.id)
  ).sort((a, b) => {
    return recentlyWatched.indexOf(a.id) - recentlyWatched.indexOf(b.id);
  });

  return (
    <main className="w-full min-h-screen space-y-6">
      <h1 className="text-3xl font-bold">Recently Watched</h1>
      
      {recentChannels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-xl font-medium mb-2">No watch history</h2>
          <p className="text-muted-foreground mb-4">
            Channels you watch will appear here.
          </p>
        </div>
      ) : (
        <ChannelList channels={recentChannels} />
      )}
    </main>
  );
};

export default HistoryPage;