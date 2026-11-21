import { useState } from "react";
import { products } from "../dummy/products";
import { useCart } from "../context/CartContext";

export default function CartBox() {
  const { isCartOpen, setIsCartOpen } = useCart();
  if (!isCartOpen) return null;

  const [cartItems, setCartItems] = useState([
    { ...products[0], quantity: 2 },
    { ...products[1], quantity: 1 },
    { ...products[4], quantity: 3 },
  ]);

  const updateQuantity = (id, change) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(10, Math.max(1, item.quantity + change)),
            }
          : item,
      ),
    );
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      {/* Overlay */}
      <div
        className="absolute inset-0 z-40 bg-[rgba(46,16,101,0.45)]"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Modal */}
      <div className="flex inset-0 z-100 max-h-[85vh] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] p-6">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
              My Cart
            </h2>

            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {totalQuantity} items in your cart
            </p>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="
              rounded-lg px-3 py-2
              text-[var(--text-secondary)]
              transition
              hover:bg-[var(--lavender-bg)]
              hover:text-[var(--primary)]
            "
          >
            ✕
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 min-h-0 space-y-3 overflow-y-auto p-5">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="
                group flex gap-4 rounded-xl
                border border-transparent p-3
                transition duration-200
                hover:border-[var(--lavender-light)]
                hover:bg-[var(--lavender-bg)]
              "
            >
              {/* Product Image */}
              <img
                src={item.image}
                alt={item.name}
                className="h-[80px] w-[80px] shrink-0 rounded-xl bg-[var(--lavender-soft)] object-cover"
              />

              {/* Product Info */}
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {item.merchant}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <strong className="text-sm font-extrabold text-[var(--primary)]">
                    Rp{(item.price * item.quantity).toLocaleString("id-ID")}
                  </strong>

                  {/* Quantity Control */}
                  <div
                    className="
                    flex items-center gap-2 rounded-lg
                    border border-[var(--border)]
                    bg-[var(--surface)] p-1
                  "
                  >
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={item.quantity <= 1}
                      className="
                        flex h-6 w-6 items-center justify-center
                        rounded-md text-sm
                        text-[var(--text-secondary)]
                        transition
                        hover:bg-[var(--lavender-bg)]
                        hover:text-[var(--primary)]
                        disabled:cursor-not-allowed
                        disabled:opacity-30
                      "
                    >
                      −
                    </button>

                    <span className="min-w-5 text-center text-xs font-bold text-[var(--text-primary)]">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      disabled={item.quantity >= 10}
                      className="
                        flex h-6 w-6 items-center justify-center
                        rounded-md text-sm
                        text-[var(--text-secondary)]
                        transition
                        hover:bg-[var(--lavender-bg)]
                        hover:text-[var(--primary)]
                        disabled:cursor-not-allowed
                        disabled:opacity-30
                      "
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="space-y-5 border-t border-[var(--border)] p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">
              Subtotal
            </span>

            <strong className="text-lg font-extrabold text-[var(--text-primary)]">
              Rp{subtotal.toLocaleString("id-ID")}
            </strong>
          </div>

          <button
            className="
            w-full rounded-lg
            bg-[var(--primary)] py-3.5
            text-sm font-bold text-white
            transition
            hover:bg-[var(--primary-hover)]
          "
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
