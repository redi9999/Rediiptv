import { Toaster as Sonner } from "@/components/ui/sonner";

import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { TooltipProvider } from "./components/ui/tooltip";

import { ThemeProvider } from "./components/layout/theme-provider";
import { AppSidebar } from "./components/layout/Sidebar";
import { ProtectedRoute } from "./components/auth/route-components";
import "./index.css";
import Index from "./pages";
import LoginForm from "./pages/login";
import SignupForm from "./pages/signup";
import Logout from "./pages/logout";
import ChatPage from "./pages/chat";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <BrowserRouter>
          <div className="flex h-screen">
            <AppSidebar />
            <div className="flex-1 overflow-auto">
              <Routes>
                <Route path='/' element={<Index />} />
                <Route path='/login' element={<LoginForm />} />
                <Route path='/signup' element={<SignupForm />} />
                <Route path='/logout' element={<Logout />} />
                <Route path='/chat' element={<ProtectedRoute Component={ChatPage} />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
        <Sonner />
        <Toaster />
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);