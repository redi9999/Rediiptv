import { useEffect, useState } from "react";
import { useChannelStore } from "@/store/channelStore";
import { ChannelList } from "@/components/channels/ChannelList";
import { GroupList } from "@/components/channels/GroupList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockChannels } from "@/lib/mock-data";
import { ChannelGroup } from "@/types/iptv";

const ChannelsPage = () => {
  const { channels, setChannels } = useChannelStore((state) => ({
    channels: state.channels,
    setChannels: state.setChannels,
  }));
  
  const [groups, setGroups] = useState<ChannelGroup[]>([]);

  // Load mock data for now
  useEffect(() => {
    if (channels.length === 0) {
      setChannels(mockChannels);
    }
  }, [channels.length, setChannels]);

  // Create groups from channels
  useEffect(() => {
    if (channels.length > 0) {
      const groupMap = new Map<string, ChannelGroup>();
      
      channels.forEach(channel => {
        if (!groupMap.has(channel.group)) {
          groupMap.set(channel.group, {
            id: channel.group,
            name: channel.group,
            channels: []
          });
        }
        
        groupMap.get(channel.group)?.channels.push(channel);
      });
      
      setGroups(Array.from(groupMap.values()));
    }
  }, [channels]);

  return (
    <main className="w-full min-h-screen space-y-6">
      <h1 className="text-3xl font-bold">All Channels</h1>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Channels</TabsTrigger>
          <TabsTrigger value="groups">By Category</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="pt-4">
          <ChannelList channels={channels} />
        </TabsContent>
        <TabsContent value="groups" className="pt-4">
          <GroupList groups={groups} />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default ChannelsPage;