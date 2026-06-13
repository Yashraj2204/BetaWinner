// No auth needed — static frontend only
// This file is kept as a placeholder so existing imports don't break.
export const useAuth = () => ({
  user: { name: "Guest", email: "" },
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  return children;
}
