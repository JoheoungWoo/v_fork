import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function BasicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f8] text-[#1b1c1c] font-sans antialiased">
      <Header />

      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
