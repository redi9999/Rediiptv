//use this component to create a sidebar for your application
// place it in main.tsx file
//adjust the items based on route paths
import { Home, MessageSquare, LogIn, UserPlus, LogOut } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { fine } from "@/lib/fine";

const getItems = (isLoggedIn: boolean) => {
  const baseItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Chat",
      url: "/chat",
      icon: MessageSquare,
    },
  ];

  const authItems = isLoggedIn
    ? [
        {
          title: "Logout",
          url: "/logout",
          icon: LogOut,
        },
      ]
    : [
        {
          title: "Login",
          url: "/login",
          icon: LogIn,
        },
        {
          title: "Sign Up",
          url: "/signup",
          icon: UserPlus,
        },
      ];

  return [...baseItems, ...authItems];
};

export function AppSidebar() {
  const { data: session } = fine.auth.useSession();
  const isLoggedIn = !!session?.user;
  const items = getItems(isLoggedIn);

  return (
    <Sidebar className="bg-primary">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}