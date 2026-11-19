import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Explore.css";
import PageLayout from "../../layouts/PageLayout";
import { useCart } from "../../context/CartContext";
import { getProducts } from "../../api/productApi";

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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { setCartCount } = useCart();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch Products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const result = await getProducts();

        setProducts(result.data || []);
      } catch (error) {
        console.error("Fetch products error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Get merchant name
  const getMerchantName = (merchant) => {
    if (typeof merchant === "string") {
      return merchant;
    }

    return merchant?.store_name || merchant?.name || "Merchant";
  };

  // Get category name
  const getCategoryName = (category) => {
    if (typeof category === "string") {
      return category;
    }

    return category?.name || category?.nama_kategori || "Lainnya";
  };

  // Filter Products
  const filteredProducts = products.filter((product) => {
    const merchantName = getMerchantName(product.merchant);
    const categoryName = getCategoryName(product.category);

    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      merchantName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === "Semua" || categoryName === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // Format Price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <PageLayout title="Explore">
        {/* Welcome */}
        <section className="welcome-section">
          <p>Selamat datang kembali!</p>

          <h2>Halo, {user.name || "Customer"} 👋</h2>

          <p className="welcome-description">
            Temukan makanan favoritmu hari ini.
          </p>
        </section>

        {/* Hero Banner */}
        <section className="hero-banner">
          <div className="hero-content">
            <span className="hero-badge">SPECIAL OFFER</span>

            <h2>Lapar? Saatnya Temukan Favoritmu!</h2>

            <p>
              Jelajahi berbagai pilihan makanan menarik dari merchant favoritmu
              di Mercatix.
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
              <p>Pilihan makanan yang mungkin kamu sukai.</p>
            </div>

            <span className="product-count">
              {filteredProducts.length} Produk
            </span>
          </div>

          {loading ? (
            <div className="empty-state">
              <h3>Memuat produk...</h3>
            </div>
          ) : filteredProducts.length > 0 ? (
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
                      {getCategoryName(product.category)}
                    </span>
                  </div>

                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>

                    <p className="product-merchant">
                      {getMerchantName(product.merchant)}
                    </p>

                    <div className="product-details">
                      <span className="product-price">
                        {formatPrice(product.price)}
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

              <p>Coba gunakan kata kunci atau kategori lain.</p>
            </div>
          )}
        </section>
      </PageLayout>
    </>
  );
}
