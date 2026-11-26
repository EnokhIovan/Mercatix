import { useEffect, useState } from "react";
import PageLayout from "../../layouts/PageLayout";
import {
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/api";

const categories = [
  "Makanan Berat",
  "Fast Food",
  "Snack",
  "Dessert",
  "Minuman",
];

const emptyForm = {
  name: "",
  description: "",
  category: "Makanan Berat",
  price: "",
  image: "",
  is_available: true,
};

export default function Product() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getMyProducts();
      const merchantProducts = result.data || [];

      setProducts(merchantProducts);
    } catch (err) {
      setError(err.message || "Gagal mengambil produk.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Search Products
  const filteredProducts = products.filter((product) =>
    (product.name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Format Price
  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price || 0);

  // Open Add Modal
  const handleAdd = () => {
    setEditingProduct(null);
    setForm({ ...emptyForm });
    setMessage("");
    setError("");
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleEdit = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      description: product.description || "",
      category:
        typeof product.category === "string"
          ? product.category
          : product.category?.name ||
            product.category?.nama_kategori ||
            "Makanan Berat",
      price: product.price || "",
      image: product.image || "",
      is_available: Boolean(product.is_available),
    });

    setMessage("");
    setError("");
    setModalOpen(true);
  };

  // Form Input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save Product
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const productData = {
        ...form,
        price: Number(form.price),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        setMessage("Produk berhasil diperbarui.");
      } else {
        await createProduct(productData);
        setMessage("Produk berhasil ditambahkan.");
      }

      setModalOpen(false);
      await fetchProducts();
    } catch (err) {
      setError(err.message || "Gagal menyimpan produk.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Product
  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Hapus produk "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteProduct(product.id);

      setProducts((prev) =>
        prev.filter((item) => item.id !== product.id)
      );

      setMessage("Produk berhasil dihapus.");
    } catch (err) {
      setError(err.message || "Gagal menghapus produk.");
    }
  };

  // Toggle Availability
  const handleToggleAvailability = async (product) => {
    try {
      setError("");

      const newStatus = !product.is_available;

      await updateProduct(product.id, {
        is_available: newStatus,
      });

      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, is_available: newStatus }
            : item
        )
      );
    } catch (err) {
      setError(err.message || "Gagal mengubah status produk.");
    }
  };

  const availableCount = products.filter(
    (product) => product.is_available
  ).length;

  return (
    <PageLayout title="Product">
      <div className="space-y-8">
        {/* Header */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">
              Kelola produk tokomu
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-[var(--text-primary)] sm:text-3xl">
              Produk Saya
            </h2>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Tambahkan, edit, dan atur ketersediaan produk.
            </p>
          </div>

          <button
            onClick={handleAdd}
            className="rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--primary-hover)]"
          >
            + Tambah Produk
          </button>
        </section>

        {/* Messages */}
        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-sm text-[var(--text-secondary)]">
              Total Produk
            </p>

            <h3 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">
              {products.length}
            </h3>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-sm text-[var(--text-secondary)]">
              Produk Tersedia
            </p>

            <h3 className="mt-2 text-3xl font-extrabold text-green-600">
              {availableCount}
            </h3>
          </div>
        </section>

        {/* Search */}
        <section>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama produk..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--primary)] sm:max-w-md"
          />
        </section>

        {/* Product List */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
              Daftar Produk
            </h3>

            <span className="text-sm font-bold text-[var(--primary)]">
              {filteredProducts.length} Produk
            </span>
          </div>

          {loading ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-16 text-center">
              <p className="font-semibold text-[var(--text-secondary)]">
                Memuat produk...
              </p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] transition hover:shadow-[var(--shadow-md)]"
                >
                  {/* Product Image */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-[var(--lavender-bg)]">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">
                        🍽️
                      </div>
                    )}

                    <span className="absolute left-3 top-3 rounded-md bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--primary-dark)]">
                      {typeof product.category === "string"
                        ? product.category
                        : product.category?.name ||
                          product.category?.nama_kategori ||
                          "Lainnya"}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-4 p-4">
                    <div>
                      <h4 className="truncate font-bold text-[var(--text-primary)]">
                        {product.name}
                      </h4>

                      <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">
                        {product.description || "Tidak ada deskripsi."}
                      </p>
                    </div>

                    <div>
                      <span className="font-extrabold text-[var(--primary)]">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                      <button
                        onClick={() =>
                          handleToggleAvailability(product)
                        }
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          product.is_available
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.is_available
                          ? "Tersedia"
                          : "Tidak Tersedia"}
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="rounded-lg bg-[var(--lavender-bg)] px-3 py-2 text-xs font-bold text-[var(--primary-deep)] transition hover:bg-[var(--primary)] hover:text-white"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(product)}
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-600 hover:text-white"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-16 text-center">
              <div className="text-4xl">📦</div>

              <h3 className="mt-4 font-bold text-[var(--text-primary)]">
                Belum ada produk
              </h3>

              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Tambahkan produk pertama untuk tokomu.
              </p>

              <button
                onClick={handleAdd}
                className="mt-5 rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white"
              >
                Tambah Produk
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Product Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-[var(--surface)] p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                {editingProduct ? "Edit Produk" : "Tambah Produk"}
              </h3>

              <button
                onClick={() => setModalOpen(false)}
                className="text-xl text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">
                  Nama Produk
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
                  placeholder="Contoh: Nasi Goreng"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">
                  Deskripsi
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
                  placeholder="Deskripsi produk..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">
                  Kategori
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">
                  Harga
                </label>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
                  placeholder="15000"
                />
              </div>

              {/* Image */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">
                  URL Gambar
                </label>

                <input
                  type="url"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
                  placeholder="https://..."
                />
              </div>

              {/* Availability */}
              <label className="flex items-center gap-3 text-sm font-semibold text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={form.is_available}
                  onChange={handleChange}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                Produk tersedia untuk dibeli
              </label>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-[var(--border)] px-5 py-3 text-sm font-bold text-[var(--text-secondary)]"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--primary-hover)] disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}