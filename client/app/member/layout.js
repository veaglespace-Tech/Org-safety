"use client";

import React from "react";
import Link from "next/link";
import { LogOut, LayoutDashboard, ShieldAlert, UserCog, Users } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { useRouter, usePathname } from "next/navigation";
import { ROLE_LABELS, normalizeRole } from "@/utils/roles";

export default function MemberLayout({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const userRole = user?.role ? normalizeRole(user.role) : null;
  const displayRole = userRole && ROLE_LABELS[userRole] ? ROLE_LABELS[userRole] : "Member";

  const navItems = [
    { name: "तिची सुरक्षा", href: "/member/tich-surksha", icon: ShieldAlert },
    { name: "Profile Settings", href: "/member/profile", icon: UserCog },
  ];

  if (userRole === 'ORG_ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'admin') {
    navItems.unshift({ name: "Dashboard", href: "/member/dashboard", icon: LayoutDashboard });
    navItems.splice(2, 0, { name: "Users", href: "/member/users", icon: Users });
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 dark:bg-slate-900 border-r border-slate-800 flex flex-col transition-all z-20">
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
            <img
              src={user?.organizations?.logo || user?.organization?.logo || "/logo1-clean.webp"}
              alt="Organization Logo"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-black tracking-tight text-white truncate">
              {user?.organizations?.name || user?.organization?.name || "ढोल - ताशा - महासंघ"}
            </h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{displayRole} Portal</p>
          </div>
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
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-white" : "text-slate-400"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-rose-400 hover:text-white hover:bg-rose-500 font-bold px-4 py-3 rounded-xl transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto w-full h-screen">
        {children}
      </main>
    </div>
  );
}
