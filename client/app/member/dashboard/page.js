"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Shield, Bell, Calendar, ChevronRight, Share2, MessageCircle, Mail, Copy, Check } from "lucide-react";
import Link from "next/link";
import { ROLE_LABELS, normalizeRole } from "@/utils/roles";

export default function MemberDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const userRole = user?.role ? normalizeRole(user.role) : null;
  const displayRole = userRole && ROLE_LABELS[userRole] ? ROLE_LABELS[userRole] : "Member";

  const rawOrgId = user?.organization_id;
  const referralCode = rawOrgId ? `REF-${String(rawOrgId).padStart(8, '0')}` : '';
  const referralLink = `${origin}/register?ref=${referralCode}`;
  const shareText = encodeURIComponent(`Join our organization on the Safety Portal!\nRegister here: `);
  const whatsappUrl = `https://wa.me/?text=${shareText}${encodeURIComponent(referralLink)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent("Join our Organization Safety Portal")}&body=${shareText}${encodeURIComponent(referralLink)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="page-shell relative min-h-screen px-4 md:px-8 py-8 transition-colors duration-500 flex flex-col lg:flex-row gap-8">
      {/* Background decorative orbs (similar to register page) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="page-shell-orb-primary absolute left-[-6%] top-24 h-80 w-80 rounded-full blur-[120px]" />
        <div className="page-shell-orb-secondary absolute right-[-8%] top-36 h-72 w-72 rounded-full blur-[120px]" />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 w-full relative z-10">
        <h1 className="text-3xl font-black mb-6 text-slate-950 dark:text-white tracking-tight">{displayRole} Dashboard</h1>
        
        {/* Organization Banner */}
        <div className="surface-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8 mb-8 border border-slate-200/50 dark:border-slate-800/50">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2.5 shadow-lg border border-slate-200/60 flex items-center justify-center shrink-0">
              <img
                src={user?.organizations?.logo || user?.organization?.logo || "/logo1-clean.webp"}
                alt="Organization Logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-slate-950 dark:text-white tracking-tight">
                {user?.organizations?.name || user?.organization?.name || "ढोल - ताशा - महासंघ"}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-xl text-base sm:text-lg leading-relaxed font-medium">
                Check out your organization's updates, view your team members, and manage your attendance securely.
              </p>
            </div>
          </div>
        </div>

        {/* Admin Referral Link Section */}
        {(userRole === 'ORG_ADMIN') && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Share2 size={20} className="text-blue-500" />
              Organization Reference
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              Share this link or code with your team members so they can easily join your organization.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 justify-between w-full sm:w-auto">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Code:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold text-lg">{referralCode || 'Loading...'}</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center justify-center p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors ml-4"
                  title="Copy Referral Code"
                >
                  {codeCopied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 overflow-hidden">
                <span className="text-slate-600 dark:text-slate-300 truncate text-sm font-medium">
                  {origin ? referralLink : 'Loading link...'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm transition-colors"
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl font-bold text-sm transition-colors"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </a>
                
                <a
                  href={emailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-sm transition-colors"
                >
                  <Mail size={18} />
                  Email
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
