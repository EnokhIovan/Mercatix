
const API_URL = "http://localhost:8000/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// Wallet
export const getBalance = () => request("/wallet");
export const topUp = (amount, description) =>
  request("/wallet/topup", {
    method: "POST",
    body: JSON.stringify({
      amount,
      description,
    }),
  });
export const transfer = (target, amount) =>
  request("/wallet/transfer", {
    method: "POST",
    body: JSON.stringify({
      target,
      amount,
    }),
  });

// Products
export const getProducts = () => request("/products");

export const getProduct = (id) =>
  request(`/products/${id}`);

// Products
export const getCartItems = () => request("/cart");

// Customers
export const getCustomers = () => request("/customers");

export const getCustomer = (id) =>
  request(`/customers/${id}`);

// Merchants
export const getMerchants = () => request("/merchants");

export const getMerchant = (id) =>
  request(`/merchants/${id}`);
