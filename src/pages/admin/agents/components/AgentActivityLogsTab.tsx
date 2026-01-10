const AgentActivityLogsTab = ({ agentId }: { agentId: number }) => {
  // In real use, fetch from `/admin/agents/{id}/activity`
  return (
    <div className="text-gray-700 dark:text-gray-300 space-y-3">
      <p>Recent activity logs for agent ID {agentId}:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Created a new property on 12 Oct 2025</li>
        <li>Updated contact details on 10 Oct 2025</li>
        <li>Logged in to dashboard on 09 Oct 2025</li>
      </ul>
    </div>
  );
};

export default AgentActivityLogsTab;
