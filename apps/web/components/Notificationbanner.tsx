"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ToastNotification.module.css";

export interface ToastItem {
  id: string;
  message: string;
}

interface Props {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export default function ToastNotification({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"entering" | "visible" | "hiding">("entering");

  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setPhase("visible"));
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, []);

  function handleDismiss() {
    setPhase("hiding");
    const el = ref.current;
    if (!el) { onDismiss(toast.id); return; }
    const done = () => onDismiss(toast.id);
    el.addEventListener("transitionend", done, { once: true });
    setTimeout(done, 350);
  }

  return (
    <div
      ref={ref}
      className={`${styles.toast} ${
        phase === "visible" ? styles.visible : phase === "hiding" ? styles.hiding : ""
      }`}
      role="status"
    >
      {/* Left: checkmark icon */}
      <div className={styles.iconWrap}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="9" fill="rgba(255,255,255,0.25)" />
          <path
            d="M5 9.5l2.8 2.8 5.2-5.6"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Middle: text */}
      <div className={styles.body}>
        <p className={styles.title}>New Notification</p>
        <p className={styles.message}>{toast.message}</p>
      </div>

      {/* Right: close button */}
      <button
        className={styles.closeBtn}
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M1 1l10 10M11 1L1 11"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}