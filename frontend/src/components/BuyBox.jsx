
import { useState } from "react";
import { useBuy } from "../context/BuyContext";
import { transfer } from "../api/api";

export default function BuyBox({ dataProduct }) {
  console.log(dataProduct);
  const { buyBoxOpen, setBuyBoxOpen } = useBuy();

  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  if (!buyBoxOpen || !dataProduct) return null;

  const price = Number(dataProduct.price);
  const subtotal = price * quantity;

  const transferHandler = async () => {
    if (!dataProduct) return;

    const merchantId = dataProduct.merchant?.id;
    const productId = dataProduct.id;

    if (!merchantId || !productId) {
      console.error("Data merchant atau produk tidak ditemukan.");
      return;
    }

    setIsLoading(true);

    try {
      await transfer(
        merchantId,
        productId,
        subtotal,
        "Pembayaran produk"
      );

      setBuyBoxOpen(false);
    } catch (error) {
      console.error("Transfer gagal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      {/* Overlay */}
      <div
        className="absolute inset-0 z-40 bg-[rgba(46,16,101,0.45)]"
        onClick={() => setBuyBoxOpen(false)}
      />

      {/* Product Modal */}
      <div className="relative z-50 w-full max-w-[420px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
          <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
            Detail Produk
          </h2>

          <button
            onClick={() => setBuyBoxOpen(false)}
            className="rounded-lg px-3 py-2 text-[var(--text-secondary)] transition hover:bg-[var(--lavender-bg)] hover:text-[var(--primary)]"
          >
            ✕
          </button>
        </div>

        {/* Product Image */}
        <div className="p-5 pb-0">
          <img
            src={dataProduct.image}
            alt={dataProduct.name}
            className="h-[210px] w-full rounded-xl bg-[var(--lavender-soft)] object-cover"
          />
        </div>

        {/* Product Information */}
        <div className="space-y-3 p-5">
          <div>
            <span className="text-xs font-semibold text-[var(--primary)]">
              {dataProduct.category}
            </span>

            <h3 className="mt-1 text-xl font-extrabold text-[var(--text-primary)]">
              {dataProduct.name}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              {dataProduct.description || "Tidak ada deskripsi."}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between border-y border-[var(--border)] py-4">
            <span className="text-sm text-[var(--text-secondary)]">
              Harga produk
            </span>

            <strong className="text-lg font-extrabold text-[var(--primary)]">
              Rp{price.toLocaleString("id-ID")}
            </strong>
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Jumlah
            </span>

            <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1 || isLoading}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-secondary)] transition hover:bg-[var(--lavender-bg)] hover:text-[var(--primary)] disabled:opacity-30"
              >
                −
              </button>

              <span className="min-w-5 text-center text-sm font-bold text-[var(--text-primary)]">
                {quantity}
              </span>

              <button
                onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
                disabled={quantity >= 10 || isLoading}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-secondary)] transition hover:bg-[var(--lavender-bg)] hover:text-[var(--primary)] disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-4 border-t border-[var(--border)] bg-[var(--lavender-bg)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Total harga
            </span>

            <strong className="text-xl font-extrabold text-[var(--text-primary)]">
              Rp{subtotal.toLocaleString("id-ID")}
            </strong>
          </div>

          <button
            onClick={transferHandler}
            disabled={isLoading}
            className="w-full rounded-lg bg-[var(--primary)] py-3.5 text-sm font-bold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Memproses..." : "Beli"}
          </button>
        </div>
      </div>
    </div>
  );
}
