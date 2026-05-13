"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import styles from "./Sizepickermodal.module.css";
import type { Product } from "@/data/products";

const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

interface SizePickerModalProps {
  product: Product | null;
  open: boolean;
  /**
   * "cart"     → shows ADD TO BAG + BUY NOW  (default)
   * "bookmark" → shows SAVE TO WISHLIST only, no BUY NOW
   */
  mode?: "cart" | "bookmark";
  /**
   * Called when the modal closes.
   * `sizeSelected` is true only when the user confirmed a size
   * (clicked a primary action button). False when dismissed/escaped.
   */
  onClose: (sizeSelected?: boolean) => void;
}

export default function SizePickerModal({
  product,
  open,
  mode = "cart",
  onClose,
}: SizePickerModalProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();

  // Reset size when a new product opens
  useEffect(() => {
    if (open) setSelectedSize(null);
  }, [open, product?.id]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll on mobile only
  useEffect(() => {
    const isMobile = window.innerWidth < 769;
    if (!isMobile) return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!product) return null;

  const hasDiscount =
    typeof product.discount_percent === "number" &&
    product.discount_percent > 0 &&
    product.original_price != null;

  const isBookmarkMode = mode === "bookmark";

  function requireSize(): boolean {
    if (selectedSize) return true;
    setShake(true);
    setTimeout(() => setShake(false), 600);
    return false;
  }

  function handleAddToCart() {
    if (!requireSize()) return;
    addToCart(product!.id);
    onClose(true); // confirmed
  }

  function handleBuyNow() {
    if (!requireSize()) return;
    addToCart(product!.id);
    onClose(true); // confirmed
    router.push("/login");
  }

  function handleSaveToWishlist() {
    if (!requireSize()) return;
    onClose(true); // confirmed — ProductCard will call toggleBookmark
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ""}`}
        onClick={() => onClose(false)}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={`${styles.sheet} ${open ? styles.sheetOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={isBookmarkMode ? "Select size to save" : "Select size"}
      >
        {/* Drag handle — mobile only */}
        <div className={styles.handle} />

        {/* Close button — desktop only */}
        <button
          className={styles.closeBtn}
          onClick={() => onClose(false)}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <p className={styles.productName}>{product.name}</p>
            <div className={styles.priceRow}>
              {hasDiscount && (
                <span className={styles.originalPrice}>
                  RS. {product.original_price!.toFixed(0)}
                </span>
              )}
              <span className={styles.price}>RS. {product.price.toFixed(0)}</span>
              {hasDiscount && (
                <span className={styles.discountBadge}>-{product.discount_percent}%</span>
              )}
            </div>
          </div>
          <button className={styles.sizeGuideBtn} aria-label="Size guide">
            Size Guide
          </button>
        </div>

        {/* Mode indicator pill */}
        {isBookmarkMode && (
          <div className={styles.modePill}>
            <svg width="12" height="12" viewBox="0 0 24 24"
              fill="currentColor" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
            Choose a size to save to wishlist
          </div>
        )}

        {/* Size label */}
        <p className={styles.sizeLabel}>
          SELECT SIZE
          {selectedSize && (
            <span className={styles.sizeLabelSelected}> — {selectedSize}</span>
          )}
        </p>

        {/* Size grid */}
        <div className={`${styles.sizeGrid} ${shake ? styles.sizeGridShake : ""}`}>
          {SIZES.map((size) => (
            <button
              key={size}
              className={`${styles.sizeBtn} ${selectedSize === size ? styles.sizeBtnActive : ""}`}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Actions — differ by mode */}
        <div className={styles.actions}>
          {isBookmarkMode ? (
            // Bookmark mode: single full-width wishlist button
            <button
              className={styles.wishlistBtn}
              onClick={handleSaveToWishlist}
            >
              <svg width="14" height="14" viewBox="0 0 24 24"
                fill="currentColor" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
              SAVE TO WISHLIST
            </button>
          ) : (
            // Cart mode: original ADD TO BAG + BUY NOW
            <>
              <button className={styles.addToCartBtn} onClick={handleAddToCart}>
                ADD TO BAG
              </button>
              <button className={styles.buyNowBtn} onClick={handleBuyNow}>
                BUY NOW
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}