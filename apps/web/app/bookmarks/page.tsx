"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { getProductById } from "@/data/products";
import { useSearch } from "@/contexts/SearchContext";
import styles from "./page.module.css";

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarks();
  const { searchQuery } = useSearch();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const router = useRouter();

  const bookmarkedProducts = bookmarks
    .map((b) => getProductById(b.productId))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)
    .sort((a, b) => {
      const aTime = bookmarks.find((bm) => bm.productId === a.id)?.timestamp || 0;
      const bTime = bookmarks.find((bm) => bm.productId === b.id)?.timestamp || 0;
      return bTime - aTime;
    });

  const filteredProducts = bookmarkedProducts.filter((product) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(q) ||
      String(product.price).includes(q)
    );
  });

  function toggleSelect(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const selectedProducts = filteredProducts.filter((p) => selected.has(p.id));
  const totalValue = selectedProducts.reduce((sum, p) => sum + Number(p.price), 0);
  const inStock = filteredProducts.filter((p) => p.inStock !== false).length;

  return (
    <>
      {/*
        No props needed — getRouteConfig("/bookmarks") auto-configures:
          showMenu: true, showSearch: true, showBack: true, title: "SAVED"
        Back button uses router.back() → goes to wherever user came from.
        If no history, falls back to "/".
      */}
      <Header />

      <main className={styles.main}>
        {filteredProducts.length > 0 ? (
          <section className={styles.grid}>
            {filteredProducts.map((product) => {
              const isSelected = selected.has(product.id);
              const originalPrice = product.original_price;

              return (
                <div
                  key={product.id}
                  className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
                  onClick={() => router.push(`/product/${product.id}`)}
                >
                  {/* Image */}
                  <div className={styles.imgWrap}>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className={styles.img}
                        draggable={false}
                      />
                    ) : (
                      <div className={styles.imgPlaceholder} />
                    )}

                    {/* Bookmark remove — top-right */}
                    <button
                      className={styles.bookmarkBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBookmark(product.id);
                        setSelected((prev) => {
                          const next = new Set(prev);
                          next.delete(product.id);
                          return next;
                        });
                      }}
                      aria-label="Remove bookmark"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                      </svg>
                    </button>

                    {/* Selected overlay */}
                    {isSelected && (
                      <div className={styles.selectedOverlay} />
                    )}
                  </div>

                  {/* Info bar */}
                  <div className={styles.info}>
                    <div className={styles.nameRow}>
                      <span className={styles.name}>{product.name}</span>
                      {product.sizes && (
                        <span className={styles.size}>
                          <strong>{product.sizes}</strong>
                        </span>
                      )}
                    </div>
                    <div className={styles.priceRow}>
                      <span className={styles.price}>
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </span>
                      {originalPrice && (
                        <span className={styles.originalPrice}>
                          ₹{Number(originalPrice).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
            </div>
            <h2 className={styles.emptyTitle}>No bookmarks yet</h2>
            <p className={styles.emptyText}>
              {searchQuery ? `No results for "${searchQuery}"` : "Items you save will appear here"}
            </p>
          </div>
        )}
      </main>
    </>
  );
}