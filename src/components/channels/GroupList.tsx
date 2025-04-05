import { ChannelGroup } from "@/types/iptv";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { ChannelCard } from "./ChannelCard";

interface GroupListProps {
  groups: ChannelGroup[];
}

export function GroupList({ groups }: GroupListProps) {
  return (
    <Accordion type="multiple" className="w-full">
      {groups.map((group) => (
        <AccordionItem key={group.id} value={group.id}>
          <AccordionTrigger className="text-lg font-medium">
            {group.name} ({group.channels.length})
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pt-2">
              {group.channels.map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}