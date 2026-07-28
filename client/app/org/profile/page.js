"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { User, Phone, ShieldPlus, Save, Loader2, CheckCircle2, Mail, Lock } from "lucide-react";
import { authApi } from "@/services/api/authApi";
import { setCurrentUser } from "@/store/slices/authSlice";

export default function ProfileSettingsPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [updateMe, { isLoading }] = authApi.useUpdateMeMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    emergencyContact: "",
    password: "",
  });
  
  const [status, setStatus] = useState("idle"); // idle, success, error

  const { data: meData, isLoading: isFetchingMe } = authApi.useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true, // Always fetch fresh data when visiting profile
  });
  
  // Use the freshly fetched user from the database if available, otherwise fallback to Redux cache
  const currentUser = meData?.user || user;

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        emergencyContact: currentUser.emergencyContact || "",
        password: "",
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatus("idle");
      const response = await updateMe(formData).unwrap();
      
      // Update Redux state with new user info
      dispatch(setCurrentUser(response.user));
      
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error("Failed to update profile", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-blue-600" />
          Profile Settings
        </h1>
        <p className="text-slate-500 mt-2">
          Update your personal information and emergency contacts for the SOS dispatch system.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="name"
                required
                value={formData.name || ""}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email || ""}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              New Password (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Leave blank to keep current password"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">Only fill this if you want to change your password.</p>
          </div>

          {/* Contact Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Your Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone || ""}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="+91 9876543210"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">Include country code (e.g. +91)</p>
          </div>

          {/* Emergency Contact Field */}
          <div>
            <label className="block text-sm font-semibold text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1.5">
              <ShieldPlus className="w-4 h-4" />
              Emergency SOS Contact
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-rose-400" />
              </div>
              <input
                type="text"
                name="emergencyContact"
                required
                value={formData.emergencyContact || ""}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-rose-200 dark:border-rose-900/50 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="+91 9421680994"
              />
            </div>
            <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium">
              This number will receive the WhatsApp message and Phone Call when you press the SOS Button.
            </p>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <div>
              {status === "success" && (
                <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Profile updated successfully!
                </span>
              )}
              {status === "error" && (
                <span className="text-red-500 text-sm font-semibold">
                  Failed to update profile. Try again.
                </span>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
