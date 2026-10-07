import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('shoplite_cart') || '[]'));
  useEffect(() => localStorage.setItem('shoplite_cart', JSON.stringify(items)), [items]);

  // item = { product_id, name, price, quantity, max }
  const add = (product, quantity = 1) => {
    const max = product.stock?.available_stock ?? 999;
    setItems((prev) => {
      const found = prev.find((i) => i.product_id === product.id);
      if (found) return prev.map((i) => (i.product_id === product.id ? { ...i, quantity: Math.min(i.quantity + quantity, max), max } : i));
      return [...prev, { product_id: product.id, name: product.name, price: Number(product.price), quantity: Math.min(quantity, max), max }];
    });
  };
  const setQty = (id, quantity) => setItems((prev) => prev.map((i) => (i.product_id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.max)) } : i)));
  const remove = (id) => setItems((prev) => prev.filter((i) => i.product_id !== id));
  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return <CartContext.Provider value={{ items, add, setQty, remove, clear, total, count }}>{children}</CartContext.Provider>;
}
