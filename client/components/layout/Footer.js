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
  const orgName = user?.organizations?.name || user?.organization?.name || "ढोल - ताशा महासंघ";

  return (
    <footer id="dashboard-footer" className="w-full py-4 mt-auto border-t border-border bg-background flex flex-col items-center justify-center gap-2 overflow-hidden">
      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold tracking-wide text-center px-4 w-full">
        Powered By - &quot;शिवमुद्रा ढोल ताशा पथक,पुणे&quot;
      </p>
      <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-widest text-center px-4 w-full max-w-full break-words whitespace-normal leading-relaxed">
        Designed, Developed &amp; All Rights Reserved. &copy; 2026 <br className="sm:hidden" />
        <a href="https://veaglespace.com/" target="_blank" rel="noopener noreferrer" className="hover:underline transition-colors hover:text-blue-600 dark:hover:text-blue-400">Veagle Space Technology Pvt. Ltd.</a>
      </p>
    </footer>
  );
}
