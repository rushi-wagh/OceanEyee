import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "@/app/layouts";
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
    ],
  },
]);

function Router() {
  return <RouterProvider router={router} />;
}

export { Router };
