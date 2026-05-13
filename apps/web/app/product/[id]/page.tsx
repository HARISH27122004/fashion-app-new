// app/product/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { useCart } from "@/contexts/CartContext";
import SizePickerModal from "@/components/Sizepickermodal";
import styles from "./page.module.css";

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"cart" | "bookmark">("cart");

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { removeFromCart, getQuantity } = useCart();

  useEffect(() => { fetchProduct(); }, []);

  async function fetchProduct() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.id)
      .single();
    if (error) { console.log(error); return; }
    if (data) setProduct({ ...data, id: String(data.id) });
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className={styles.notFound}><p>Loading...</p></div>
      </>
    );
  }

  const bookmarked  = isBookmarked(product.id);
  const quantity    = getQuantity(product.id);
  const hasDiscount = product.discount_percent != null && product.discount_percent > 0;

  function openCartModal() {
    setModalMode("cart");
    setModalOpen(true);
  }

  function handleModalClose(sizeSelected?: boolean) {
    setModalOpen(false);
  }

  return (
    <>
      <Header />

      <main className={styles.main}>
        <div className={styles.imageContainer} id="product-image">
          {hasDiscount && (
            <div className={styles.discountBadge}>{product.discount_percent}% OFF</div>
          )}
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={700}
            className={styles.image}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className={styles.content}>
          <div className={styles.titleRow}>
            <h2 className={styles.productName}>{product.name}</h2>
            <span className={styles.stockBadge}>In Stock</span>
          </div>

          {hasDiscount && (
            <div className={styles.offerBanner}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              <span>Limited time offer — {product.discount_percent}% off applied!</span>
            </div>
          )}

          <div className={styles.descriptionSection}>
            <h3 className={styles.sectionLabel}>Description</h3>
            <p className={styles.description}>{product.description}</p>
          </div>
        </div>
      </main>

      {/* Bottom action bar */}
      <div className={styles.bottomBar}>
        <button className={styles.buyNowWrap} onClick={openCartModal}>
          <span className={styles.buyNowText}>Buy Now</span>
        </button>

        <div className={styles.bottomRight}>
          <div className={styles.priceStack}>
            {hasDiscount && (
              <span className={styles.originalPrice}>
                ${product.original_price?.toFixed(2)}
              </span>
            )}
            <span className={`${styles.bottomPrice} ${hasDiscount ? styles.discountedPrice : ""}`}>
              ${product.price.toFixed(2)}
            </span>
          </div>

          <div className={styles.qtyControl}>
            {quantity > 0 ? (
              <>
                <button className={styles.qtyBtn} onClick={() => removeFromCart(product.id)} aria-label="Remove one">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span className={styles.qtyCount}>{quantity}</span>
                {/* + opens the size picker */}
                <button className={`${styles.qtyBtn} ${styles.qtyBtnFilled}`} onClick={openCartModal} aria-label="Add one">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </>
            ) : (
              /* + opens the size picker */
              <button className={`${styles.qtyBtn} ${styles.qtyBtnFilled}`} onClick={openCartModal} aria-label="Add to cart">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            )}
          </div>

          <button
            className={`${styles.bookmarkBtn} ${bookmarked ? styles.bookmarked : ""}`}
            onClick={() => toggleBookmark(product.id)}
            aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}>
            <svg width="20" height="20" viewBox="0 0 24 24"
              fill={bookmarked ? "currentColor" : "none"}
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Size picker modal */}
      <SizePickerModal
        product={product}
        open={modalOpen}
        mode={modalMode}
        onClose={handleModalClose}
      />
    </>
  );
}