import { Children, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {useCart } from "../context/CartContext";

export default function Sidebar({ searchBox, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const {cartCount} = useCart();
  // const [cartCount, setCartCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <div className="customer-dashboard">
        {/* Sidebar Overlay */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside className={`customer-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <h1 className="brand-logo">
              Mercatix<span>.</span>
            </h1>

            <button
              className="sidebar-close"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="sidebar-user">
            <div className="user-avatar">👤</div>

            <div className="user-info">
              <strong>{user.  name || "Customer"}</strong>
              <span>Customer Account</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <p className="sidebar-label">Menu</p>
            {/* Sidebar List Content */}

            <button
              className={`sidebar-link ${location.pathname === '/explore' ? "active" : ""}`}
              onClick={() => {
                navigate("/explore");
              }}
            >
              <span className="sidebar-icon">▦</span>
              Explore
            </button>

            <button
              className={`sidebar-link ${location.pathname === '/dashboard' ? "active" : ""}`}
              onClick={() => {
                navigate("/dashboard");
                setSidebarOpen(false);
              }}
            >
              <span className="sidebar-icon">▦</span>
              Dashboard
            </button>

            <button
              className={`sidebar-link ${location.pathname === '/profile' ? "active" : ""}`}
              onClick={() => navigate("/profile")}
            >
              <span className="sidebar-icon">♙</span>
              Profile
            </button>

            {/* <button
              className="sidebar-link"
              onClick={() => navigate("/customer/settings")}
            >
              <span className="sidebar-icon">⚙</span>
              Pengaturan
            </button> */}
          </nav>

          <div className="sidebar-footer">
            <button className="sidebar-link logout" onClick={handleLogout}>
              <span className="sidebar-icon">↪</span>
              Logout
            </button>
          </div>
        </aside>

        {/* Main Layout */}
        <div className="customer-layout">
          {/* Navbar */}
          <header className="customer-navbar">
            <div className="navbar-content">
              <button
                className="menu-toggle"
                onClick={() => setSidebarOpen(true)}
              >
                ☰
              </button>

              <h1 className="brand-logo">
                Mercatix<span>.</span>
              </h1>

              {/* Search Box */}
              {searchBox && (
                <div className="navbar-search">
                  <span className="search-icon">⌕</span>
                  
                  <input
                    type="text"
                    placeholder="Cari makanan atau merchant..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>    
              )}

              <div className="d-flex flex flex-row ml-auto gap-4">
                <button
                  className="navbar-action"
                  onClick={() => navigate("/customer/cart")}
                >
                  🛒
                  {cartCount > 0 && (
                    <span className="cart-badge">{cartCount}</span>
                  )}
                </button>

                <button
                  className="navbar-avatar"
                  onClick={() => navigate("/customer/profile")}
                >
                  👤
                </button>
              </div>

            </div>
          </header>

          {/* Content */}
          <main className="customer-main">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
