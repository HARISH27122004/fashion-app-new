"use client";

import { useEffect, useState } from "react";
import {
  addNotification,
  useNotifications,
  clearAllNotifications,
  removeNotification,
} from "@/hooks/useNotifications";
import { supabase } from "@/lib/supabase";
import styles from "./admin.module.css";

const DISCOUNT_OPTIONS = [10, 20, 30, 50, 70];

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  discount_percent: number | null;
  image: string;
  category: string;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [customMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const notifications = useNotifications();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase.from("products").select("*");
    if (error) { console.error(error); return; }
    if (data) {
      setProducts(data.map((p) => ({ ...p, id: String(p.id) })));
    }
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const discountedPrice = selectedProduct && discountPercent > 0
    ? (selectedProduct.price * (1 - discountPercent / 100)).toFixed(2)
    : null;

  const autoMessage = selectedProduct && discountPercent > 0
    ? `${discountPercent}% OFF on ${selectedProduct.name}! Now $${discountedPrice}`
    : "";

  const finalMessage = customMessage.trim() || autoMessage;

  async function handleSendOffer() {
    if (!selectedProduct || discountPercent === 0) return;
    setLoading(true);

    try {
      // 1. Save original price if not already saved
      const originalPrice = selectedProduct.original_price ?? selectedProduct.price;
      const newPrice = parseFloat(
        (originalPrice * (1 - discountPercent / 100)).toFixed(2)
      );

      // 2. Update Supabase
      const { error } = await supabase
        .from("products")
        .update({
          price: newPrice,
          original_price: originalPrice,
          discount_percent: discountPercent,
        })
        .eq("id", selectedProduct.id);

      if (error) { console.error(error); setLoading(false); return; }

      // 3. Send notification with product_id so toast links to product
      addNotification(finalMessage, selectedProduct.id);

      // 4. Refresh products list
      await fetchProducts();

      setSent(true);
      setTimeout(() => setSent(false), 2500);
      setSelectedProductId("");
      setDiscountPercent(0);
      setCustomMessage("");
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function handleRemoveDiscount(product: Product) {
    if (!product.original_price) return;
    setRemovingId(product.id);

    await supabase
      .from("products")
      .update({
        price: product.original_price,
        original_price: null,
        discount_percent: 0,
      })
      .eq("id", product.id);

    await fetchProducts();
    setRemovingId(null);
  }

  const discountedProducts = products.filter(
    (p) => p.discount_percent && p.discount_percent > 0
  );

  return (
    <main className={styles.main}>

      {/* ── Offer composer ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.badge}>ADMIN</span>
          <h1 className={styles.title}>Send Product Offer</h1>
          <p className={styles.subtitle}>
            Select a product, set a discount, and send a notification. The price
            updates in Supabase and a toast appears on the landing page.
          </p>
        </div>

        {/* Step 1: Pick product */}
        <div className={styles.section}>
          <label className={styles.label}>1. Select Product</label>
          <div className={styles.productGrid}>
            {products.map((p) => (
              <button
                key={p.id}
                className={`${styles.productChip} ${
                  selectedProductId === p.id ? styles.productChipActive : ""
                } ${p.discount_percent ? styles.productChipDiscounted : ""}`}
                onClick={() => setSelectedProductId(p.id)}
              >
                <span className={styles.chipName}>{p.name}</span>
                <span className={styles.chipPrice}>
                  {p.discount_percent ? (
                    <>
                      <s>${p.original_price?.toFixed(2)}</s>
                      {" "}
                      <strong>${p.price.toFixed(2)}</strong>
                    </>
                  ) : (
                    `$${p.price.toFixed(2)}`
                  )}
                </span>
                {p.discount_percent ? (
                  <span className={styles.discountTag}>{p.discount_percent}% OFF</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Discount */}
        {selectedProductId && (
          <div className={styles.section}>
            <label className={styles.label}>2. Select Discount</label>
            <div className={styles.discountGrid}>
              {DISCOUNT_OPTIONS.map((d) => (
                <button
                  key={d}
                  className={`${styles.discountChip} ${
                    discountPercent === d ? styles.discountChipActive : ""
                  }`}
                  onClick={() => setDiscountPercent(d)}
                >
                  {d}%
                </button>
              ))}
            </div>

            {/* Preview */}
            {discountPercent > 0 && selectedProduct && (
              <div className={styles.preview}>
                <span className={styles.previewLabel}>Price after discount:</span>
                <span className={styles.previewOld}>
                  ${(selectedProduct.original_price ?? selectedProduct.price).toFixed(2)}
                </span>
                <span className={styles.previewArrow}>→</span>
                <span className={styles.previewNew}>${discountedPrice}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Message */}
        {selectedProductId && discountPercent > 0 && (
          <div className={styles.section}>
            <label className={styles.label}>
              3. Notification Message
              <span className={styles.labelNote}>(optional — auto-generated if blank)</span>
            </label>
            <textarea
              className={styles.textarea}
              placeholder={autoMessage}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={2}
              maxLength={200}
            />
            <div className={styles.composerFooter}>
              <span className={styles.charCount}>
                Preview: {finalMessage || autoMessage}
              </span>
            </div>
          </div>
        )}

        {/* Send button */}
        <button
          className={`${styles.sendBtn} ${sent ? styles.sentBtn : ""}`}
          onClick={handleSendOffer}
          disabled={!selectedProductId || discountPercent === 0 || loading || sent}
        >
          {sent ? "✓ Offer Sent!" : loading ? "Sending..." : "Send Offer Notification"}
        </button>
      </div>

      {/* ── Active discounts ── */}
      {discountedProducts.length > 0 && (
        <div className={styles.card}>
          <div className={styles.listHeader}>
            <h2 className={styles.listTitle}>
              Active Discounts
              <span className={styles.count}>{discountedProducts.length}</span>
            </h2>
          </div>
          <ul className={styles.list}>
            {discountedProducts.map((p) => (
              <li key={p.id} className={styles.item}>
                <div className={styles.itemContent}>
                  <p className={styles.itemMessage}>{p.name}</p>
                  <p className={styles.itemSub}>
                    <s>${p.original_price?.toFixed(2)}</s>
                    {" → "}
                    <strong>${p.price.toFixed(2)}</strong>
                    {" "}
                    <span className={styles.discountBadge}>{p.discount_percent}% OFF</span>
                  </p>
                </div>
                <button
                  className={styles.restoreBtn}
                  onClick={() => handleRemoveDiscount(p)}
                  disabled={removingId === p.id}
                >
                  {removingId === p.id ? "..." : "Remove"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Sent notifications ── */}
      <div className={styles.card}>
        <div className={styles.listHeader}>
          <h2 className={styles.listTitle}>
            Sent Notifications
            <span className={styles.count}>{notifications.length}</span>
          </h2>
          {notifications.length > 0 && (
            <button className={styles.clearBtn} onClick={clearAllNotifications}>
              Clear all
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔔</span>
            <p>No notifications sent yet.</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {notifications.map((n) => (
              <li key={n.id} className={styles.item}>
                <div className={styles.itemContent}>
                  <p className={styles.itemMessage}>{n.message}</p>
                  <time className={styles.itemTime}>
                    {new Date(n.created_at).toLocaleString(undefined, {
                      month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </time>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => removeNotification(n.id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}