import { useEffect, useRef } from "react";
import { Channel } from "@/types/iptv";
import { useChannelStore } from "@/store/channelStore";
import { Card } from "../ui/card";

interface VideoPlayerProps {
  channel: Channel;
}

export function VideoPlayer({ channel }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const addToRecentlyWatched = useChannelStore((state) => state.addToRecentlyWatched);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = channel.url;
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error);
      });
      
      // Add to recently watched
      addToRecentlyWatched(channel.id);
    }
    
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
      }
    };
  }, [channel, addToRecentlyWatched]);

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full bg-black">
        <video
          ref={videoRef}
          className="h-full w-full"
          controls
          autoPlay
          playsInline
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-bold">{channel.name}</h2>
        <p className="text-sm text-muted-foreground">{channel.group}</p>
      </div>
    </Card>
  );
}