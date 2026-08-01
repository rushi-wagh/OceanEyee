import { useAuthContext } from "@/app/providers/authContext";

const useAuth = () => {
  return useAuthContext();
};

export { useAuth };
