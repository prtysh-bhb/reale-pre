/* eslint-disable @typescript-eslint/no-explicit-any */
import { getProfile } from "@/api/auth";
import { getFavProperties } from "@/api/customer/properties";
import PropertyCard from "@/components/sections/home/PropertyCard";
import Loader from "@/components/ui/Loader";
import { useAuth } from "@/context/AuthContext";
import { formatReadableDate } from "@/helpers/customer_helper";
import { FavoriteProperty } from "@/types/property";
import { Calendar, Edit, Mail, MapPin, Phone } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

interface Activity {
  id: number;
  icon: string;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
  time: string;
}

interface Document {
  id: number;
  icon: string;
  iconColor: string;
  bgColor: string;
  name: string;
  uploaded: string;
}

interface Communication {
  id: number;
  icon: string;
  iconColor: string;
  bgColor: string;
  type: string;
  description: string;
  time: string;
}

interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
  borderColor: string;
  bgColor: string;
}

const CustomerProfile = () => {
  const { user, setUser } = useAuth();
  const [favProperties, setFavProperties] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState("activity");

  // 2FA states
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorConfirmLoading, setTwoFactorConfirmLoading] = useState(false);
  const [twoFactorDisableLoading, setTwoFactorDisableLoading] = useState(false);
  const [qrData, setQrData] = useState<{ secret?: string; qr_code_url?: string } | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

  // disable modal
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [disableError, setDisableError] = useState<string | null>(null);

  const activities: Activity[] = [
    {
      id: 1,
      icon: "fas fa-home",
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
      title: "Property tour scheduled",
      description: "123 Maple Street - Tomorrow at 2:00 PM",
      time: "2 hours ago",
    },
    {
      id: 2,
      icon: "fas fa-search",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      title: "Viewed property details",
      description: "456 Oak Avenue - 4 bed, 3 bath",
      time: "1 day ago",
    },
    {
      id: 3,
      icon: "fas fa-heart",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
      title: "Saved property to favorites",
      description: "789 Pine Road - $550,000",
      time: "2 days ago",
    },
    {
      id: 4,
      icon: "fas fa-file-alt",
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-100",
      title: "Submitted pre-approval application",
      description: "Mortgage pre-approval for $600,000",
      time: "3 days ago",
    },
  ];

  const documents: Document[] = [
    {
      id: 1,
      icon: "fas fa-file-pdf",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      name: "Pre-approval Letter.pdf",
      uploaded: "Uploaded: Jan 15, 2023",
    },
    {
      id: 2,
      icon: "fas fa-file-word",
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
      name: "Financial Information.docx",
      uploaded: "Uploaded: Jan 10, 2023",
    },
    {
      id: 3,
      icon: "fas fa-file-image",
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-100",
      name: "ID Verification.jpg",
      uploaded: "Uploaded: Jan 5, 2023",
    },
  ];

  const communications: Communication[] = [
    {
      id: 1,
      icon: "fas fa-phone",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      type: "Phone Call",
      description: "Discussed property requirements and budget",
      time: "Yesterday at 3:45 PM • 15 min",
    },
    {
      id: 2,
      icon: "fas fa-envelope",
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
      type: "Email",
      description: "Sent property listings matching criteria",
      time: "Jan 18, 2023 • 10:30 AM",
    },
    {
      id: 3,
      icon: "fas fa-comment",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
      type: "Text Message",
      description: "Confirmed appointment for property viewing",
      time: "Jan 16, 2023 • 2:15 PM",
    },
  ];

  const notes: Note[] = [
    {
      id: 1,
      title: "Interested in properties with backyard",
      content: "Customer has two children and a dog, needs fenced yard.",
      date: "Jan 20, 2023",
      borderColor: "border-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      id: 2,
      title: "Budget increased to $600k",
      content: "After pre-approval, customer can now consider higher priced properties.",
      date: "Jan 15, 2023",
      borderColor: "border-yellow-500",
      bgColor: "bg-yellow-50",
    },
  ];

  const tabs = [
    { id: "activity", label: "Activity *" },
    { id: "properties", label: "Properties" },
    { id: "documents", label: "Documents *" },
    { id: "communications", label: "Communications *" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "activity":
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full ${activity.bgColor} flex items-center justify-center ${activity.iconColor}`}
                >
                  <i className={activity.icon}></i>
                </div>
                <div className="ml-4">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-gray-600 text-sm">{activity.description}</p>
                  <p className="text-gray-500 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case "properties":
        return (
          <div>
            <h3 className="font-bold text-lg mb-4">Favourite Properties</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favProperties.length > 0 ? (
                favProperties.map((favProperty) => (
                  <PropertyCard
                    key={favProperty.property.id}
                    property={favProperty.property}
                    isFavorite={true}
                    fetchProperties={fetchUserProperties}
                  />
                ))
              ) : (
                <p className="text-gray-500 mb-10 mt-10 col-span-full text-center ">
                  No properties found.
                </p>
              )}
            </div>
          </div>
        );

      case "documents":
        return (
          <div>
            <h3 className="font-bold text-lg mb-4">Customer Documents</h3>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg ${doc.bgColor} flex items-center justify-center ${doc.iconColor} mr-4`}>
                      <i className={doc.icon}></i>
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-gray-600 text-sm">{doc.uploaded}</p>
                    </div>
                  </div>
                  <button className="text-blue-500 hover:text-blue-700">
                    <i className="fas fa-download"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case "communications":
        return (
          <div>
            <h3 className="font-bold text-lg mb-4">Communication History</h3>
            <div className="space-y-4">
              {communications.map((comm) => (
                <div key={comm.id} className="flex items-start">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${comm.bgColor} flex items-center justify-center ${comm.iconColor}`}>
                    <i className={comm.icon}></i>
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">{comm.type}</p>
                    <p className="text-gray-600">{comm.description}</p>
                    <p className="text-gray-500 text-sm">{comm.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getProfile();
        // backend response shape: { data: { user: {...} } }
        setUser(data.data.user);
      } catch (err) {
        console.error("fetchUser profile error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProperties = useCallback(async () => {
    try {
      const data = await getFavProperties();
      setFavProperties(data.data.favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  }, []);

  useEffect(() => {
    fetchUserProperties();
  }, [fetchUserProperties]);

  // ------------------------------------------------------------
  // 2FA helpers
  // ------------------------------------------------------------
  const messageIndicatesAlreadyEnabled = (msg?: string | null) => {
    if (!msg) return false;
    return /already enabled/i.test(msg);
  };
  const messageIndicatesAlreadyDisabled = (msg?: string | null) => {
    if (!msg) return false;
    return /already disabled|not enabled|2fa is not enabled/i.test(msg);
  };

  const startTwoFactorSetup = async () => {
    setTwoFactorError(null);
    setTwoFactorLoading(true);
    try {
      const res = await api.post<{ success?: boolean; data?: { secret?: string; qr_code_url?: string }; message?: string }>(
        "/2fa/setup"
      );
      const data = (res as any)?.data ?? res;

      if (data && (data.success === false || data.success === 0) && messageIndicatesAlreadyEnabled(data.message)) {
        const newUser = { ...(user as any), ['2fa_enabled']: true };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        toast.success("Two-factor is already enabled");
        return;
      }

      const payload = data?.data ?? data;
      const normalized = {
        secret: payload?.secret ?? payload?.otp_secret,
        qr_code_url: payload?.qr_code_url ?? payload?.qrcode ?? payload?.qr,
      };
      setQrData(normalized);
      setOtpCode("");
      setTwoFactorModalOpen(true);
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message ?? err?.message;
      if (messageIndicatesAlreadyEnabled(serverMsg)) {
        const newUser = { ...(user as any), ['2fa_enabled']: true };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        toast.success("Two-factor is already enabled");
      } else {
        console.error("generateTwoFactorSetup failed", err);
        setTwoFactorError(serverMsg ?? "Failed to generate 2FA QR code");
        toast.error("Failed to generate QR code for two-factor setup");
      }
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const confirmEnableTwoFactor = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setTwoFactorError("Please enter the 6-digit code from your authenticator app.");
      return;
    }
    setTwoFactorConfirmLoading(true);
    setTwoFactorError(null);
    try {
      const res = await api.post<{ success?: boolean; data?: { user?: any }; message?: string }>("/2fa/enable", { code: otpCode });
      const data = (res as any)?.data ?? res;

      if (data && (data.success === false || data.success === 0) && messageIndicatesAlreadyEnabled(data.message)) {
        const newUser = { ...(user as any), ['2fa_enabled']: true };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        setTwoFactorModalOpen(false);
        setQrData(null);
        setOtpCode("");
        toast.success("Two-factor is already enabled");
        return;
      }

      if (data && data.success === false) {
        const msg = data.message ?? "Invalid code";
        setTwoFactorError(msg);
        toast.error(msg);
        setTwoFactorConfirmLoading(false);
        return;
      }

      const returnedUser = data?.data?.user ?? data?.user ?? null;
      if (returnedUser) {
        setUser(returnedUser);
        localStorage.setItem("user", JSON.stringify(returnedUser));
      } else {
        const newUser = { ...(user as any), ['2fa_enabled']: true };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
      }

      setTwoFactorModalOpen(false);
      setQrData(null);
      setOtpCode("");
      toast.success("Two-factor authentication enabled");
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message ?? err?.message;
      if (messageIndicatesAlreadyEnabled(serverMsg)) {
        const newUser = { ...(user as any), ['2fa_enabled']: true };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        setTwoFactorModalOpen(false);
        setQrData(null);
        setOtpCode("");
        toast.success("Two-factor is already enabled");
      } else {
        console.error("enableTwoFactor failed", err);
        const msg = serverMsg ?? "Failed to enable two-factor";
        setTwoFactorError(msg);
        toast.error(msg);
      }
    } finally {
      setTwoFactorConfirmLoading(false);
    }
  };

  const confirmDisableTwoFactor = async () => {
    setDisableError(null);

    if (!disableCode || disableCode.length !== 6) {
      setDisableError("Please enter the 6-digit code from your authenticator app.");
      return;
    }

    setTwoFactorDisableLoading(true);
    try {
      const res = await api.post<{ success?: boolean; data?: { user?: any }; message?: string }>("/2fa/disable", { code: disableCode });
      const data = (res as any)?.data ?? res;

      if (data && (data.success === false || data.success === 0) && messageIndicatesAlreadyDisabled(data.message)) {
        const newUser = { ...(user as any), ['2fa_enabled']: false };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        setShowDisableConfirm(false);
        setDisableCode("");
        toast.success("Two-factor is already disabled");
        return;
      }

      if (data && data.success === false) {
        const msg = data.message ?? "Failed to disable 2FA";
        setDisableError(msg);
        toast.error(msg);
        setTwoFactorDisableLoading(false);
        return;
      }

      const returnedUser = data?.data?.user ?? data?.user ?? null;
      if (returnedUser) {
        setUser(returnedUser);
        localStorage.setItem("user", JSON.stringify(returnedUser));
      } else {
        const newUser = { ...(user as any), ['2fa_enabled']: false };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
      }

      setShowDisableConfirm(false);
      setDisableCode("");
      toast.success("Two-factor authentication disabled");
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message ?? err?.message;
      setDisableError(serverMsg ?? "Failed to disable two-factor");
      toast.error(serverMsg ?? "Failed to disable two-factor");
    } finally {
      setTwoFactorDisableLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mr-3">Customer Profile</h2>
          <div className="flex space-x-3">
            <Link to={"/profile/edit"} className="px-4 py-2 flex bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              <Edit size={20} className="mr-2" />
              Edit
            </Link>
            {/* <Link to={"/customer/appointment"} className="px-4 py-2 flex bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              <Edit size={20} className="mr-2" />
              View Appointment
            </Link> */}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    src={user?.avatar_url || `/assets/user.jpg`}
                    alt="Customer"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/user.jpg";
                    }}
                  />
                </div>
                <h3 className="text-xl font-bold capitalize">{user?.name}</h3>
                <div className="flex space-x-2 mt-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded capitalize">{user?.role}</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center max-w-full">
                  <Mail size={20} className="flex-shrink-0" />
                  <span className="ml-3 truncate max-w-[200px] sm:overflow-visible sm:whitespace-normal sm:text-clip sm:max-w-none">
                    {user?.email}
                  </span>
                </div>

                <div className="flex items-center">
                  <Phone size={20} className="flex-shrink-0" />
                  <span className="ml-3 truncate max-w-[200px] sm:overflow-visible sm:whitespace-normal sm:text-clip sm:max-w-none">
                    {user?.phone || "N/A"}
                  </span>
                </div>

                <div className="flex items-center">
                  <MapPin size={20} className="flex-shrink-0" />
                  <span className="ml-3 truncate max-w-[200px] sm:overflow-visible sm:whitespace-normal sm:text-clip sm:max-w-none">
                    {user?.city ? `${user?.city}, ${user?.state ?? ""}` : "N/A"} 
                  </span>
                </div>

                <div className="flex items-center">
                  <Calendar size={20} className="flex-shrink-0" />
                  <span className="ml-3 truncate max-w-[200px] sm:overflow-visible sm:whitespace-normal sm:text-clip sm:max-w-none">
                    Joined: {formatReadableDate(user?.created_at)}
                  </span>
                </div>
              </div>

              {/* Two-Factor small card */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Two-Factor Authentication</p>
                    <p className={`font-medium ${user?.['2fa_enabled'] ? "text-emerald-600" : "text-red-700"}`}>
                      {user?.['2fa_enabled'] ? "Enabled" : "Disabled"}
                    </p>
                  </div>

                  <div>
                    {user?.['2fa_enabled'] ? (
                      <button
                        onClick={() => { setDisableCode(""); setDisableError(null); setShowDisableConfirm(true); }}
                        disabled={twoFactorDisableLoading}
                        className="px-3 py-1 rounded-full bg-red-600 text-white hover:opacity-90 cursor-pointer"
                      >
                        {twoFactorDisableLoading ? "Disabling..." : "Disable"}
                      </button>
                    ) : (
                      <button
                        onClick={startTwoFactorSetup}
                        disabled={twoFactorLoading}
                        className="px-3 py-1 rounded-full bg-emerald-600 text-white hover:opacity-90 cursor-pointer"
                      >
                        {twoFactorLoading ? "Preparing..." : "Enable"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4">Customer Stats *</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Properties Viewed</span>
                    <span className="font-semibold">24</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Properties Saved</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Tours Scheduled</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-pink-500 h-2 rounded-full" style={{ width: "40%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-6 text-center cursor-pointer border-b-2 font-medium transition ${
                        activeTab === tab.id ? "border-blue-500 text-blue-500" : "border-transparent text-gray-600 hover:text-blue-500"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">{renderTabContent()}</div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4">Customer Notes *</h3>
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className={`p-4 ${note.bgColor} rounded-lg border-l-4 ${note.borderColor}`}>
                    <div className="flex justify-between">
                      <p className="font-medium">{note.title}</p>
                      <span className="text-gray-500 text-sm">{note.date}</span>
                    </div>
                    <p className="text-gray-600 mt-1">{note.content}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Add a new note..."></textarea>
                <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">Save Note</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {twoFactorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => { if (!twoFactorConfirmLoading) { setTwoFactorModalOpen(false); setQrData(null); } }} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Enable Two-Factor Authentication</h3>
              <button onClick={() => { if (!twoFactorConfirmLoading) { setTwoFactorModalOpen(false); setQrData(null); } }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.) then enter the 6-digit code below to confirm.</p>

              <div className="flex flex-col items-center gap-2">
                {qrData?.qr_code_url ? (
                  <QRCodeSVG value={qrData.qr_code_url} size={170} className="bg-white p-2 rounded shadow" />
                ) : (
                  <div className="w-[170px] h-[170px] bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">QR Loading...</div>
                )}

                {qrData?.secret && (
                  <p className="text-xs text-gray-500">Secret: <span className="font-mono text-sm text-gray-700">{qrData.secret}</span></p>
                )}
              </div>

              {twoFactorError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{twoFactorError}</p>}

              <form onSubmit={confirmEnableTwoFactor} className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">6-digit code</label>
                  <input
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => { setTwoFactorModalOpen(false); setQrData(null); }} disabled={twoFactorConfirmLoading} className="px-4 py-2 rounded-xl border border-gray-200">Cancel</button>
                  <button type="submit" disabled={twoFactorConfirmLoading} className="px-4 py-2 rounded-xl bg-emerald-600 text-white">
                    {twoFactorConfirmLoading ? "Enabling..." : "Enable 2FA"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Disable confirm modal (requests OTP) */}
      {showDisableConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => { if (!twoFactorDisableLoading) setShowDisableConfirm(false); }} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-100 rounded-lg">
                <svg className="w-5 h-5 text-rose-600" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Disable Two-Factor</h3>
                <p className="text-sm text-gray-600">Enter a 6-digit code from your authenticator app to disable two-factor authentication.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">6-digit code</label>
                <input
                  value={disableCode}
                  onChange={(e) => { setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setDisableError(null); }}
                  placeholder="Enter 6-digit code"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500"
                />
                {disableError && <p className="text-sm text-red-600 mt-2">{disableError}</p>}
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowDisableConfirm(false); setDisableCode(""); setDisableError(null); }} disabled={twoFactorDisableLoading} className="px-4 py-2 rounded-xl border border-gray-200">Cancel</button>
                <button onClick={confirmDisableTwoFactor} disabled={twoFactorDisableLoading} className="px-4 py-2 rounded-xl bg-rose-600 text-white">
                  {twoFactorDisableLoading ? "Disabling..." : "Disable 2FA"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;
