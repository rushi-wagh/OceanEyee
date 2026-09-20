import { useEffect } from "react";
import { Router } from "@/app/router";
import { ToastProvider } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";

const App = () => {
  useEffect(() => {
    void useAuthStore.getState().initializeAuth();
  }, []);

  return (
    <>
      <ToastProvider />
      <Router />
    </>
  );
};

export default App;
