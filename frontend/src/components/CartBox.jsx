import { useState } from "react";
import { useCart } from "../context/CartContext";
import { cartItemsAction, cartItemsQuantity } from "../api/api";

export default function CartBox() {
  const { isCartOpen, setCartItems, setIsCartOpen, cartItems, refreshCart } =
    useCart();

  const [loadingItems, setLoadingItems] = useState([]);

  const setItemLoading = (productId, loading) => {
    setLoadingItems((items) =>
      loading ? [...items, productId] : items.filter((id) => id !== productId),
    );
  };

  const updateQuantity = async (item, change) => {
    const quantity = item.quantity + change;

    if (quantity < 1 || quantity > 10) return;

    setItemLoading(item.id, true);

    setCartItems((items) =>
      items.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity }
          : cartItem
      )
    );

    try {
      await cartItemsQuantity(item.id, quantity);
    } catch (error) {
      console.error("Update quantity error:", error);

      // Rollback jika gagal
      setCartItems((items) =>
        items.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: item.quantity }
            : cartItem
        )
      );
    } finally {
      setItemLoading(item.id, false);
    }
  };

  const handleDelete = async (productId) => {
    setItemLoading(productId, true);

    try {
      await cartItemsAction(productId, "delete");
      await refreshCart();
    } catch (error) {
      console.error("Delete cart item error:", error);
    } finally {
      setItemLoading(productId, false);
    }
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      {/* Overlay */}
      <div
        className="absolute inset-0 z-40 bg-[rgba(46,16,101,0.45)]"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Modal */}
      <div
        className="
        relative z-50 flex max-h-[85vh] w-full max-w-[480px]
        flex-col overflow-hidden rounded-2xl
        border border-[var(--border)]
        bg-[var(--surface)] shadow-[var(--shadow-lg)]
      "
      >
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
          {cartItems.length === 0 ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
              <span className="text-4xl">🛒</span>
              <h3 className="mt-3 font-bold text-[var(--text-primary)]">
                Your cart is empty
              </h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Add some products to get started!
              </p>
            </div>
          ) : (
            cartItems.map((item) => {
              const isLoading = loadingItems.includes(item.product_id);
              // console.log(item);

              return (
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
                    className="
                      h-[80px] w-[80px] shrink-0 rounded-xl
                      bg-[var(--lavender-soft)] object-cover
                    "
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

                      <div className="flex flex-row gap-3">
                        {/* Delete */}
                        <div
                          className="
                          flex items-center gap-2 rounded-lg
                          border border-[var(--border)]
                          bg-[var(--surface)] p-1
                        "
                        >
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={isLoading}
                            className="
                              flex h-8 w-8 items-center justify-center
                              rounded-md text-red-500
                              transition duration-200
                              hover:bg-red-50 hover:text-red-600
                              active:scale-90
                              disabled:cursor-not-allowed disabled:opacity-40
                            "
                            title="Hapus produk"
                          >
                            🗑
                          </button>
                        </div>

                        {/* Quantity Control */}
                        <div
                          className="
                          flex items-center gap-2 rounded-lg
                          border border-[var(--border)]
                          bg-[var(--surface)] p-1
                        "
                        >
                          <button
                            onClick={() => updateQuantity(item, -1)}
                            disabled={item.quantity <= 1 || isLoading}
                            className="
                              flex h-6 w-6 items-center justify-center
                              rounded-md text-sm
                              text-[var(--text-secondary)]
                              transition
                              hover:bg-[var(--lavender-bg)]
                              hover:text-[var(--primary)]
                              disabled:cursor-not-allowed disabled:opacity-30
                            "
                          >
                            −
                          </button>

                          <span className="min-w-5 text-center text-xs font-bold text-[var(--text-primary)]">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => updateQuantity(item, 1)}
                            disabled={item.quantity >= 10 || isLoading}
                            className="
                              flex h-6 w-6 items-center justify-center
                              rounded-md text-sm
                              text-[var(--text-secondary)]
                              transition
                              hover:bg-[var(--lavender-bg)]
                              hover:text-[var(--primary)]
                              disabled:cursor-not-allowed disabled:opacity-30
                            "
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="space-y-5 border-t border-[var(--border)] p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Total</span>

            <strong className="text-lg font-extrabold text-[var(--text-primary)]">
              Rp{subtotal.toLocaleString("id-ID")}
            </strong>
          </div>

          <button
            disabled={cartItems.length === 0}
            className="
              w-full rounded-lg
              bg-[var(--primary)] py-3.5
              text-sm font-bold text-white
              transition
              hover:bg-[var(--primary-hover)]
              disabled:cursor-not-allowed disabled:opacity-40
            "
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
