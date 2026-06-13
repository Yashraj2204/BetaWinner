import { createContext, useContext, useEffect, useState } from "react";
import { api, TokenStorage } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null=checking, false=guest, object=authed

  useEffect(() => {
    const token = TokenStorage.getAccess();
    if (!token) {
      setUser(false);
      return;
    }
    api
      .get("/auth/me")
      .then(({ data }) => setUser(data))
      .catch(() => {
        TokenStorage.clear();
        setUser(false);
      });
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    // Save tokens from response body
    if (data.access_token) TokenStorage.setAccess(data.access_token);
    if (data.refresh_token) TokenStorage.setRefresh(data.refresh_token);
    setUser(data.user || data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    if (data.access_token) TokenStorage.setAccess(data.access_token);
    if (data.refresh_token) TokenStorage.setRefresh(data.refresh_token);
    setUser(data.user || data);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      TokenStorage.clear();
      setUser(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
