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
        <div className="flex flex-col items-center justify-center h-28 border-b border-slate-800/80 p-4">
          <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity w-full">
            <div className="w-12 h-12 rounded-xl bg-slate-800 p-1 flex items-center justify-center shrink-0 overflow-hidden border border-slate-700/50">
              {user?.organizations?.logo || user?.organization?.logo ? (
                <img
                  src={user?.organizations?.logo || user?.organization?.logo}
                  alt="Org Logo"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold text-xl rounded-lg">
                  {(user?.organizations?.name || user?.organization?.name || "O")[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <h1 className="text-base font-bold tracking-tight text-white truncate">
                {user?.organizations?.name || user?.organization?.name || "Organization"}
              </h1>
              <p className="text-xs text-blue-400 font-medium">Workspace</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
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
