import { useAuthContext } from "@/app/providers/AuthProvider";

const useAuth = () => {
  return useAuthContext();
};

export { useAuth };
