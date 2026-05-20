"use client";

import Header from "@/components/Header";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { getProductById } from "@/data/products";
import { useSearch } from "@/contexts/SearchContext";
import ProductCard from "@/components/ProductCard";
import styles from "./page.module.css";

export default function BookmarksPage() {
  const { bookmarks } = useBookmarks();
  const { searchQuery } = useSearch();

  const bookmarkedProducts = bookmarks
    .map((b) => getProductById(b.productId))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)
    .filter((p) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        String(p.price).includes(q)
      );
    });

  return (
    <>
      <Header />
      <main className={styles.main}>
        {bookmarkedProducts.length > 0 ? (
          <section className={styles.grid} id="bookmarks-grid">
            {bookmarkedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </section>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
            </div>
            <h2 className={styles.emptyTitle}>
              {searchQuery ? `No results for "${searchQuery}"` : "No bookmarks yet"}
            </h2>
            <p className={styles.emptyText}>
              {searchQuery ? "Try a different search term" : "Items you save will appear here"}
            </p>
          </div>
        )}
      </main>
    </>
  );
}
