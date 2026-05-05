import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function DashboardLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="text-text-muted text-[16px]">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main flex flex-col">
      <Navbar />

      <div className="flex flex-1 pt-[64px]">
        <Sidebar />

        <main className="flex-1 lg:ml-[256px] ml-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
