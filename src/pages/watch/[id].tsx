import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChannelStore } from "@/store/channelStore";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { mockChannels } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const WatchPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    channels, 
    setChannels,
    favorites,
    addToFavorites,
    removeFromFavorites
  } = useChannelStore((state) => ({
    channels: state.channels,
    setChannels: state.setChannels,
    favorites: state.favorites,
    addToFavorites: state.addToFavorites,
    removeFromFavorites: state.removeFromFavorites
  }));

  // Load mock data for now
  useEffect(() => {
    if (channels.length === 0) {
      setChannels(mockChannels);
    }
  }, [channels.length, setChannels]);

  const channel = channels.find(c => c.id === id);
  const isFavorite = channel ? favorites.includes(channel.id) : false;

  const toggleFavorite = () => {
    if (!channel) return;
    
    if (isFavorite) {
      removeFromFavorites(channel.id);
    } else {
      addToFavorites(channel.id);
    }
  };

  if (!channel) {
    return (
      <main className="w-full min-h-screen p-6 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Channel not found</h1>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{channel.name}</h1>
        <Button 
          variant="outline" 
          size="icon"
          onClick={toggleFavorite}
          className={cn(
            isFavorite && "text-red-500"
          )}
        >
          <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
        </Button>
      </div>
      
      <VideoPlayer channel={channel} />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Channel Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p>{channel.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Category</p>
            <p>{channel.group}</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default WatchPage;