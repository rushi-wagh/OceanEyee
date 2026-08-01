import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { queryClient } from "@/lib/queryClient";

const Providers = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider />
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

export { Providers };
