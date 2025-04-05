import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fine } from "@/lib/fine";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

const Logout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Sign out from Firebase
        await auth.signOut();
        
        // Sign out from Fine
        if (fine) {
          await fine.auth.signOut();
        }
        
        toast({
          title: "Success",
          description: "You have been logged out successfully.",
        });
      } catch (error) {
        console.error("Error during logout:", error);
        toast({
          title: "Error",
          description: "Failed to log out. Please try again.",
          variant: "destructive",
        });
      } finally {
        navigate("/");
      }
    };

    handleLogout();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};

export default Logout;