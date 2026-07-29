"use client";

import React from "react";
import Link from "next/link";
import { LayoutDashboard, ShieldAlert, UserCog } from "lucide-react";
import { useSelector } from "react-redux";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import { usePathname } from "next/navigation";

export default function OrgLayout({ children }) {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { name: "Dashboard", href: "/org/dashboard", icon: LayoutDashboard },
    { name: "तिची सुरक्षा", href: "/org/tich-surksha", icon: ShieldAlert },
    { name: "Profile Settings", href: "/org/profile", icon: UserCog },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 dark:bg-slate-900 border-r border-slate-800 flex flex-col transition-all z-20">
        <div className="flex flex-col items-center justify-center h-24 border-b border-slate-800/80">
          <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity w-full px-4">
            <h1 className="text-xl sm:text-[22px] font-black tracking-tight text-white text-center drop-shadow-md">
              ढोल - ताशा - <br/><span className="text-blue-500">महासंघ</span>
            </h1>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-white" : "text-slate-400"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout is now in DashboardNavbar */}
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <DashboardNavbar />
        <div className="flex-1 overflow-y-auto w-full flex flex-col relative">
          <div className="flex-1">
            {children}
          </div>
          <Footer forceShow={true} />
        </div>
      </main>
    </div>
  );
}
