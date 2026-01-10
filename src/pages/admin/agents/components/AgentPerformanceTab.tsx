const AgentPerformanceTab = ({ agentId }: { agentId: number }) => {
  // Later, connect to real metrics endpoint `/admin/agents/{id}/performance`
  return (
    <div className="space-y-3 text-gray-700 dark:text-gray-300">
      <p>Performance overview for agent #{agentId}:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Sales conversion rate: 78%</li>
        <li>Average property response time: 2.4 hrs</li>
        <li>Client satisfaction: 4.5/5</li>
      </ul>
    </div>
  );
};

export default AgentPerformanceTab;
