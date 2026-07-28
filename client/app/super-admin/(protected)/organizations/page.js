"use client";

import React from "react";
import { useGetOrganizationsQuery } from "@/services/api/superAdminApi";
import { Building2, Mail, Phone, MapPin, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuperAdminOrganizations() {
  const router = useRouter();
  const { data, isLoading } = useGetOrganizationsQuery();

  if (isLoading) return <div className="p-8">Loading organizations...</div>;

  const orgs = data?.organizations || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Organizations</h1>
        <p className="text-slate-500 mt-2">Manage all registered organizations on the platform.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300">
                <th className="p-4">Organization</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Location</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orgs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">No organizations found.</td>
                </tr>
              ) : (
                orgs.map((org) => (
                  <tr 
                    key={org.id} 
                    onClick={() => router.push(`/super-admin/organizations/${org.id}`)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                          {org.logo ? (
                            <img src={org.logo} alt={org.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Building2 size={20} />
                          )}
                        </div>
                        <div className="font-medium text-slate-900 dark:text-white">{org.name}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2"><Mail size={14}/> {org.email}</div>
                        <div className="flex items-center gap-2"><Phone size={14}/> {org.phone}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 max-w-xs">
                        <MapPin size={14} className="mt-0.5 shrink-0"/> 
                        <span className="truncate">{org.city}, {org.state}, {org.country}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <ChevronRight size={20} className="text-slate-400 group-hover:text-rose-500 transition-colors inline-block" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
