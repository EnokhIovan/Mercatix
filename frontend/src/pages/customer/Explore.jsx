import { useEffect, useState } from "react";
import PageLayout from "../../layouts/PageLayout";
import BuyBox from "../../components/BuyBox";
import {BuyProvider, useBuy} from "../../context/BuyContext";
import { useCart } from "../../context/CartContext";
import { getProducts } from "../../api/api";

const categories = [
  "Semua",
  "Makanan Berat",
  "Fast Food",
  "Snack",
  "Dessert",
  "Minuman",
];
export default function Explore() {
  return(
    <BuyProvider>
      <ExploreContent/>
    </BuyProvider>
  )
}

function ExploreContent() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { buyBoxOpen, setBuyBoxOpen } = useBuy();  

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

  // Get Merchant Name
  const getMerchantName = (merchant) => {
    if (typeof merchant === "string") {
      return merchant;
    }

    return merchant?.store_name || merchant?.name || "Merchant";
  };

  // Get Category Name
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

  // Add to Cart
  const handleAddToCart = () => {
    setCartCount((count) => count + 1);
  };

  return (
    <>
      <BuyBox/>

      <PageLayout title="Explore" searchBox="true">
        {/* Welcome */}
        <section className="mb-7">
          <p className="text-sm text-[var(--text-secondary)]">
            Selamat datang kembali!
          </p>

          <h2 className="my-2 text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-[28px]">
            Halo, {user.name || "Customer"} 👋
          </h2>

          <p className="text-sm text-[var(--text-muted)]">
            Temukan makanan favoritmu hari ini.
          </p>
        </section>

        {/* Hero Banner */}
        <section className="relative mb-10 overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--primary-dark)] via-[var(--primary-deep)] to-[var(--primary)] px-6 py-8 text-white sm:px-12 sm:py-12">
          <div className="relative z-10 max-w-[520px]">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold tracking-wider">
              SPECIAL OFFER
            </span>

            <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">
              Lapar? Saatnya Temukan Favoritmu!
            </h2>

            <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--lavender-light)]">
              Jelajahi berbagai pilihan makanan menarik dari merchant favoritmu di
              Mercatix.
            </p>

            <button
              onClick={() => {
                document.getElementById("products")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="mt-6 rounded-lg bg-[var(--surface)] px-6 py-3 text-sm font-bold text-[var(--primary-dark)] transition hover:-translate-y-0.5 hover:bg-[var(--lavender-bg)]"
            >
              Jelajahi Produk
            </button>
          </div>

          <div className="pointer-events-none absolute right-[8%] top-1/2 hidden -translate-y-1/2 text-[180px] opacity-[0.18] sm:block">
            🍔
          </div>

          <div className="pointer-events-none absolute -bottom-5 -right-4 text-[100px] opacity-[0.18] sm:hidden">
            🍔
          </div>
        </section>

        {/* Categories */}
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
              Kategori Makanan
            </h2>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-lg border px-5 py-3 text-[13px] font-semibold transition ${
                  activeCategory === category
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-[var(--shadow-sm)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--primary-light)] hover:text-[var(--primary)]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Products */}
        <section id="products" className="mb-10 scroll-mt-24">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
                Rekomendasi Untukmu
              </h2>

              <p className="mt-1.5 text-[13px] text-[var(--text-secondary)]">
                Pilihan makanan yang mungkin kamu sukai.
              </p>
            </div>

            <span className="text-[13px] font-bold text-[var(--primary)]">
              {filteredProducts.length} Produk
            </span>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-5 py-16 text-center">
              <h3 className="font-semibold text-[var(--text-secondary)]">
                Memuat produk...
              </h3>
            </div>
          ) : filteredProducts.length > 0 ? (
            /* Product Grid */
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
                >
                  {/* Product Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--lavender-bg)]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />

                    <span className="absolute left-3 top-3 rounded-lg bg-[var(--surface)]/95 px-2.5 py-1.5 text-[10px] font-bold text-[var(--primary-dark)]">
                      {getCategoryName(product.category)}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="p-3 sm:p-4">
                    <h3
                      className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold text-[var(--text-primary)] sm:text-sm"
                      title={product.name}
                    >
                      {product.name}
                    </h3>

                    <p className="mb-3 mt-1.5 text-xs text-[var(--text-muted)]">
                      {getMerchantName(product.merchant)}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-[var(--primary)] sm:text-sm">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setBuyBoxOpen(true)}
                        className="mt-4 flex-1 rounded-lg bg-[var(--primary)] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[var(--primary-hover)]"
                      >
                        Beli
                      </button>

                      <button
                        onClick={handleAddToCart}
                        className="mt-4 w-10 shrink-0 rounded-lg bg-[var(--lavender-bg)] py-2.5 text-xs font-bold text-[var(--primary-deep)] transition hover:bg-[var(--primary)] hover:text-white"
                      >
                        🛒
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-16 text-center">
              <div className="text-4xl">🔍</div>

              <h3 className="mb-2 mt-4 font-bold text-[var(--text-primary)]">
                Produk tidak ditemukan
              </h3>

              <p className="text-[13px] text-[var(--text-secondary)]">
                Coba gunakan kata kunci atau kategori lain.
              </p>
            </div>
          )}
        </section>
      </PageLayout>
    </>
  );
}