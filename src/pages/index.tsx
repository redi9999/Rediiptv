import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { fine } from "@/lib/fine";

const Index = () => {
  const { data: session } = fine.auth.useSession();

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Welcome to RediIPTV Chat</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Connect with other users in real-time through our chat platform
        </p>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted p-6 rounded-lg text-left">
              <h2 className="text-xl font-semibold mb-2">Public Chat</h2>
              <p className="mb-4">Join the community discussion with all users</p>
            </div>
            
            <div className="bg-muted p-6 rounded-lg text-left">
              <h2 className="text-xl font-semibold mb-2">Private Messages</h2>
              <p className="mb-4">Send direct messages to specific users</p>
            </div>
            
            <div className="bg-muted p-6 rounded-lg text-left">
              <h2 className="text-xl font-semibold mb-2">Media Sharing</h2>
              <p className="mb-4">Share images, videos, audio and files</p>
            </div>
            
            <div className="bg-muted p-6 rounded-lg text-left">
              <h2 className="text-xl font-semibold mb-2">Message Interactions</h2>
              <p className="mb-4">Reply to messages, copy text, and more</p>
            </div>
          </div>
          
          {session ? (
            <Button asChild size="lg" className="mt-6">
              <Link to="/chat">
                <MessageSquare className="mr-2 h-5 w-5" />
                Open Chat
              </Link>
            </Button>
          ) : (
            <div className="space-y-4 mt-6">
              <p className="text-muted-foreground">Sign in to access the chat</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Create Account</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Index;