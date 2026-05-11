// components/SlideDrawer.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useEffect } from "react";
import styles from "./SlideDrawer.module.css";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    label: "Saved",
    href: "/bookmarks",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    label: "Bag",
    href: "/cart",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    showCartBadge: true,
  },
  {
    label: "Alerts",
    href: "/notification",  // ✅ fixed — singular
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
    showNotifBadge: true,  // ✅ new flag
  },
  {
    label: "Orders",
    href: "/orders",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
      </svg>
    ),
  },
];

interface SlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SlideDrawer({ isOpen, onClose }: SlideDrawerProps) {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const notifications = useNotifications(); // ✅ read notification count

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        id="slide-drawer"
      >
        <div className={styles.drawerHeader}>
          <p className={styles.brand}>YOUR BRAND</p>
          <p className={styles.tagline}>Curated collection</p>
        </div>

        <nav className={styles.nav} aria-label="Site navigation">
          {navItems.map((item, i) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            // ✅ Pick the right badge count per item
            const cartCount = item.showCartBadge ? totalItems : 0;
            const notifCount = item.showNotifBadge ? notifications.length : 0;
            const badgeCount = cartCount + notifCount;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`${styles.item} ${isActive ? styles.active : ""}`}
                aria-current={isActive ? "page" : undefined}
                style={{ animationDelay: isOpen ? `${i * 45}ms` : "0ms" }}
              >
                <span className={styles.iconWrap}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
                {badgeCount > 0 && (
                  <span className={styles.badge} aria-label={`${badgeCount} items`}>
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close menu"
          id="drawer-close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </>
  );
}