// src/app/layout.jsx

import localFont from "next/font/local";
import "./globals.css";
// import Navbar from "@/components/custom/navbar";
import ReportSidebar from "@/components/custom/report-sidebar";
// import { SessionProvider } from "next-auth/react";
import {
  useSidebar,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export const metadata = {
  title: "RSP Desk",
  description: "Digital Repository of RSP Desk",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="{`${inter.className} flex item-start justify-between`}">
      {/* <SessionProvider> */}
        <SidebarProvider defaultOpen={false}>
          <div className="hiddenlg:flex border-r">
            <ReportSidebar />
            {/* <main className="">    */}
            <SidebarTrigger />
          </div>
<main className="grid w-full h-screen ">
{children}
</main>
         

          {/* </main> */}
        </SidebarProvider>
        {/* </SessionProvider> */}
      </body>
    </html>
  );
}
