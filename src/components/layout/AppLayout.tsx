import { Outlet } from "react-router-dom";
import { AppSidebar } from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Button } from "../ui/button";
import { Menu, X } from "lucide-react";

export function AppLayout() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {isMobile ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
          
          <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
            <AppSidebar />
          </div>
          
          <main className="flex-1 overflow-auto p-4 pt-16">
            <Outlet />
          </main>
        </>
      ) : (
        <>
          <div className="h-full w-64">
            <AppSidebar />
          </div>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </>
      )}
    </div>
  );
}