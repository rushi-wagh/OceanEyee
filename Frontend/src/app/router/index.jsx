import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "@/app/layouts";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import { DashboardStub } from "@/features/auth/DashboardStub";
import LandingPage from "@/features/landing/LandingPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "citizen",
        element: <ProtectedRoute allowedRoles={["CITIZEN"]} />,
        children: [
          {
            index: true,
            element: <DashboardStub title="Citizen Dashboard" />,
          },
        ],
      },
      {
        path: "authority",
        element: <ProtectedRoute allowedRoles={["AUTHORITY"]} />,
        children: [
          {
            index: true,
            element: <DashboardStub title="Authority Dashboard" />,
          },
        ],
      },
      {
        path: "admin",
        element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
        children: [
          {
            index: true,
            element: <DashboardStub title="Admin Dashboard" />,
          },
        ],
      },
    ],
  },
]);

function Router() {
  return <RouterProvider router={router} />;
}

export { Router };
