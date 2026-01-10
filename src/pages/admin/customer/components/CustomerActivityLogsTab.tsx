interface CustomerActivityLogsTabProps {
  customerId: number;
}

const CustomerActivityLogsTab = ({ customerId }: CustomerActivityLogsTabProps) => {
  return (
    <div className="p-4 bg-gray-50 dark:bg-[#111827] rounded-xl">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Activity Logs
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        No activity logs available for customer ID: {customerId}.
      </p>
    </div>
  );
};

export default CustomerActivityLogsTab;
