
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartBox from "../components/CartBox";

export default function Sidebar({ searchBox, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { cartCount, setIsCartOpen } = useCart();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const navItems = [
    {
      label: "Explore",
      path: "/explore",
      icon: "▦"
    },
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "▦"
    },
    {
      label: "Profile",
      path: "/profile",
      icon: "♙"
    }
  ];

  return (
    <>
      <CartBox />

      <div className="min-h-screen bg-gray-50 text-gray-900">
        {/* Sidebar Overlay */}
        <div
          className={`
            fixed inset-0 z-40 bg-purple-950/45
            transition-all duration-300
            ${sidebarOpen
              ? "visible opacity-100"
              : "invisible opacity-0"}
          `}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside
          className={`
            fixed left-0 top-0 z-50
            flex h-screen w-[280px] flex-col
            bg-white shadow-2xl
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-[22px]">
            <h1 className="shrink-0 text-2xl font-extrabold tracking-tight text-purple-600">
              Mercatix<span className="text-purple-900">.</span>
            </h1>

            <button
              className="rounded-lg px-3 py-2 text-gray-500 transition hover:bg-purple-50 hover:text-purple-600"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* User Information */}
          <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[22px]">
              👤
            </div>

            <div className="min-w-0">
              <strong className="block truncate text-sm font-bold">
                {user.name || "Customer"}
              </strong>

              <span className="text-xs text-gray-400">
                Customer Account
              </span>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 px-4 py-6">
            <p className="mb-3.5 px-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Menu
            </p>

            {navItems.map((item) => (
              <button
                key={item.path}
                className={`
                  mb-1.5 flex w-full items-center gap-3.5
                  rounded-lg px-4 py-[13px]
                  text-left text-sm transition-colors
                  ${
                    location.pathname === item.path
                      ? "bg-purple-50 font-bold text-purple-600"
                      : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                  }
                `}
                onClick={() => handleNavigate(item.path)}
              >
                <span className="w-[22px] text-center text-lg">
                  {item.icon}
                </span>

                {item.label}
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-gray-200 p-4">
            <button
              className="
                flex w-full items-center gap-3.5
                rounded-lg px-4 py-[13px]
                text-left text-sm text-red-500
                transition-colors hover:bg-red-50
              "
              onClick={handleLogout}
            >
              <span className="w-[22px] text-center text-lg">
                ↪
              </span>

              Logout
            </button>
          </div>
        </aside>

        {/* Main Layout */}
        <div className="min-h-screen">
          {/* Navbar */}
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
            <div className="mx-auto flex h-[76px] max-w-[1280px] items-center gap-5 px-8 max-sm:h-[66px] max-sm:gap-2.5 max-sm:px-4">

              {/* Menu Toggle */}
              <button
                className="shrink-0 rounded-lg px-3 py-2 text-xl text-gray-700 transition hover:bg-purple-50 hover:text-purple-600"
                onClick={() => setSidebarOpen(true)}
              >
                ☰
              </button>

              {/* Brand */}
              <h1 className="shrink-0 text-2xl font-extrabold tracking-tight text-purple-600">
                Mercatix<span className="text-purple-900">.</span>
              </h1>

              {/* Search Box */}
              {searchBox && (
                <div className="relative ml-auto w-full max-w-[560px] flex-1 max-sm:ml-0">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">
                    ⌕
                  </span>

                  <input
                    type="text"
                    placeholder="Cari makanan atau merchant..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="
                      w-full rounded-lg border border-gray-200
                      bg-gray-50 py-[13px] pl-11 pr-4
                      text-[13px] text-gray-900 outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-purple-400 focus:bg-white
                      focus:ring-[3px] focus:ring-purple-100
                      max-sm:py-[11px] max-sm:pl-9
                      max-sm:pr-2 max-sm:text-[11px]
                    "
                  />
                </div>
              )}

              {/* Navbar Actions */}
              <div className="ml-auto flex shrink-0 items-center gap-4">
                <button
                  className="
                    relative flex h-[42px] w-[42px]
                    items-center justify-center rounded-lg
                    text-xl transition hover:bg-purple-50
                  "
                  onClick={() => setIsCartOpen(true)}
                >
                  🛒

                  {cartCount > 0 && (
                    <span className="
                      absolute right-0 top-0
                      flex h-[19px] min-w-[19px]
                      items-center justify-center
                      rounded-full bg-purple-600 px-1
                      text-[10px] text-white
                    ">
                      {cartCount}
                    </span>
                  )}
                </button>

                <button
                  className="
                    flex h-10 w-10 items-center justify-center
                    rounded-full bg-purple-100 text-lg
                    transition hover:bg-purple-200
                    max-sm:hidden
                  "
                  onClick={() => navigate("/customer/profile")}
                >
                  👤
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="mx-auto max-w-[1280px] p-8 max-sm:px-4 max-sm:py-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
