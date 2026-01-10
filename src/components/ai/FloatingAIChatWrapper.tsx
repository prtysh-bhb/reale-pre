import { useLocation } from "react-router-dom";
import FloatingAIChatButton from "@/components/ai/FloatingAIChatButton";

const FloatingAIChatWrapper = () => {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAgentRoute = location.pathname.startsWith("/agent");

  if (isAdminRoute || isAgentRoute) {
    return null;
  }

  return <FloatingAIChatButton />;
};

export default FloatingAIChatWrapper;
