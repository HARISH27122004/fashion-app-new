// app/cart/page.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useSearch } from "@/contexts/SearchContext";
import { getProductById, Product } from "@/data/products";
import styles from "./page.module.css";
import Header from '@/components/Header';

type CartItemWithProduct = {
  id: string;
  quantity: number;
  product: Product;
};

export default function CartPage() {
  const router = useRouter();
  const { items, addToCart, removeFromCart, clearFromCart } = useCart();
  const { setStep } = useCheckout();
  const { searchQuery } = useSearch(); // ✅ global search

  // ✅ Map cart items to products
  const allCartItems: CartItemWithProduct[] = items
    .map((item) => {
      const product = getProductById(item.id);
      if (!product) return null;
      return { ...item, product };
    })
    .filter((item): item is CartItemWithProduct => item !== null);

  // ✅ Apply search filter on top
  const cartItems: CartItemWithProduct[] = allCartItems.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const matchesName = item.product.name.toLowerCase().includes(q);
    const matchesPrice = String(item.product.price).includes(q);
    return matchesName || matchesPrice;
  });

  // ✅ Total is always calculated from ALL items (not filtered)
  const total = allCartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  function handleCheckout() {
    setStep("address");
    router.push("/cart/address");
  }

  return (
    <>
    <Header showMenu showSearch/>
    <main className={styles.main}>
      {allCartItems.length > 0 ? (
        <>
          {/* Header */}
          <div className={styles.cartHeader}>
            <span className={styles.itemCount}>
              {searchQuery ? (
                // Show filtered count vs total when searching
                <>
                  {cartItems.length} of {allCartItems.length} item
                  {allCartItems.length !== 1 ? "s" : ""}
                </>
              ) : (
                <>
                  {allCartItems.length} item
                  {allCartItems.length !== 1 ? "s" : ""}
                </>
              )}
            </span>

            <button
              className={styles.clearBtn}
              onClick={() => allCartItems.forEach((item) => clearFromCart(item.id))}
            >
              Clear all
            </button>
          </div>

          {/* Search info bar — shown only when searching */}
          {searchQuery && (
            <div className={styles.searchInfo}>
              {cartItems.length > 0
                ? `Showing results for "${searchQuery}"`
                : `No cart items match "${searchQuery}"`}
            </div>
          )}

          {/* List */}
          {cartItems.length > 0 ? (
            <div className={styles.cartList}>
              {cartItems.map(({ id, quantity, product }) => (
                <div key={id} className={styles.cartItem}>
                  <div className={styles.productImageWrap}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={80}
                      height={80}
                      className={styles.productImage}
                    />
                  </div>

                  <div className={styles.productDetails}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.productPrice}>
                      ${product.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className={styles.quantityControl}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => removeFromCart(id)}
                    >
                      –
                    </button>
                    <span className={styles.quantity}>{quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => addToCart(id)}
                    >
                      +
                    </button>
                  </div>

                  {/* Item total */}
                  <div className={styles.itemTotal}>
                    ${(product.price * quantity).toFixed(2)}
                  </div>

                  {/* Remove */}
                  <button
                    className={styles.removeBtn}
                    onClick={() => clearFromCart(id)}
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          ) : (
            // Filtered to zero — cart has items but none match search
            <div className={styles.empty}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="10.5" cy="10.5" r="6.5" />
                <line x1="16" y1="16" x2="21" y2="21" />
              </svg>
              <h2>No items match your search</h2>
              <p>Try a different name or price</p>
            </div>
          )}

          {/* Summary — always shows full cart total */}
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              Continue to Address
            </button>
          </div>
        </>
      ) : (
        // Truly empty cart
        <div className={styles.empty}>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven&apos;t added anything yet</p>
          <button
            className={styles.checkoutBtn}
            onClick={() => router.push("/")}
          >
            Go Shopping
          </button>
        </div>
      )}
    </main>
    </>
  );
}