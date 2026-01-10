interface CustomerPerformanceTabProps {
  customerId: number;
}

const CustomerPerformanceTab = ({ customerId }: CustomerPerformanceTabProps) => {
  return (
    <div className="p-4 bg-gray-50 dark:bg-[#111827] rounded-xl">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Performance Tracking
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        Performance data for customer ID {customerId} will appear here.
      </p>
    </div>
  );
};

export default CustomerPerformanceTab;
