"use client";

import React from "react";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";

export default function Footer({ forceShow = false }) {
  const { user } = useSelector((state) => state.auth);
  const pathname = usePathname();

  const isDashboardRoute = 
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/org") ||
    pathname?.startsWith("/member") ||
    pathname?.startsWith("/team-leader") ||
    (pathname?.startsWith("/super-admin") && pathname !== "/super-admin/login");

  if (!forceShow && isDashboardRoute) {
    return null;
  }
  const orgName = user?.organizations?.name || user?.organization?.name || "ढोल - ताशा - महासंघ";

  return (
    <footer id="dashboard-footer" className="w-full py-2 mt-auto border-t border-border bg-background flex flex-col items-center justify-center gap-1">
      <p className="text-[10px] text-slate-500 font-medium tracking-widest text-center px-4">
        All Rights Reserved. &copy; 2026 Veagle Space Technology Pvt. Ltd.
      </p>
    </footer>
  );
}
