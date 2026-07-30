import { Toaster, toast } from "sonner";

function ToastProvider() {
  return (
    <Toaster
      richColors
      position="top-right"
      toastOptions={{
        style: {
          background: "#0a1220",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          color: "#f8fafc",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
        },
      }}
    />
  );
}

const showToast = {
  success: toast.success,
  error: toast.error,
  info: toast.info,
};

export { showToast, ToastProvider };
