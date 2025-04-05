import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fine } from "@/lib/fine";
import { MessageSquare, Users, FileText, Image, Video, Mic } from "lucide-react";

const Index = () => {
  const { data: session } = fine.auth.useSession();
  const isLoggedIn = !!session?.user;

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Welcome to RediIPTV Chat</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Connect with other users in real-time through our advanced chat platform
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <MessageSquare className="h-10 w-10 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Real-time Chat</h2>
            <p className="text-muted-foreground">
              Communicate instantly with other users in our public chat room or via private messages
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <FileText className="h-10 w-10 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Rich Media Sharing</h2>
            <p className="text-muted-foreground">
              Share images, videos, audio files, and documents directly in your conversations
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <Users className="h-10 w-10 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Private Messaging</h2>
            <p className="text-muted-foreground">
              Send direct messages to specific users for private conversations
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <Image className="h-5 w-5 text-blue-500" />
            <span>Image sharing</span>
          </div>
          <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <Video className="h-5 w-5 text-red-500" />
            <span>Video sharing</span>
          </div>
          <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <Mic className="h-5 w-5 text-green-500" />
            <span>Audio sharing</span>
          </div>
          <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <FileText className="h-5 w-5 text-orange-500" />
            <span>File sharing</span>
          </div>
        </div>

        {isLoggedIn ? (
          <Button asChild size="lg">
            <Link to="/chat">Go to Chat</Link>
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Index;