import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, logoutUser } from "@/api/auth.api";
import { AuthContext } from "@/app/providers/authContext";
import { showToast } from "@/components/ui/showToast";

const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const user = data?.data?.user || data?.user || null;

  const logout = async () => {
    try {
      await logoutUser();
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.removeQueries({ queryKey: ["auth"] });
      queryClient.removeQueries({ queryKey: ["dashboard"] });
      queryClient.removeQueries({ queryKey: ["reports"] });
      showToast.success("Logged out successfully");
    } catch (error) {
      showToast.error(error.message || "Logout failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        refetch,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
