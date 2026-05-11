// app/layout.tsx
import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

import { BookmarkProvider } from "@/contexts/BookmarkContext";
import { CartProvider } from "@/contexts/CartContext";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import AppShell from "@/components/AppShell";

const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "WELCOME — Discover Latest Fashion",
  description:
    "Shop premium streetwear and fashion essentials. Discover the latest t-shirts, shirts, pants, and jackets.",
  keywords: ["fashion", "streetwear", "clothing", "t-shirts", "shirts"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <BookmarkProvider>
          <CartProvider>
            <CheckoutProvider>
              <AppShell>
                <div className="app-shell">{children}</div>
              </AppShell>
            </CheckoutProvider>
          </CartProvider>
        </BookmarkProvider>
      </body>
    </html>
  );
}