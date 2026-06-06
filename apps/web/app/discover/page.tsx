"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import { useSearch } from "@/contexts/SearchContext";
import Loader from "@/components/Loader";
import styles from "./page.module.css";

export default function DiscoverPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery, clearSearch } = useSearch();

  useEffect(() => {
    clearSearch();      // clear any leftover search from previous page
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase.from("products").select("*");
    if (error) { console.log(error); setLoading(false); return; }
    if (data) {
      setProducts(
        data.map((item) => ({
          ...item,
          id: String(item.id),
          price: Number(item.price) || 0,
          category: item.category || "all",
        }))
      );
    }
    setLoading(false);
  }

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      String(p.price).includes(q)
    );
  });

  if (loading) return <><Header /><Loader /></>;

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.eyebrow}>Full Collection</p>
            <h1 className={styles.title}>Discover More</h1>
          </div>
          <span className={styles.count}>{filteredProducts.length} items</span>
        </div>

        <section className={styles.grid}>
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
          {filteredProducts.length === 0 && (
            <div className={styles.empty}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <line x1="16" y1="16" x2="21" y2="21" />
              </svg>
              <p>
                {searchQuery.trim()
                  ? `No results for "${searchQuery}"`
                  : "No products found."}
              </p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}