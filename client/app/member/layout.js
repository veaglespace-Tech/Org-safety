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
        <div className="p-6 pb-2 border-b border-slate-800/50">
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span className="bg-blue-600 p-1.5 rounded-lg text-white">{displayRole.charAt(0)}</span>
            {displayRole} Portal
          </h1>
          
          <div className="mt-6 p-3.5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-inner flex flex-col gap-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/3"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">Powered By</span>
            <div className="flex items-center gap-2 relative z-10">
              {(user?.organizations?.logo || user?.organization?.logo) && (
                <img 
                  src={user?.organizations?.logo || user?.organization?.logo} 
                  alt="Org Logo" 
                  className="w-6 h-6 rounded border border-slate-700/50 object-cover bg-white"
                />
              )}
              <span className="text-sm font-bold text-blue-400 truncate tracking-wide flex-1">
                {user?.organizations?.name || user?.organization?.name || "Pathak Name"}
              </span>
            </div>
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
