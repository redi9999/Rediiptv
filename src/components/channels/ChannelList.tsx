import { Channel } from "@/types/iptv";
import { ChannelCard } from "./ChannelCard";
import { Input } from "../ui/input";
import { useState } from "react";

interface ChannelListProps {
  channels: Channel[];
  title?: string;
}

export function ChannelList({ channels, title }: ChannelListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      
      <Input
        placeholder="Search channels..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />
      
      {filteredChannels.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No channels found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredChannels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      )}
    </div>
  );
}