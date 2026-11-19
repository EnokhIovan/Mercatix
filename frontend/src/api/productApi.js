import { apiFetch } from "./api";

export function getProducts() {
  return apiFetch("products");
}
