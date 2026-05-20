"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Header from "@/components/Header";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import ToastNotification, { ToastItem } from "@/components/ToastNotification";
import { useNotifications } from "../hooks/useNotifications";
import { categories } from "@/data/products";
import { supabase } from "@/lib/supabase";
import { useSearch } from "@/contexts/SearchContext";
import styles from "./page.module.css";

const DISMISSED_KEY = "toast_dismissed_ids";

function getDismissedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markDismissed(id: string) {
  if (typeof window === "undefined") return;
  const ids = getDismissedIds();
  ids.add(id);
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
}

const STORES = [
  {
    city: "Delhi",
    address: "M block market, M-81, Block M, Greater Kailash II, New Delhi, Delhi 110048",
    mapHref: "#",
  },
  {
    city: "Mumbai",
    address: "B1, Prem Sagar Building, 14th Rd, Khar, Khar West, Mumbai, Maharashtra 400052",
    mapHref: "#",
  },
  {
    city: "Hyderabad",
    address: "101, Vimbri Boulevard, Street No. 4, Green Valley, Banjara Hills, Hyderabad 500034",
    mapHref: "#",
  },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [products, setProducts] = useState<any[]>([]);
  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hasInitialized = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const { searchQuery, clearSearch } = useSearch();
  const notifications = useNotifications();

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    const { data, error } = await supabase.from("products").select("*");
    if (error) { console.log(error); return; }
    if (data) setProducts(data.map((item) => ({ ...item, id: String(item.id) })));
  }

  useEffect(() => {
    if (notifications.length === 0) return;
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const dismissed = getDismissedIds();
      const toShow = notifications.filter((n) => !dismissed.has(n.id));
      if (toShow.length > 0)
        setActiveToasts(toShow.map((n) => ({ id: n.id, message: n.message, product_id: n.product_id })));
      return;
    }
    setActiveToasts((prev) => {
      const dismissed = getDismissedIds();
      const existingIds = new Set(prev.map((t) => t.id));
      const brandNew = notifications
        .filter((n) => !dismissed.has(n.id) && !existingIds.has(n.id))
        .map((n) => ({ id: n.id, message: n.message, product_id: n.product_id }));
      return brandNew.length > 0 ? [...brandNew, ...prev] : prev;
    });
  }, [notifications]);

  function handleDismiss(id: string) {
    markDismissed(id);
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function handleCategorySelect(value: string) {
    setSelectedCategory(value);
    if (value === "all") clearSearch();
  }

  const filteredProducts = products
    .filter((p) => {
      const matchesCategory = selectedCategory === "all" ? true : p.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === ""
          ? true
          : p.name?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            String(p.price).includes(q);
      return matchesCategory && matchesSearch && Number(p.price) <= maxPrice;
    })
    .sort((a, b) => {
      if (sortBy === "low-high") return Number(a.price) - Number(b.price);
      if (sortBy === "high-low") return Number(b.price) - Number(a.price);
      if (sortBy === "newest") return Number(b.id) - Number(a.id);
      return 0;
    });

  const total = products.length;

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || total === 0) return;
      setIsTransitioning(true);
      setActiveSlide(((index % total) + total) % total);
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [isTransitioning, total]
  );

  const next = useCallback(() => goTo(activeSlide + 1), [activeSlide, goTo]);
  const prev = useCallback(() => goTo(activeSlide - 1), [activeSlide, goTo]);

  useEffect(() => {
    if (total === 0) return;
    intervalRef.current = setInterval(next, 4200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next, total]);

  const resetAndGoTo = useCallback(
    (fn: () => void) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      fn();
      intervalRef.current = setInterval(next, 4200);
    },
    [next]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.changedTouches[0];
      if (!touch) return;
      const d = touchStartX.current - touch.clientX;
      if (Math.abs(d) > 40) resetAndGoTo(d > 0 ? next : prev);
    },
    [resetAndGoTo, next, prev]
  );

  const getSlideRole = useCallback(
    (i: number): "active" | "prev" | "next" | "hidden" => {
      if (total === 0) return "hidden";
      const offset = ((i - activeSlide) % total + total) % total;
      if (offset === 0) return "active";
      if (offset === total - 1) return "prev";
      if (offset === 1) return "next";
      return "hidden";
    },
    [activeSlide, total]
  );

  return (
    <>
      <Header />
      <main className={styles.main}>
        <ToastNotification toasts={activeToasts} onDismiss={handleDismiss} />

        {/* ══ 1. HERO ══ */}
        <section className={styles.hero}>
          {/*
            Use <img> instead of a CSS background-image div.
            width="100%" + height="auto" means the container is
            always exactly as tall as the image — no fixed height,
            no letterbox, no black space, no crop, on any screen size.
          */}
          <img
            src="https://images.pexels.com/photos/9775889/pexels-photo-9775889.jpeg"
            alt="Hero"
            className={styles.heroBg}
            draggable={false}
          />
          <div className={styles.heroOverlay} />
          <a href="#product-grid" className={styles.heroShopBtn}>
            Shop now
          </a>
        </section>

        {/* ══ 2. SECTION HEADER ══ */}
        <div className={styles.sectionHeader} id="product-grid">
          <h2 className={styles.sectionTitle}>Latest drop</h2>
          <button className={styles.sectionMore}>Discover more</button>
        </div>

        {/* ══ 3. PRODUCT GRID ══ */}
        <section className={styles.productGrid}>
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

        {/* ══ 4. LUXURY CAROUSEL ══ */}
        {products.length > 0 && (
          <section className={styles.luxCarousel}>
            <div className={styles.luxCarouselTop}>
              <div>
                <p className={styles.luxEyebrow}>curated for you</p>
                <h2 className={styles.luxTitle}>You May Also Like</h2>
              </div>
              <div className={styles.luxArrows}>
                <button className={styles.luxArrow} onClick={() => resetAndGoTo(prev)} aria-label="Previous">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button className={styles.luxArrow} onClick={() => resetAndGoTo(next)} aria-label="Next">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={styles.luxStage} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              {products.map((product, i) => {
                const role = getSlideRole(i);
                if (role === "hidden") return null;
                return (
                  <div
                    key={product.id}
                    className={`${styles.luxSlide} ${styles[`luxSlide__${role}`]}`}
                    onClick={() => {
                      if (role === "next") resetAndGoTo(next);
                      if (role === "prev") resetAndGoTo(prev);
                    }}
                    aria-label={role !== "active" ? `Go to ${product.name}` : undefined}
                  >
                    <div className={styles.luxSlideFrame}>
                      {product.image_url || product.image ? (
                        <img
                          src={product.image_url || product.image}
                          alt={product.name}
                          className={styles.luxSlideImg}
                          draggable={false}
                        />
                      ) : (
                        <div className={styles.luxSlidePlaceholder} />
                      )}
                      {role === "active" && (
                        <div className={styles.luxSlideOverlay}>
                          <p className={styles.luxSlideCategory}>{product.category}</p>
                          <p className={styles.luxSlideName}>{product.name}</p>
                          <p className={styles.luxSlidePrice}>₹{Number(product.price).toLocaleString("en-IN")}</p>
                        </div>
                      )}
                      {role !== "active" && <div className={styles.luxSlideDim} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.luxBottom}>
              <div className={styles.luxDots}>
                {products.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.luxDot} ${i === activeSlide ? styles.luxDotActive : ""}`}
                    onClick={() => resetAndGoTo(() => goTo(i))}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
              <span className={styles.luxCounter}>
                {String(activeSlide + 1).padStart(2, "0")}
                <span className={styles.luxCounterSep}>/</span>
                {String(total).padStart(2, "0")}
              </span>
            </div>
          </section>
        )}

        {/* ══ 5. FOOTER ══ */}
        <footer className={styles.footer}>
          <div className={styles.storeRow}>
            {STORES.map((store) => (
              <div key={store.city} className={styles.storeCard}>
                <div className={styles.storeThumbWrap}>
                  <img
                    src="/images/store-placeholder.jpg"
                    alt={`${store.city} store`}
                    className={styles.storeThumb}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <p className={styles.storeCity}>{store.city}</p>
                <p className={styles.storeAddress}>{store.address}</p>
                <a href={store.mapHref} className={styles.storeDir} target="_blank" rel="noreferrer">
                  Get Direction ↗
                </a>
              </div>
            ))}
          </div>

          <div className={styles.footerLinks}>
            <div className={styles.footerCol}>
              <h4>Connect with us</h4>
              <ul>
                <li><a href="#">Call</a></li>
                <li><a href="#">Text (WhatsApp)</a></li>
                <li><a href="#">Instagram</a></li>
                <li><a href="#">YouTube</a></li>
                <li><a href="#">LinkedIn</a></li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h4>Order Support</h4>
              <ul>
                <li><a href="#">Make a return / Exchange</a></li>
                <li><a href="#">Refund / Exchange policy</a></li>
                <li><a href="#">Track your order</a></li>
                <li><a href="#">Shipping policy</a></li>
                <li><a href="#">FAQ&apos;s</a></li>
                <li><a href="#">Terms</a></li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h4>We are WELCOME</h4>
              <ul>
                <li><a href="#">Our story</a></li>
                <li><a href="#">Walk-in Stores</a></li>
                <li><a href="#">Collaborations</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Media</a></li>
                <li><a href="#">Blogs</a></li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h4>Popular searches</h4>
              <ul>
                <li><a href="#">Shop by category</a></li>
                <li><a href="#">Shop by style</a></li>
                <li><a href="#">Shop by color</a></li>
                <li><a href="#">New arrivals</a></li>
                <li><a href="#">Best sellers</a></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <span className={styles.footerCopy}>
              © {new Date().getFullYear()} WELCOME RETAIL PRIVATE LIMITED. ALL RIGHTS RESERVED
            </span>
            <span className={styles.footerBrand}>WELCOME</span>
          </div>
        </footer>
      </main>
    </>
  );
}