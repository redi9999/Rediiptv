import { Channel } from "@/types/iptv";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Heart, Play } from "lucide-react";
import { useChannelStore } from "@/store/channelStore";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ChannelCardProps {
  channel: Channel;
}

export function ChannelCard({ channel }: ChannelCardProps) {
  const navigate = useNavigate();
  const { favorites, addToFavorites, removeFromFavorites } = useChannelStore(
    (state) => ({
      favorites: state.favorites,
      addToFavorites: state.addToFavorites,
      removeFromFavorites: state.removeFromFavorites,
    })
  );

  const isFavorite = favorites.includes(channel.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      removeFromFavorites(channel.id);
    } else {
      addToFavorites(channel.id);
    }
  };

  const handlePlay = () => {
    navigate(`/watch/${channel.id}`);
  };

  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
      onClick={handlePlay}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {channel.logo ? (
            <img 
              src={channel.logo} 
              alt={channel.name} 
              className="h-10 w-10 object-contain"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {channel.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{channel.name}</h3>
            <p className="text-xs text-muted-foreground">{channel.group}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-2 pt-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1"
          onClick={handlePlay}
        >
          <Play className="mr-1 h-4 w-4" />
          Play
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={toggleFavorite}
          className={cn(
            isFavorite && "text-red-500"
          )}
        >
          <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
        </Button>
      </CardFooter>
    </Card>
  );
}