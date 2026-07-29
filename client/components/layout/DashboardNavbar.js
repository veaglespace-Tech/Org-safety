"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { logout } from "@/store/slices/authSlice";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function DashboardNavbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex-1"></div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">
              {user?.role === 'admin' ? 'Admin Portal' : (user?.role || 'Member')}
            </p>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="ml-2 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
}
