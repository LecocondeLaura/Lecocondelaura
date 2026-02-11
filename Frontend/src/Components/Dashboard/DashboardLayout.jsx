import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

function DashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef5f5] via-white to-[#fef5f5] flex">
      {/* Sidebar Desktop */}
      <div className="hidden md:block sticky top-0 self-start h-screen">
        <Sidebar onLogout={handleLogout} onClose={null} />
      </div>

      {/* Sidebar Mobile (Overlay) */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMobileMenu}
          ></div>
          {/* Sidebar */}
          <div className="fixed left-0 top-0 bottom-0 z-50 md:hidden">
            <Sidebar onLogout={handleLogout} onClose={closeMobileMenu} />
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full md:w-auto">
        {/* Mobile Header with Hamburger */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg text-[#8b6f6f] hover:bg-[#f0cfcf]/30 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
          <div>
            <h1 className="text-lg font-black text-[#8b6f6f]">Dashboard</h1>
            <p className="text-xs text-gray-500">Le Cocon de Laura</p>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}

export default DashboardLayout;
