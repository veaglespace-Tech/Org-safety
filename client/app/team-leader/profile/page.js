"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { User, Phone, ShieldPlus, Save, Loader2, CheckCircle2, Mail, Lock, Building2, MapPin, Camera, Trash2, AlertTriangle, X } from "lucide-react";
import { authApi } from "@/services/api/authApi";
import { orgApi } from "@/services/api/orgApi";
import { setCurrentUser, logout } from "@/store/slices/authSlice";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProfileSettingsPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();
  const [updateMe, { isLoading }] = authApi.useUpdateMeMutation();
  const [deleteMe, { isLoading: isDeleting }] = authApi.useDeleteMeMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [updateOrgDetails, { isLoading: isOrgLoading }] = orgApi.useUpdateOrgDetailsMutation();
  const [updateOrgLogo] = orgApi.useUpdateOrgLogoMutation();
  
  const [activeTab, setActiveTab] = useState("profile");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    emergencyContact: "",
    password: "",
    profilePhoto: "",
    city: "",
    gender: "",
    bloodGroup: "",
    currentAddress: "",
    permanentAddress: "",
  });

  const [orgData, setOrgData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    logo: "",
  });

  const [orgLogoFile, setOrgLogoFile] = useState(null);

  const fileInputRef = useRef(null);
  const orgFileInputRef = useRef(null);
  const [status, setStatus] = useState("idle");

  const { data: meData } = authApi.useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  
  const currentUser = meData?.user || user;
  const currentOrg = currentUser?.organization;

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        emergencyContact: currentUser.emergencyContact || "",
        password: "",
        profilePhoto: currentUser.profilePhoto || "",
        city: currentUser.city || "",
        gender: currentUser.gender || "",
        bloodGroup: currentUser.bloodGroup || "",
        currentAddress: currentUser.currentAddress || "",
        permanentAddress: currentUser.permanentAddress || "",
      });
      if (currentOrg) {
        setOrgData({
          name: currentOrg.name || "",
          email: currentOrg.email || "",
          phone: currentOrg.phone || "",
          address: currentOrg.address || "",
          city: currentOrg.city || "",
          state: currentOrg.state || "",
          country: currentOrg.country || "",
          logo: currentOrg.logo || "",
        });
      }
    }
  }, [currentUser, currentOrg]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOrgChange = (e) => {
    setOrgData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be smaller than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOrgFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be smaller than 2MB");
        return;
      }
      setOrgLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrgData((prev) => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === "org") {
      try {
        setStatus("idle");
        
        let response = null;
        
        if (orgData.name) {
          response = await updateOrgDetails(orgData).unwrap();
        }
        
        if (orgLogoFile) {
          const form = new FormData();
          form.append("logo", orgLogoFile);
          const logoResponse = await updateOrgLogo(form).unwrap();
          if (!response) response = logoResponse;
        }
        
        if (response?.organization) {
          dispatch(setCurrentUser({
            ...currentUser,
            organization: { ...currentUser.organization, ...response.organization },
            organizations: { ...currentUser.organization, ...response.organization }
          }));
        }
        
        setStatus("success");
        toast.success("Organization updated successfully!");
        setTimeout(() => setStatus("idle"), 3000);
      } catch (err) {
        console.error("Failed to update org", err);
        setStatus("error");
        toast.error("Failed to update organization.");
        setTimeout(() => setStatus("idle"), 3000);
      }
      return;
    }

    try {
      setStatus("idle");
      const response = await updateMe(formData).unwrap();
      
      dispatch(setCurrentUser(response.user));
      
      setStatus("success");
      toast.success("Profile updated successfully!");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error("Failed to update profile", err);
      setStatus("error");
      toast.error("Failed to update profile.");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm.');
      return;
    }
    try {
      await deleteMe().unwrap();
      dispatch(logout());
      toast.success("Account deleted successfully.");
      setShowDeleteModal(false);
      router.replace("/login");
    } catch (err) {
      console.error("Failed to delete account", err);
      toast.error("Failed to delete account. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-blue-600" />
          Settings
        </h1>
        <p className="text-slate-500 mt-2">
          Update your profile information and system settings.
        </p>
      </div>

      {/* Tabs removed for team-leader layout */}

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Profile Photo Uploader */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {formData.profilePhoto ? (
                      <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="text-center sm:text-left pt-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Profile Picture</h3>
                  <p className="text-sm text-slate-500 mt-1">Upload a new avatar. JPG, PNG or GIF (Max 2MB).</p>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    Change Photo
                  </button>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    />
                  </div>
                </div>

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
                    />
                  </div>
                </div>

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
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Phone Number
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
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Current Address
                  </label>
                  <textarea
                    name="currentAddress"
                    rows="2"
                    value={formData.currentAddress || ""}
                    onChange={handleChange}
                    className="block w-full p-4 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Permanent Address
                  </label>
                  <textarea
                    name="permanentAddress"
                    rows="2"
                    value={formData.permanentAddress || ""}
                    onChange={handleChange}
                    className="block w-full p-4 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="md:col-span-2 mt-4">
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
                  />
                </div>
                <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium">
                  This number receives the WhatsApp message and Phone Call when you press the SOS Button.
                </p>
              </div>
            </div>
          )}

          {activeTab === "org" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Organization Logo Uploader */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                <div className="relative group cursor-pointer" onClick={() => orgFileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {orgData.logo ? (
                      <img src={orgData.logo} alt="Organization Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={orgFileInputRef}
                    onChange={handleOrgFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="text-center sm:text-left mt-2 sm:mt-0">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Organization Logo</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                    Upload your organization's logo. Recommended size is 256x256px.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Organization Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      value={orgData.name}
                      onChange={handleOrgChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Organization Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={orgData.email}
                      onChange={handleOrgChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Organization Phone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="phone"
                      required
                      value={orgData.phone}
                      onChange={handleOrgChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    City
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="city"
                      value={orgData.city}
                      onChange={handleOrgChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    State
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="state"
                      value={orgData.state}
                      onChange={handleOrgChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="country"
                      value={orgData.country}
                      onChange={handleOrgChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  rows="3"
                  value={orgData.address}
                  onChange={handleOrgChange}
                  className="block w-full p-4 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>
            </div>
          )}

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <div>
              {status === "success" && (
                <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Saved successfully!
                </span>
              )}
              {status === "error" && (
                <span className="text-red-500 text-sm font-semibold">
                  Failed to save changes. Try again.
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

      {/* Danger Zone */}
      <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-red-200 dark:border-red-900/50 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Once you delete your account, there is no going back. All your data will be permanently removed.
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => { setDeleteConfirmText(""); setShowDeleteModal(true); }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete My Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          {/* Modal */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Account</h3>
                <p className="text-sm text-slate-500">This action is permanent and irreversible.</p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-4 mb-5">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                ⚠️ This will permanently delete your account, all your data, and remove you from the organization.
              </p>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Type <span className="font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="block w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all font-mono"
                autoComplete="off"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== "DELETE"}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900/50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-semibold text-sm transition-all"
              >
                {isDeleting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="w-4 h-4" /> Delete Account</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
