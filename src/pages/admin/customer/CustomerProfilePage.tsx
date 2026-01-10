import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCustomerProfile, CustomerProfile } from "@/api/customer/customerProfile";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CustomerDetailsTab from "@/pages/admin/customer/components/CustomerDetailsTab";
import CustomerActivityLogsTab from "@/pages/admin/customer/components/CustomerActivityLogsTab";
import CustomerPerformanceTab from "@/pages/admin/customer/components/CustomerPerformanceTab";
import { Phone, MapPin, User, Mail, Shield } from "lucide-react";

const CustomerProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchCustomerProfile(id!);
        if (data.success) setCustomer(data.data);
        else setError("Failed to load customer profile");
      } catch (err) {
        console.error(err);
        setError("Error fetching profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id]);

  if (loading)
    return (
      <AdminLayout>
        <div className="text-center py-10 text-gray-500">Loading profile...</div>
      </AdminLayout>
    );

  if (error)
    return (
      <AdminLayout>
        <div className="text-center text-red-500 py-10">{error}</div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-md overflow-hidden">
        {/* Cover Banner */}
        <div className="relative h-48 sm:h-56 md:h-64 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500 rounded-t-2xl overflow-hidden">
          <img
            src={customer?.avatar || `/assets/user.jpg`}
            alt="cover"
            className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm"
          />
        </div>

        {/* Customer Header */}
        <div className="relative -mt-16 sm:-mt-20 px-4 sm:px-8 md:px-10 flex flex-col sm:flex-row sm:items-end sm:gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0 self-center sm:self-start">
            <img
              src={customer?.avatar || `/assets/user.jpg`}
              alt={customer?.name || "Customer"}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl object-cover"
            />
          </div>

          {/* Customer Info Card */}
          <div className="mt-4 sm:mt-0 bg-white dark:bg-[#1f2937] w-full rounded-xl shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:justify-between gap-4">
            {/* Left side - Name + Email */}
            <div className="text-center sm:text-left flex-1 gap-2 flex flex-col">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center sm:justify-start gap-2">
                {customer?.name || "Unnamed Customer"}
              </h1>
              <div className="flex-1 flex items-center justify-center sm:justify-start gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    customer?.status
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  }`}
                >
                  {customer?.status ? "Active" : "Inactive"}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    customer?.two_factor_enabled
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-red-100 dark:bg-gray-700 text-red-700 dark:text-gray-400"
                  }`}
                >
                  <Shield className="mr-1" size={14} />
                  {customer?.two_factor_enabled ? "2FA On" : "2FA Off"}
                </span>
              </div>
              <p className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-500 mt-1 break-all">
                <Mail size={15} />
                {customer?.email || "Not available"}
              </p>
            </div>

            {/* Right side - Meta Info */}
            <div className="flex flex-wrap justify-center sm:justify-end gap-x-6 gap-y-2 text-gray-700 dark:text-gray-300 text-sm">
              <div className="flex items-center gap-1">
                <Phone size={15} /> {customer?.phone || "N/A"}
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={15} /> {customer?.city || "Unknown"}
              </div>
              <div className="flex items-center gap-1">
                <User size={15} />{" "}
                {customer?.joined
                  ? `Joined ${new Date(customer.joined).toLocaleDateString()}`
                  : "Joined Date: N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 px-4 sm:px-8 md:px-10 pb-8">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-6 border-b border-gray-200 dark:border-gray-700 mb-6">
              <TabsTrigger
                value="details"
                className="pb-2 text-gray-700 dark:text-gray-200 font-medium border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 text-sm sm:text-base"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="pb-2 text-gray-700 dark:text-gray-200 font-medium border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 text-sm sm:text-base"
              >
                Activity Logs
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="pb-2 text-gray-700 dark:text-gray-200 font-medium border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 text-sm sm:text-base"
              >
                Performance Tracking
              </TabsTrigger>
            </TabsList>

            {/* Responsive Tab Content */}
            <div className="bg-gray-50 dark:bg-[#111827] rounded-xl shadow-inner p-4 sm:p-6 mt-[50px] lg:mt-0">
              <TabsContent value="details">
                <CustomerDetailsTab customer={customer!} />
              </TabsContent>

              <TabsContent value="activity">
                <CustomerActivityLogsTab customerId={customer!.id} />
              </TabsContent>

              <TabsContent value="performance">
                <CustomerPerformanceTab customerId={customer!.id} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CustomerProfilePage;
