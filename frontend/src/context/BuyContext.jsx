import { createContext, useContext, useState } from "react";

const BuyContext = createContext(null);

export function BuyProvider({ children }) {
  const [buyBoxOpen, setBuyBoxOpen] = useState(false);
  const [productId, setPrductId] = useState(0);

  return (
    <BuyContext.Provider
      value={{ buyBoxOpen, setBuyBoxOpen, productId, setPrductId }}
    >
      {children}
    </BuyContext.Provider>
  );
}

export function useBuy() {
  return useContext(BuyContext);
}
