import { AgentProfile } from "@/api/agent/agentProfile";

const AgentDetailsTab = ({ agent }: { agent: AgentProfile }) => (
  <div className="space-y-3">
    <div className="grid sm:grid-cols-2 gap-4">
      <p><strong>Email:</strong> {agent.email}</p>
      <p><strong>Phone:</strong> {agent.phone}</p>
      <p><strong>Company Name:</strong> {agent.company_name}</p>
      <p><strong>Licence Number:</strong> {agent.licence_number || "NA"}</p>
      <p><strong>Location:</strong> {agent.city}</p>
      <p><strong>Status:</strong> {agent.status ? "Active" : "Inactive"}</p>
      <p><strong>Total Properties:</strong> {agent.total_properties}</p>
      <p><strong>Joined:</strong> {new Date(agent.joined).toLocaleDateString()}</p>
      

    </div>
    {agent.bio && (
      <div>
        <strong>Bio:</strong>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{agent.bio}</p>
      </div>
    )}
  </div>
);

export default AgentDetailsTab;
