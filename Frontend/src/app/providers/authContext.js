import { createContext, useContext } from "react";

const AuthContext = createContext(null);

const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export { AuthContext, useAuthContext };
