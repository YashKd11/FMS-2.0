import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Home,
  MessageSquare,
  User,
  LogOut,
  MessageCircle,
} from "lucide-react";

const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const publicLinks = [
    { name: "Home", path: "/", icon: <Home size={18} /> },
    {
      name: "Features",
      path: "/features",
      icon: <LayoutDashboard size={18} />,
    },
    { name: "Contact", path: "/contact", icon: <MessageSquare size={18} /> },
  ];

  const authLinks = [
    { name: "Login", path: "/login", icon: <User size={18} /> },
    { name: "Sign Up", path: "/signup", icon: <MessageCircle size={18} /> },
  ];

  const adminLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    { name: "Reports", path: "/reports", icon: <FileText size={18} /> },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                F
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">
                F<span className="text-indigo-600">MS 2.0</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Public links always visible */}
            {publicLinks.map((link) => {
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="relative flex flex-col items-center text-sm font-medium transition-colors hover:text-indigo-600"
                >
                  <span
                    className={isActive ? "text-indigo-600" : "text-slate-600"}
                  >
                    {link.name}
                  </span>

                  {/* ACTIVE DOT */}
                  {isActive && (
                    <span className="absolute -bottom-2 w-6 h-1 bg-indigo-600 rounded-full"></span>
                  )}
                </Link>
              );
            })}

            <div className="h-4 w-px bg-slate-300 mx-2"></div>

            {/* Show login/signup ONLY if NOT logged in */}
            {!isLoggedIn &&
              authLinks.map((link) => {
                const isActive = location.pathname === link.path;
            
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="relative flex flex-col items-center text-sm font-medium"
                  >
                    <span className={isActive ? "text-indigo-600" : "text-slate-600"}>
                      {link.name}
                    </span>
            
                    {isActive && (
                      <span className="absolute -bottom-2 w-6 h-1 bg-indigo-600 rounded-full"></span>
                    )}
                  </Link>
                );
              })}

            {/* Show dashboard/reports ONLY if logged in */}
            {isLoggedIn &&
              adminLinks.map((link) => {
                const isActive = location.pathname === link.path;

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="relative flex flex-col items-center text-sm font-medium"
                  >
                    <span
                      className={
                        isActive ? "text-indigo-600" : "text-slate-600"
                      }
                    >
                      {link.name}
                    </span>

                    {isActive && (
                      <span className="absolute -bottom-2 w-8 h-2 bg-indigo-600 rounded"></span>
                    )}
                  </Link>
                );
              })}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-100 bg-indigo-600 px-2 h-8 rounded-sm"
              >
                Logout
              </button>
            )}
          </div>
          {/* Logout only when user in logged in */}

          {/* Mobile Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-slate-200 p-4 space-y-2"
        >
          {[...publicLinks, ...(!isLoggedIn ? authLinks : adminLinks)].map(
            (link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            )
          )}
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
