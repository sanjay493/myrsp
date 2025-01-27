"use client";

import { FastForward,Home,Blocks,Calendar, FileTerminal, Inbox, Search,Bug, Settings,Trophy,Cpu,Fingerprint,User  } from "lucide-react"
import {Sidebar,SidebarContent,SidebarFooter,SidebarGroup,SidebarHeader,SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,SidebarGroupContent } from "@/components/ui/sidebar"
    import React, { useState } from 'react';
  // import { useSession } from 'next-auth/react';

import Link from 'next/link';
   
// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
    {
      title: "Performance",
      url: "/performance",
      icon: FileTerminal,
    },
    {
      title: "Techno Parameters",
      url: "/techno",
      icon: Cpu,
    },
    {
      title: "Highlights",
      url: "/highlights",
      icon: Trophy,
    },
    {
      title: "Issues",
      url: "/issues",
      icon: Bug,
    },
    {
      title: "Records",
      url: "/records",
      icon: Trophy,
    },
    {
      title: "Auth",
      url: "/update",
      icon: Fingerprint ,
    },
    // {
    //   title: "AllReports",
    //   url: "/allReports_link",
    //   icon: User ,
    // }
    // ,
    {
      title: "Annual_Production",
      url: "/yrlyProdnWithCapUt",
      icon: Settings ,
    }
    ,
    {
      title: "Periodic Performance",
      url: "/getMthsProdnPerf",
      icon: Settings ,
    } ,
    {
      title: "Playground",
      url: "/playground",
      icon: FastForward ,
    }
  ]
export default function ReportSidebar(){
  // const { data: session } = useSession();
  // console.log(session)  getMthsProdnPerf

  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  }
return (
 <div className="">
    <Sidebar collapsible="icon">
        {/* <SidebarHeader /> */}
        <SidebarContent>
            
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
         
           
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuButton>
               {/* Toggle Dark/Light Mode Button */}
            
        <a
          onClick={toggleDarkMode}
          className="rounded-full p-2 text-gray-800 dark:text-white focus:outline-none"
        >
          {darkMode ? '🌙 Dark' : '☀️ Light'}
        </a>
       
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
    </div>
)
}