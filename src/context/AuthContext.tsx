/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "@/api/admin/profileApi";

interface AuthContextType {
  user: any;
  token: string | null;
  setUser: (user: any) => void;
  setToken: (token: string) => void;
  fetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {    
    if (token) fetchUserProfile();
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const res = await getProfile();
      
      // Type assertion to specify expected structure
      const data = res.data as { data: { user: any } };
      setUser(data.data.user); // Laravel returns {data: {user: {..}}}
    } catch (err) {
      console.error("Profile fetch failed:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
