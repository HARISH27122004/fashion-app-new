"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useSearch } from "@/contexts/SearchContext";
import { getProductById, Product } from "@/data/products";
import styles from "./page.module.css";
import Header from "@/components/Header";

type CartItemWithProduct = { id: string; quantity: number; product: Product };

export default function CartPage() {
  const router = useRouter();
  const { items, addToCart, removeFromCart, clearFromCart } = useCart();
  const { setStep } = useCheckout();
  const { searchQuery } = useSearch();

  const allCartItems: CartItemWithProduct[] = items
    .map((item) => {
      const product = getProductById(item.id);
      if (!product) return null;
      return { ...item, product };
    })
    .filter((item): item is CartItemWithProduct => item !== null);

  const cartItems = allCartItems.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.product.name.toLowerCase().includes(q) || String(item.product.price).includes(q);
  });

  const total = allCartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  function handleCheckout() {
    setStep("address");
    router.push("/cart/address");
  }

  return (
    <>
      {/*
        No props needed — getRouteConfig("/cart") auto-configures:
          showMenu: true, showSearch: true, showBack: true, title: "BAG"
        Back button uses router.back() → correct previous page.
        If no history, falls back to "/".
      */}
      <Header />

      <main className={styles.main}>
        {allCartItems.length > 0 ? (
          <>
            <div className={styles.cartHeader}>
              <span className={styles.itemCount}>
                {searchQuery
                  ? <>{cartItems.length} of {allCartItems.length} item{allCartItems.length !== 1 ? "s" : ""}</>
                  : <>{allCartItems.length} item{allCartItems.length !== 1 ? "s" : ""}</>
                }
              </span>
              <button
                className={styles.clearBtn}
                onClick={() => allCartItems.forEach((item) => clearFromCart(item.id))}
              >
                Clear all
              </button>
            </div>

            {searchQuery && (
              <div className={styles.searchInfo}>
                {cartItems.length > 0
                  ? `Showing results for "${searchQuery}"`
                  : `No cart items match "${searchQuery}"`}
              </div>
            )}

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
                      <p className={styles.productPrice}>₹{product.price.toFixed(2)}</p>
                    </div>
                    <div className={styles.quantityControl}>
                      <button className={styles.qtyBtn} onClick={() => removeFromCart(id)}>–</button>
                      <span className={styles.quantity}>{quantity}</span>
                      <button className={styles.qtyBtn} onClick={() => addToCart(id)}>+</button>
                    </div>
                    <div className={styles.itemTotal}>₹{(product.price * quantity).toFixed(2)}</div>
                    <button className={styles.removeBtn} onClick={() => clearFromCart(id)}>🗑</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <h2>No items match your search</h2>
                <p>Try a different name or price</p>
              </div>
            )}

            <div className={styles.summary}>
              <div className={styles.summaryRow}><span>Subtotal</span><span>₹{total.toFixed(2)}</span></div>
              <div className={styles.summaryRow}><span>Shipping</span><span>Free</span></div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Total</span><span>₹{total.toFixed(2)}</span>
              </div>
              <button className={styles.checkoutBtn} onClick={handleCheckout}>
                Continue to Address
              </button>
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven&apos;t added anything yet</p>
            <button className={styles.checkoutBtn} onClick={() => router.push("/")}>
              Go Shopping
            </button>
          </div>
        )}
      </main>
    </>
  );
}