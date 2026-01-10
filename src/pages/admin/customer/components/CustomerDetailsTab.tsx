/* eslint-disable @typescript-eslint/no-explicit-any */
interface CustomerDetailsTabProps {
  customer: any;
}

const CustomerDetailsTab = ({ customer }: CustomerDetailsTabProps) => {
  return (
    <div className="p-4 bg-gray-50 dark:bg-[#111827] rounded-xl ">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Customer Details
      </h2>
      <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
        <p><strong>Email:</strong> {customer?.email || "N/A"}</p>
        <p><strong>Phone:</strong> {customer?.phone || "N/A"}</p>
        <p><strong>City:</strong> {customer?.city || "Unknown"}</p>
        <p><strong>State:</strong> {customer?.state || "N/A"}</p>
        <p><strong>Address:</strong> {customer?.address || "N/A"}</p>
        <p><strong>Joined:</strong> {customer?.joined ? new Date(customer.joined).toLocaleDateString() : "N/A"}</p>
        <p><strong>Total Inquiries:</strong> {customer?.total_inquiries || "N/A"}</p>
        <p><strong>Total Favorites:</strong> {customer?.total_favorites || "N/A"}</p>
        <p><strong>Status:</strong> {customer?.status ? "Active" : "Inactive"}</p>
        <p><strong>Bio:</strong> {customer?.bio || "N/A"}</p>
      </div>
    </div>
  );
};

export default CustomerDetailsTab;
