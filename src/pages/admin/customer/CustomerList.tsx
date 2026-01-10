/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  FileDown,
  Contact,
  UserPlus,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";
import { exportUsers } from "@/api/admin/userExport";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { getCustomers, Customer } from "@/api/customer/customerList";
import {
  activateCustomer,
  deactivateCustomer,
} from "@/api/customer/customerActions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatsCard, SearchInput, ViewToggle, DataTable, ConfirmDialog } from "@/components/admin";
import { SkeletonPage } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Column } from "@/components/admin/DataTable";

const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [isDeactivating, setIsDeactivating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        let is_active = "";
        if (filter === "active") is_active = "1";
        if (filter === "inactive") is_active = "0";

        const data = await getCustomers(page, search, is_active);
        if (data.success) {
          setCustomers(data.data.customers || []);
          setTotalPages(data.data.pagination.last_page || 1);
        } else setError("Failed to fetch customers.");
      } catch {
        setError("Failed to fetch customers.");
      } finally {
        setLoading(false);
      }
    };
    loadCustomers();
  }, [page, search, filter]);

  const refresh = async () => {
    let is_active = "";
    if (filter === "active") is_active = "1";
    if (filter === "inactive") is_active = "0";
    const data = await getCustomers(page, search, is_active);
    setCustomers(data.data.customers || []);
  };

  const handleActivate = async (id: number) => {
    try {
      await activateCustomer(id);
      toast.success("Customer activated successfully");
      refresh();
    } catch {
      toast.error("Failed to activate customer");
    }
  };

  const openDeactivateDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setReason("");
    setShowDeactivateDialog(true);
  };

  const confirmDeactivate = async () => {
    if (!reason.trim()) {
      toast.error("Please enter a reason");
      return;
    }
    try {
      setIsDeactivating(true);
      await deactivateCustomer(selectedCustomer!.id, reason);
      toast.success("Customer deactivated successfully");
      setShowDeactivateDialog(false);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to deactivate customer");
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleExport = async () => {
    try {
      toast.info("Preparing your download...");
      await exportUsers(
        "customer",
        filter === "active" ? 1 : filter === "inactive" ? 0 : undefined
      );
      toast.success("Export successful!");
    } catch {
      toast.error("Failed to export users");
    }
  };

  // Stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status).length;
  const inactiveCustomers = customers.filter((c) => !c.status).length;

  // Table columns
  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Customer",
      render: (customer) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={customer.avatar || undefined} alt={customer.name} />
            <AvatarFallback>{customer.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {customer.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (customer) => (
        <span className="text-gray-600 dark:text-gray-300">{customer.email}</span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      render: (customer) => (
        <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {new Date(customer.joined).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (customer) => (
        <Badge variant={customer.status ? "success" : "destructive"} dot>
          {customer.status ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "two_factor",
      header: "2FA",
      className: "hidden md:table-cell",
      render: (customer) => (
        <Badge variant={customer.two_factor_enabled ? "success" : "secondary"}>
          <Shield className="mr-1 h-3 w-3" />
          {customer.two_factor_enabled ? "Enabled" : "Disabled"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (customer) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/admin/customers/${customer.id}`)}
            className="text-gray-600 dark:text-gray-400 hover:text-primary-600"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {customer.status ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDeactivateDialog(customer)}
              className="text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-900/20"
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleActivate(customer.id)}
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20"
            >
              Activate
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <SkeletonPage />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <EmptyState
            title="Error loading customers"
            description={error}
            action={{ label: "Try Again", onClick: () => window.location.reload() }}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Customers"
          description="Manage all registered customers"
          icon={Contact}
          iconColor="info"
          actions={
            <>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search customers..."
                className="w-64"
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <ViewToggle view={viewMode} onChange={setViewMode} />

              <Button variant="outline" onClick={handleExport}>
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button onClick={() => navigate("/admin/customers/new")}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Customers"
            value={totalCustomers}
            icon={Contact}
            variant="info"
          />
          <StatsCard
            title="Active Customers"
            value={activeCustomers}
            icon={UserCheck}
            variant="success"
          />
          <StatsCard
            title="Inactive Customers"
            value={inactiveCustomers}
            icon={UserX}
            variant="danger"
          />
        </div>

        {/* Content */}
        {viewMode === "table" ? (
          <DataTable
            columns={columns}
            data={customers}
            keyExtractor={(c) => c.id}
            emptyState={{
              title: "No customers found",
              description: "Try adjusting your search or filter criteria",
            }}
            pagination={{
              page,
              totalPages,
              onPageChange: setPage,
            }}
          />
        ) : (
          <>
            {customers.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <EmptyState
                  title="No customers found"
                  description="Try adjusting your search or filter criteria"
                  variant="users"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={customer.avatar || "/assets/user.jpg"} alt={customer.name} />
                          <AvatarFallback>{customer.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {customer.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                      <Badge variant={customer.status ? "success" : "destructive"} dot>
                        {customer.status ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant={customer.two_factor_enabled ? "success" : "secondary"} size="sm">
                        <Shield className="mr-1 h-3 w-3" />
                        {customer.two_factor_enabled ? "2FA On" : "2FA Off"}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Joined {new Date(customer.joined).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/admin/customers/${customer.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {customer.status ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-amber-600 border-amber-200 hover:bg-amber-50"
                          onClick={() => openDeactivateDialog(customer)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          onClick={() => handleActivate(customer.id)}
                        >
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grid Pagination */}
            {totalPages > 1 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Page <span className="font-semibold">{page}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Deactivate Dialog */}
        <ConfirmDialog
          open={showDeactivateDialog}
          onOpenChange={setShowDeactivateDialog}
          title="Deactivate Customer"
          description={`Provide a reason for deactivating ${selectedCustomer?.name}.`}
          confirmLabel="Deactivate"
          variant="warning"
          onConfirm={confirmDeactivate}
          isLoading={isDeactivating}
        >
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Enter reason for deactivation..."
          />
        </ConfirmDialog>
      </div>
    </AdminLayout>
  );
};

export default CustomerList;
