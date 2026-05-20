"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/data/products";
import styles from "./ProductCard.module.css";
import SizePickerModal from "./Sizepickermodal";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { getQuantity, decrementFromCart, removeFromCart } = useCart();
  const bookmarked = isBookmarked(product.id);
  const quantity = getQuantity(product.id);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"cart" | "bookmark">("cart");

  const hasDiscount =
    typeof product.discount_percent === "number" &&
    product.discount_percent > 0 &&
    product.original_price != null;

  // ── Bookmark click ────────────────────────────────────────────
  function handleBookmarkClick(e: React.MouseEvent) {
    e.preventDefault();
    if (bookmarked) {
      // Already saved → remove immediately, no size needed
      toggleBookmark(product.id);
    } else {
      // Not saved yet → ask for size first
      setModalMode("bookmark");
      setModalOpen(true);
    }
  }

  // ── Add-to-cart click ─────────────────────────────────────────
  function handleAddToCartClick() {
    setModalMode("cart");
    setModalOpen(true);
  }

  // ── Modal close callback ──────────────────────────────────────
  // `sizeSelected` is true only when the user tapped a confirm button
  // (not when they dismissed or pressed Escape).
  function handleModalClose(sizeSelected?: boolean) {
    setModalOpen(false);
    if (modalMode === "bookmark" && sizeSelected) {
      toggleBookmark(product.id);
    }
  }

  return (
    <>
      <article
        className={styles.card}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* ── Image ── */}
        <Link href={`/product/${product.id}`} className={styles.imageWrap}>
          {hasDiscount && (
            <div className={styles.discountBadge}>-{product.discount_percent}%</div>
          )}

          <Image
            src={product.image}
            alt={product.name}
            fill
            className={styles.image}
            sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
          />

          {/* Bookmark — top right overlay */}
          <button
            className={`${styles.bookmarkOverlay}${bookmarked ? ` ${styles.bookmarked}` : ""}`}
            onClick={handleBookmarkClick}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill={bookmarked ? "currentColor" : "none"}
              stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          </button>
        </Link>

        {/* ── Info ── */}
        <div className={styles.info}>
          <Link href={`/product/${product.id}`} className={styles.name}>
            {product.name}
          </Link>

          <div className={styles.bottomRow}>
            <div className={styles.priceWrap}>
              <span className={`${styles.originalPrice}${hasDiscount ? "" : ` ${styles.noDiscount}`}`}>
                {hasDiscount ? `RS. ${product.original_price!.toFixed(0)}` : "\u00A0"}
              </span>
              <span className={styles.price}>
                RS. {product.price.toFixed(0)}
              </span>
            </div>

            {/* Qty controls */}
            {quantity === 0 ? (
              <button
                className={styles.addBtn}
                onClick={handleAddToCartClick}
                aria-label={`Select size for ${product.name}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            ) : (
              <div className={styles.qtyRow} role="group" aria-label="Quantity">
                <button
                  className={styles.qtyBtn}
                  onClick={() => decrementFromCart(product.id)}
                  aria-label="Remove one"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>

                <span className={styles.qtyCount}>{quantity}</span>

                <button
                  className={styles.qtyBtn}
                  onClick={handleAddToCartClick}
                  aria-label="Add one more"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Single modal instance — mode switches between "cart" and "bookmark" */}
      <SizePickerModal
        product={product}
        open={modalOpen}
        mode={modalMode}
        onClose={handleModalClose}
      />
    </>
  );
}