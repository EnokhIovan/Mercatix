
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Explore.css";
import Sidebar from "../../components/Sidebar";

const products = [
  {
    id: 1,
    name: "Chicken Katsu",
    merchant: "Dapur Mama",
    category: "Makanan Berat",
    price: 18000,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600",
  },
  {
    id: 2,
    name: "Burger Special",
    merchant: "Burger House",
    category: "Fast Food",
    price: 25000,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
  },
  {
    id: 3,
    name: "Japanese Ramen",
    merchant: "Ramen Corner",
    category: "Makanan Berat",
    price: 22000,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600",
  },
  {
    id: 4,
    name: "Chocolate Cake",
    merchant: "Sweet Bakery",
    category: "Dessert",
    price: 15000,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
  },
  {
    id: 5,
    name: "Strawberry Juice",
    merchant: "Fresh Drink",
    category: "Minuman",
    price: 12000,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600",
  },
  {
    id: 6,
    name: "French Fries",
    merchant: "Snack Station",
    category: "Snack",
    price: 10000,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600",
  },
];

const categories = [
  "Semua",
  "Makanan Berat",
  "Fast Food",
  "Snack",
  "Dessert",
  "Minuman",
];

export default function CustomerDashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [cartCount, setCartCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.merchant.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === "Semua" ||
      product.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };


  return(
    <Sidebar>

      {/* Welcome */}
      <section className="welcome-section">
        <p>Selamat datang kembali!</p>

        <h2>
          Halo, {user.name || "Customer"} 👋
        </h2>

        <p className="welcome-description">
          Temukan makanan favoritmu hari ini.
        </p>
      </section>

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <span className="hero-badge">
            SPECIAL OFFER
          </span>

          <h2>
            Lapar? Saatnya Temukan Favoritmu!
          </h2>

          <p>
            Jelajahi berbagai pilihan makanan menarik
            dari merchant favoritmu di Mercatix.
          </p>

          <button
            className="hero-button"
            onClick={() => {
              document.getElementById("products")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            Jelajahi Produk
          </button>
        </div>

        <div className="hero-decoration">🍔</div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-heading">
          <h2>Kategori Makanan</h2>
        </div>

        <div className="category-list">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-button ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="section" id="products">
        <div className="products-heading">
          <div className="section-heading">
            <h2>Rekomendasi Untukmu</h2>
            <p>
              Pilihan makanan yang mungkin kamu sukai.
            </p>
          </div>

          <span className="product-count">
            {filteredProducts.length} Produk
          </span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>

                <div className="product-image-wrapper">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                  />

                  <span className="product-category">
                    {product.category}
                  </span>
                </div>

                <div className="product-info">
                  <h3 className="product-name">
                    {product.name}
                  </h3>

                  <p className="product-merchant">
                    {product.merchant}
                  </p>

                  <div className="product-details">
                    <span className="product-price">
                      {formatPrice(product.price)}
                    </span>

                    <span className="product-rating">
                      ⭐ {product.rating}
                    </span>
                  </div>

                  <button
                    className="add-cart-button"
                    onClick={() => {
                      setCartCount((count) => count + 1);
                    }}
                  >
                    + Tambah
                  </button>
                </div>

              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>

            <h3>Produk tidak ditemukan</h3>

            <p>
              Coba gunakan kata kunci atau kategori lain.
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="customer-footer">
        © 2026 Mercatix. All rights reserved.
      </footer>
    </Sidebar>
  )
  // return (
  //   <>
  //     <title>Explore</title>
  //     <div className="customer-dashboard">
  //       {/* Sidebar Overlay */}
  //       <div
  //         className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
  //         onClick={() => setSidebarOpen(false)}
  //       />

  //       {/* Sidebar */}
  //       <aside className={`customer-sidebar ${sidebarOpen ? "open" : ""}`}>
  //         <div className="sidebar-header">
  //           <h1 className="brand-logo">
  //             Mercatix<span>.</span>
  //           </h1>

  //           <button
  //             className="sidebar-close"
  //             onClick={() => setSidebarOpen(false)}
  //           >
  //             ✕
  //           </button>
  //         </div>

  //         <div className="sidebar-user">
  //           <div className="user-avatar">👤</div>

  //           <div className="user-info">
  //             <strong>{user.name || "Customer"}</strong>
  //             <span>Customer Account</span>
  //           </div>
  //         </div>

  //         <nav className="sidebar-nav">
  //           <p className="sidebar-label">Menu</p>

  //           <button
  //             className="sidebar-link active"
  //             onClick={() => {
  //               navigate("/dashboard");
  //               setSidebarOpen(false);
  //             }}
  //           >
  //             <span className="sidebar-icon">▦</span>
  //             Dashboard
  //           </button>

  //           <button
  //             className="sidebar-link"
  //             onClick={() => navigate("/customer/profile")}
  //           >
  //             <span className="sidebar-icon">♙</span>
  //             Profil Saya
  //           </button>

  //           <button
  //             className="sidebar-link"
  //             onClick={() => navigate("/customer/settings")}
  //           >
  //             <span className="sidebar-icon">⚙</span>
  //             Pengaturan
  //           </button>
  //         </nav>

  //         <div className="sidebar-footer">
  //           <button
  //             className="sidebar-link logout"
  //             onClick={handleLogout}
  //           >
  //             <span className="sidebar-icon">↪</span>
  //             Logout
  //           </button>
  //         </div>
  //       </aside>

  //       {/* Main Layout */}
  //       <div className="customer-layout">

  //         {/* Navbar */}
  //         <header className="customer-navbar">
  //           <div className="navbar-content">

  //             <button
  //               className="menu-toggle"
  //               onClick={() => setSidebarOpen(true)}
  //             >
  //               ☰
  //             </button>

  //             <h1 className="brand-logo">
  //               Mercatix<span>.</span>
  //             </h1>

  //             <div className="navbar-search">
  //               <span className="search-icon">⌕</span>

  //               <input
  //                 type="text"
  //                 placeholder="Cari makanan atau merchant..."
  //                 value={search}
  //                 onChange={(e) => setSearch(e.target.value)}
  //               />
  //             </div>

  //             <button
  //               className="navbar-action"
  //               onClick={() => navigate("/customer/cart")}
  //             >
  //               🛒

  //               {cartCount > 0 && (
  //                 <span className="cart-badge">{cartCount}</span>
  //               )}
  //             </button>

  //             <button
  //               className="navbar-avatar"
  //               onClick={() => navigate("/customer/profile")}
  //             >
  //               👤
  //             </button>

  //           </div>
  //         </header>

  //         {/* Content */}
  //         <main className="customer-main">
  
            // {/* Welcome */}
            // <section className="welcome-section">
            //   <p>Selamat datang kembali!</p>

            //   <h2>
            //     Halo, {user.name || "Customer"} 👋
            //   </h2>

            //   <p className="welcome-description">
            //     Temukan makanan favoritmu hari ini.
            //   </p>
            // </section>

            // {/* Hero Banner */}
            // <section className="hero-banner">
            //   <div className="hero-content">
            //     <span className="hero-badge">
            //       SPECIAL OFFER
            //     </span>

            //     <h2>
            //       Lapar? Saatnya Temukan Favoritmu!
            //     </h2>

            //     <p>
            //       Jelajahi berbagai pilihan makanan menarik
            //       dari merchant favoritmu di Mercatix.
            //     </p>

            //     <button
            //       className="hero-button"
            //       onClick={() => {
            //         document.getElementById("products")?.scrollIntoView({
            //           behavior: "smooth",
            //         });
            //       }}
            //     >
            //       Jelajahi Produk
            //     </button>
            //   </div>

            //   <div className="hero-decoration">🍔</div>
            // </section>

            // {/* Categories */}
            // <section className="section">
            //   <div className="section-heading">
            //     <h2>Kategori Makanan</h2>
            //   </div>

            //   <div className="category-list">
            //     {categories.map((category) => (
            //       <button
            //         key={category}
            //         className={`category-button ${
            //           activeCategory === category ? "active" : ""
            //         }`}
            //         onClick={() => setActiveCategory(category)}
            //       >
            //         {category}
            //       </button>
            //     ))}
            //   </div>
            // </section>

            // {/* Products */}
            // <section className="section" id="products">
            //   <div className="products-heading">
            //     <div className="section-heading">
            //       <h2>Rekomendasi Untukmu</h2>
            //       <p>
            //         Pilihan makanan yang mungkin kamu sukai.
            //       </p>
            //     </div>

            //     <span className="product-count">
            //       {filteredProducts.length} Produk
            //     </span>
            //   </div>

            //   {filteredProducts.length > 0 ? (
            //     <div className="product-grid">
            //       {filteredProducts.map((product) => (
            //         <article className="product-card" key={product.id}>

            //           <div className="product-image-wrapper">
            //             <img
            //               src={product.image}
            //               alt={product.name}
            //               className="product-image"
            //             />

            //             <span className="product-category">
            //               {product.category}
            //             </span>
            //           </div>

            //           <div className="product-info">
            //             <h3 className="product-name">
            //               {product.name}
            //             </h3>

            //             <p className="product-merchant">
            //               {product.merchant}
            //             </p>

            //             <div className="product-details">
            //               <span className="product-price">
            //                 {formatPrice(product.price)}
            //               </span>

            //               <span className="product-rating">
            //                 ⭐ {product.rating}
            //               </span>
            //             </div>

            //             <button
            //               className="add-cart-button"
            //               onClick={() => {
            //                 setCartCount((count) => count + 1);
            //               }}
            //             >
            //               + Tambah
            //             </button>
            //           </div>

            //         </article>
            //       ))}
            //     </div>
            //   ) : (
            //     <div className="empty-state">
            //       <div className="empty-icon">🔍</div>

            //       <h3>Produk tidak ditemukan</h3>

            //       <p>
            //         Coba gunakan kata kunci atau kategori lain.
            //       </p>
            //     </div>
            //   )}
            // </section>

            // {/* Footer */}
            // <footer className="customer-footer">
            //   © 2026 Mercatix. All rights reserved.
            // </footer>

  //         </main>
  //       </div>
  //     </div>
  //   </>
  // );
}
