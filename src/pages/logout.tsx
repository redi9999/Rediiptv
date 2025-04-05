import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";

const Logout = () => {
  const { toast } = useToast();

  useEffect(() => {
    const signOut = async () => {
      try {
        await fine.auth.signOut();
        toast({
          title: "Success",
          description: "You have been signed out successfully.",
        });
      } catch (error) {
        console.error("Error signing out:", error);
      }
    };

    signOut();
  }, [toast]);

  return <Navigate to="/" />;
};

export default Logout;