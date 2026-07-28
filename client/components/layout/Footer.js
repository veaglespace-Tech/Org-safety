"use client";

import React from "react";
import { useSelector } from "react-redux";

export default function Footer() {
  const { user } = useSelector((state) => state.auth);
  const orgName = user?.organizations?.name || user?.organization?.name || "Pathak";

  return (
    <footer id="dashboard-footer" className="w-full py-8 mt-auto border-t border-slate-800 bg-slate-950 flex flex-col items-center justify-center gap-4">
      <p className="text-sm sm:text-base md:text-lg font-black text-slate-400 tracking-wider text-center px-4 mb-1">
        Powered By <span className="text-slate-300">{orgName}</span>
      </p>
      <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium tracking-widest uppercase text-center px-4">
        Designed and developed by &copy; {new Date().getFullYear()} Veagle Space Pvt. Ltd. All rights reserved.
      </p>
    </footer>
  );
}
