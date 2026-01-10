/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
  deleteAccount,
} from "@/api/admin/profileApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Loader2,
  UserCog,
  ShieldCheck,
  Trash2,
  Building2,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Upload,
  Camera,
  Lock,
  AlertTriangle,
  Home,
} from "lucide-react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const AdminProfilePage = () => {
  const { user, setUser } = useAuth();
  const [password, setPassword] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      const data = res.data as { data: { user: any } };
      setUser(data.data.user);
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      await updateProfile(user);
      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handlePasswordChange = async () => {
    if (password.new_password !== password.new_password_confirmation) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      await changePassword(password);
      toast.success("Password changed!");
      setPassword({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch {
      toast.error("Failed to change password");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const formData = new FormData();
    formData.append("avatar", e.target.files[0]);
    try {
      setUploadingAvatar(true);
      await uploadAvatar(formData);
      toast.success("Avatar uploaded!");
      fetchProfile();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatar();
      toast.success("Avatar deleted");
      fetchProfile();
    } catch {
      toast.error("Failed to delete avatar");
    }
  };

  const handleDeleteAccount = async () => {
    const password = prompt("Enter your password to confirm delete:");
    if (!password) return;
    try {
      await deleteAccount({ password, confirmation: "DELETE" });
      toast.success("Account deleted");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch {
      toast.error("Failed to delete account");
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 dark:border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
                <UserCog className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Edit Profile
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Update your personal information and settings
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="border-gray-300 dark:border-gray-600"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back
            </Button>
          </div>
        </div>

        {/* Profile Information */}
        <form onSubmit={handleUpdate} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          {/* Avatar Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Camera className="text-blue-600 dark:text-emerald-400" size={20} />
              Profile Picture
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
                <img
                  src={user.avatar_url || "/default-avatar.png"}
                  alt="avatar"
                  className="w-32 h-32 rounded-2xl border-4 border-gray-200 dark:border-gray-700 object-cover shadow-lg"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Upload a new avatar or remove the current one
                </p>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer text-sm font-medium">
                      <Upload size={16} />
                      Upload New
                    </div>
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={handleDeleteAvatar}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="text-blue-600 dark:text-emerald-400" size={20} />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <Input
                  value={user.name || ""}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  placeholder="Full Name"
                  required
                  maxLength={50}
                  className="border-gray-200 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <Input
                  value={user.email || ""}
                  maxLength={50}
                  disabled
                  placeholder="Email"
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <Input
                  value={user.phone || ""}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  placeholder="Phone Number"
                  maxLength={15}
                  inputMode="tel"
                  className="border-gray-200 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Zip Code
                </label>
                <Input
                  value={user.zipcode || ""}
                  onChange={(e) => setUser({ ...user, zipcode: e.target.value })}
                  placeholder="Zip Code"
                  maxLength={10}
                  inputMode="numeric"
                  pattern="\d*"
                  className="border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="text-blue-600 dark:text-emerald-400" size={20} />
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Street Address
                </label>
                <Input
                  value={user.address || ""}
                  onChange={(e) => setUser({ ...user, address: e.target.value })}
                  placeholder="Address"
                  maxLength={100}
                  className="border-gray-200 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <Input
                  value={user.city || ""}
                  onChange={(e) => setUser({ ...user, city: e.target.value })}
                  placeholder="City"
                  maxLength={50}
                  className="border-gray-200 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State
                </label>
                <Input
                  value={user.state || ""}
                  onChange={(e) => setUser({ ...user, state: e.target.value })}
                  placeholder="State"
                  maxLength={50}
                  className="border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Company Information (for agents/admins) */}
          {(user.role === "agent" || user.role === "admin") && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 className="text-blue-600 dark:text-emerald-400" size={20} />
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name
                  </label>
                  <Input
                    value={user.company_name || ""}
                    onChange={(e) => setUser({ ...user, company_name: e.target.value })}
                    placeholder="Company Name"
                    maxLength={100}
                    className="border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    License Number
                  </label>
                  <Input
                    value={user.license_number || ""}
                    onChange={(e) => setUser({ ...user, license_number: e.target.value })}
                    placeholder="License Number"
                    maxLength={50}
                    className="border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bio */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              value={user.bio || ""}
              onChange={(e) => setUser({ ...user, bio: e.target.value })}
              placeholder="Write a short bio..."
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-blue-500 dark:focus:border-emerald-500 transition-all"
              rows={4}
              maxLength={1000}
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              {user.bio?.length || 0}/1000 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg"
            >
              <Save size={18} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </form>

        {/* Password Change */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="text-emerald-600 dark:text-emerald-400" size={20} />
              Change Password
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Ensure your account is using a strong password
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <Input
                  type="password"
                  placeholder="Current Password"
                  value={password.current_password}
                  autoComplete="new-password"
                  maxLength={50}
                  onChange={(e) =>
                    setPassword({ ...password, current_password: e.target.value })
                  }
                  className="border-gray-200 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <Input
                  type="password"
                  placeholder="New Password"
                  maxLength={50}
                  value={password.new_password}
                  onChange={(e) =>
                    setPassword({ ...password, new_password: e.target.value })
                  }
                  className="border-gray-200 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  maxLength={50}
                  value={password.new_password_confirmation}
                  onChange={(e) =>
                    setPassword({
                      ...password,
                      new_password_confirmation: e.target.value,
                    })
                  }
                  className="border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handlePasswordChange}
            >
              <Lock size={18} className="mr-2" />
              Update Password
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-red-200 dark:border-red-900/50 shadow-sm">
          <div className="p-6 border-b border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle size={20} />
              Danger Zone
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Irreversible actions - proceed with caution
            </p>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Once you delete your account, there is no going back. All your data will be permanently deleted.
            </p>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 size={18} className="mr-2" />
              Delete My Account
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfilePage;
