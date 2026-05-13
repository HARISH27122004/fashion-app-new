// components/Header.tsx
"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Header.module.css";
import SearchDrawer from "./Searchdrawer";
import { useScrollHeader } from "@/hooks/Usescrollheader";
import { useSearch } from "@/contexts/SearchContext";
import { useCart } from "@/contexts/CartContext";
import { useNotifications } from "@/hooks/useNotifications";

type RouteConfig = {
  showMenu?: boolean;
  showSearch?: boolean;
  showBack?: boolean;
  title?: string;
  backFallback?: string;
};

function getRouteConfig(pathname: string): RouteConfig {
  if (pathname === "/")
    return { showMenu: true, showSearch: true };

  if (pathname === "/bookmarks")
    return { showMenu: true, showSearch: true, showBack: true, title: "SAVED",         backFallback: "/" };
  if (pathname === "/cart")
    return { showMenu: true, showSearch: true, showBack: true, title: "BAG",           backFallback: "/" };
  if (pathname === "/notification")
    return { showMenu: true, showSearch: true, showBack: true, title: "NOTIFICATIONS", backFallback: "/" };
  if (pathname === "/orders")
    return { showMenu: true, showSearch: true, showBack: true, title: "ORDERS",        backFallback: "/" };

  if (pathname === "/login")
    return { showBack: true, title: "SIGN IN",  backFallback: "/" };
  if (pathname.startsWith("/product/"))
    return { showBack: true, title: "DETAILS",  backFallback: "/" };
  if (pathname === "/cart/address")
    return { showBack: true, title: "ADDRESS",  backFallback: "/cart" };
  if (pathname === "/cart/payment")
    return { showBack: true, title: "PAYMENT",  backFallback: "/cart/address" };

  return { showBack: true, backFallback: "/" };
}

interface HeaderProps {
  showMenu?: boolean;
  showSearch?: boolean;
  showBack?: boolean;
  title?: string;
  backHref?: string;
}

const NAV_LINKS = [
  { href: "/",          label: "New in" },
  { href: "/bookmarks", label: "Saved"  },
];

const NAV_ICONS = [
  {
    href: "/notification", label: "Notifications", showCart: false, showNotif: true,
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    ),
  },
  {
    href: "/bookmarks", label: "Saved", showCart: false, showNotif: false,
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    href: "/cart", label: "Bag", showCart: true, showNotif: false,
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    href: "/orders", label: "Orders", showCart: false, showNotif: false,
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
    ),
  },
  {
    href: "/", label: "HOME", showCart: false, showNotif: false,
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
];

// ─────────────────────────────────────────────────────────────
// Mobile pill — Cart replaced with Home.
// Badge: only "notification" shows notifCount. No showCart here.
// ─────────────────────────────────────────────────────────────
const MOBILE_PILL_ITEMS = [
  {
    key: "home",
    label: "Home",
    href: "/",
    showNotif: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    key: "account",
    label: "Account",
    href: "/login",
    showNotif: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    key: "notification",
    label: "Alerts",
    href: "/notification",
    showNotif: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    ),
  },
  {
    key: "search",
    label: "Search",
    href: null,
    showNotif: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10.5" cy="10.5" r="6.5"/><line x1="16" y1="16" x2="21" y2="21"/>
      </svg>
    ),
  },
];

export default function Header(props: HeaderProps) {
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [pillVisible, setPillVisible] = useState(true);
  const lastScrollY = useRef(0);

  const pathname      = usePathname();
  const router        = useRouter();
  const headerVisible = useScrollHeader(8);
  const { searchQuery } = useSearch();
  const panelRef = useRef<HTMLElement>(null);

  const { items: cartItems } = useCart();
  const notifications        = useNotifications();
  const cartCount  = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const notifCount = notifications.length;

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;
      if (diff > 6 && currentY > 80) setPillVisible(false);
      else if (diff < -6)            setPillVisible(true);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const auto         = getRouteConfig(pathname);
  const showMenu     = props.showMenu   ?? auto.showMenu   ?? false;
  const showSearch   = props.showSearch ?? auto.showSearch ?? false;
  const showBack     = props.showBack   ?? auto.showBack   ?? false;
  const pageTitle    = props.title      ?? auto.title      ?? null;
  const backFallback = auto.backFallback ?? "/";
  const isHome       = pathname === "/";

  function handleBack() {
    if (props.backHref) { router.push(props.backHref); return; }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(backFallback);
    }
  }

  const BackButton = ({ mobile = false }: { mobile?: boolean }) => (
    <button
      className={mobile ? styles.mobileBackBtn : styles.backBtn}
      onClick={handleBack}
      aria-label="Go back"
    >
      <svg
        width={mobile ? 20 : 16}
        height={mobile ? 20 : 16}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
      {!mobile && <span>Back</span>}
    </button>
  );

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          DESKTOP HEADER
      ═══════════════════════════════════════════════════════ */}
      <header
        className={`${styles.header} ${headerVisible ? styles.headerVisible : styles.headerHidden}`}
      >
        <div className={styles.inner}>
          <div className={styles.navLeft}>
            {showBack ? (
              <BackButton />
            ) : (
              <>
                {showMenu && (
                  <button
                    className={styles.iconBtn}
                    onClick={() => setMenuOpen(true)}
                    aria-label="Open menu"
                    style={{ marginRight: 4 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  </button>
                )}
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`${styles.navLink} ${pathname === href ? styles.navLinkActive : ""}`}
                  >
                    {label}
                  </Link>
                ))}
              </>
            )}
          </div>

          {isHome
            ? <Link href="/" className={styles.brand}>𝕱𝖆𝖘𝖍𝖎𝖔𝖓𝕯𝖎𝖗𝖙</Link>
            : <span className={styles.pageTitle}>{pageTitle}</span>
          }

          <div className={styles.navRight}>
            {showSearch && (
              <button
                className={`${styles.iconBtn} ${searchQuery.trim() ? styles.iconBtnActive : ""}`}
                onClick={() => setDrawerOpen(true)}
                aria-label="Search"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <line x1="16" y1="16" x2="21" y2="21" />
                </svg>
                {searchQuery.trim() && <span className={styles.iconBtnDot} />}
              </button>
            )}
            {NAV_ICONS.map(({ href, label, icon, showCart, showNotif }) => {
              const count = (showCart ? cartCount : 0) + (showNotif ? notifCount : 0);
              return (
                <Link key={`d-${label}`} href={href} className={styles.iconBtn} aria-label={label}>
                  {icon}
                  {count > 0 && (
                    <span className={styles.badge}>{count > 9 ? "9+" : count}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          MOBILE TOP BAR
      ═══════════════════════════════════════════════════════ */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileInner}>
          {showBack ? (
            <BackButton mobile />
          ) : (
            <button
              className={styles.mobilePlusBtn}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}

          {isHome
            ? <Link href="/" className={styles.mobileBrand}>𝕱𝖆𝖘𝖍𝖎𝖔𝖓𝕯𝖎𝖗𝖙</Link>
            : <span className={styles.mobilePageTitle}>{pageTitle}</span>
          }

          <Link href="/bookmarks" className={styles.mobileIconBtn} aria-label="Saved">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
          </Link>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          MOBILE BOTTOM PILL BAR
      ═══════════════════════════════════════════════════════ */}
      <div
        className={`${styles.mobilePillWrap} ${pillVisible ? styles.pillWrapVisible : styles.pillWrapHidden}`}
      >
        <nav className={styles.mobilePill} aria-label="Main navigation">
          {MOBILE_PILL_ITEMS.map(({ key, label, href, icon, showNotif }) => {
            // Only the notification pill shows a badge count
            const count = showNotif ? notifCount : 0;

            const isActive = href
              ? (href === "/" ? pathname === "/" : pathname.startsWith(href))
              : false;

            // Search — no href, opens drawer
            if (key === "search") {
              return (
                <button
                  key={key}
                  className={`${styles.pillBtn} ${searchQuery.trim() ? styles.pillBtnActive : ""}`}
                  onClick={() => setDrawerOpen(true)}
                  aria-label={label}
                >
                  {icon}
                  {searchQuery.trim() && <span className={styles.pillActiveDot} />}
                </button>
              );
            }

            return (
              <Link
                key={key}
                href={href!}
                className={`${styles.pillBtn} ${isActive ? styles.pillBtnActive : ""}`}
                aria-label={label}
              >
                {icon}
                {count > 0 && (
                  <span className={styles.pillBadge}>{count > 9 ? "9+" : count}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Search Drawer */}
      {showSearch && (
        <SearchDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}

      {/* ═══════════════════════════════════════════════════════
          SLIDE-IN MENU PANEL
      ═══════════════════════════════════════════════════════ */}
      {showMenu && (
        <div
          className={`${styles.menuOverlay} ${menuOpen ? styles.menuOverlayOpen : ""}`}
          onClick={() => setMenuOpen(false)}
          aria-hidden={!menuOpen}
        >
          <nav
            ref={panelRef}
            className={`${styles.menuPanel} ${menuOpen ? styles.menuPanelOpen : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.menuTop}>
              <span className={styles.menuBrand}>STUDIO DIRT</span>
              <button className={styles.menuCloseBtn} onClick={() => setMenuOpen(false)}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <ul className={styles.menuList}>
              {[
                {
                  href: "/", label: "Home",
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                },
                {
                  href: "/bookmarks", label: "Saved",
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                },
                {
                  href: "/cart", label: "Bag", count: cartCount,
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                },
                {
                  href: "/notification", label: "Notifications", count: notifCount,
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                },
                {
                  href: "/orders", label: "Orders",
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
                },
                {
                  href: "/login", label: "Sign In",
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                },
              ].map(({ href, label, icon, count }) => (
                <li key={`menu-${label}`}>
                  <Link
                    href={href}
                    className={`${styles.menuLink} ${pathname === href ? styles.menuLinkActive : ""}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className={styles.menuLinkIcon}>{icon}</span>
                    <span className={styles.menuLinkLabel}>{label}</span>
                    {count != null && count > 0 && (
                      <span className={styles.menuBadge}>{count > 99 ? "99+" : count}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            <div className={styles.menuFooter}>
              <span className={styles.menuFooterText}>Fashion Store · v1.0</span>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}