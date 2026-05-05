import { Outlet } from "react-router";
import Navbar from "../components/Navbar";

export default function PublicLayout() {
  const showNavbar = true;

  return (
    <div className="min-h-screen bg-bg-main text-text-main">
      {showNavbar && <Navbar />}
      <main className="pt-[64px]">
        <Outlet />
      </main>
    </div>
  );
}
