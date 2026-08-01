import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "@/app/layouts";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import { DashboardStub } from "@/features/auth/DashboardStub";
import CreateReportPage from "@/features/citizen/CreateReportPage";
import CitizenDashboard from "@/features/citizen/CitizenDashboard";
import MyReportsPage from "@/features/citizen/MyReportsPage";
import AuthorityDashboard from "@/features/authority/AuthorityDashboard";
import ReportDetailsPage from "@/features/reports/ReportDetailsPage";
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
        path: "report",
        element: <ProtectedRoute allowedRoles={["CITIZEN"]} />,
        children: [
          {
            index: true,
            element: <CreateReportPage />,
          },
        ],
      },
      {
        path: "reports",
        element: <ProtectedRoute allowedRoles={["CITIZEN"]} />,
        children: [
          {
            index: true,
            element: <MyReportsPage />,
          },
        ],
      },
      {
        path: "citizen",
        element: <ProtectedRoute allowedRoles={["CITIZEN"]} />,
        children: [
          {
            index: true,
            element: <CitizenDashboard />,
          },
        ],
      },
      {
        path: "authority",
        element: <ProtectedRoute allowedRoles={["AUTHORITY"]} />,
        children: [
          {
            index: true,
            element: <AuthorityDashboard />,
          },
          {
            path: "reports/:reportId",
            element: <ReportDetailsPage variant="authority" />,
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

const Router = () => {
  return <RouterProvider router={router} />;
};

export { Router };
