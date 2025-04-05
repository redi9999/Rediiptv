import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";

export default function Logout() {
  const { toast } = useToast();

  useEffect(() => {
    const signOut = async () => {
      try {
        await fine.auth.signOut();
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to log out.",
          variant: "destructive",
        });
      }
    };

    signOut();
  }, [toast]);

  return <Navigate to="/" />;
}