import { useEffect } from "react";
import { useChannelStore } from "@/store/channelStore";
import { ChannelList } from "@/components/channels/ChannelList";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { mockChannels } from "@/lib/mock-data";

const Index = () => {
  const { 
    channels, 
    favorites, 
    recentlyWatched,
    setChannels,
    isLoading
  } = useChannelStore((state) => ({
    channels: state.channels,
    favorites: state.favorites,
    recentlyWatched: state.recentlyWatched,
    setChannels: state.setChannels,
    isLoading: state.isLoading
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

  const recentChannels = channels.filter(channel => 
    recentlyWatched.includes(channel.id)
  );

  return (
    <main className="w-full min-h-screen space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome to Redi IPTV</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <p>Loading channels...</p>
        </div>
      ) : (
        <>
          {recentChannels.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Recently Watched</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/history">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {recentChannels.slice(0, 4).map((channel) => (
                  <ChannelList key="recent" channels={recentChannels.slice(0, 4)} />
                ))}
              </div>
            </section>
          )}

          {favoriteChannels.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Your Favorites</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/favorites">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <ChannelList channels={favoriteChannels.slice(0, 8)} />
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">All Channels</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/channels">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <ChannelList channels={channels.slice(0, 8)} />
          </section>
        </>
      )}
    </main>
  );
};

export default Index;