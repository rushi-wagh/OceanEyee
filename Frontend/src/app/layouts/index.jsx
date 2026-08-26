import { Outlet } from "react-router-dom";
import Navbar from "@/features/landing/components/Navbar";

const MainLayout = () => {
  return (
    <div className="pt-24 sm:pt-28">
      <Navbar />
      <Outlet />
    </div>
  );
};

export { MainLayout };
