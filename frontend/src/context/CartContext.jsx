import { createContext, useContext, useEffect, useState } from "react";
import { getCartItems } from "../api/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const refreshCart = async () => {
    try {
      const result = await getCartItems();
      setCartItems(result.data || []);
    } catch (error) {
      console.error("Fetch cart error:", error);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider value={{
      isCartOpen,
      setIsCartOpen,
      cartItems,
      setCartItems,
      cartCount,
      refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);