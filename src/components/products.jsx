const PRODUCTS_KEY = "admin_products";

function loadProducts() {
  try {
    const storedProducts = JSON.parse(localStorage.getItem(PRODUCTS_KEY));
    return Array.isArray(storedProducts) ? storedProducts : [];
  } catch {
    return [];
  }
}

export const products = loadProducts();

export function getProductById(id) {
  return loadProducts().find((product) => product.id === id) ?? null;
}
