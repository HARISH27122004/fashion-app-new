// app/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import styles from "./orders.module.css";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMyOrders(); }, []);

  async function fetchMyOrders() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false });

    if (error) { console.log(error); return; }
    if (data) setOrders(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <>
        {/*
          No props — getRouteConfig("/orders") auto-configures:
            showMenu: true, showSearch: true, showBack: true, title: "ORDERS"
          Back → router.back() → previous page, fallback "/"
        */}
        <Header />
        <main style={{ padding: "24px", textAlign: "center", color: "var(--color-text-tertiary)" }}>
          <p style={{ fontFamily: "var(--font-sans)", marginTop: 40 }}>Loading orders...</p>
        </main>
      </>
    );
  }

  return (
    <>
      {/* No props — route config provides showBack + all nav icons automatically */}
      <Header />

      <main style={{ padding: "24px 24px 100px", maxWidth: "700px", margin: "0 auto" }}>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(24px,4vw,36px)",
          marginBottom: 24,
        }}>
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--color-text-tertiary)",
            fontFamily: "var(--font-sans)",
          }}>
            <p style={{ fontSize: 15 }}>No orders found.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {orders.map((order) => (
              <div key={order.id} style={{
                border: "1px solid var(--color-border)",
                padding: "20px 24px",
                borderRadius: "12px",
                background: "var(--color-bg)",
                fontFamily: "var(--font-sans)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <strong style={{ fontSize: 15 }}>Order #{order.id}</strong>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: order.orders_status === "Delivered" ? "#f0fdf4" : "#f5f5f5",
                    color: order.orders_status === "Delivered" ? "#16a34a" : "#555",
                  }}>
                    {order.orders_status}
                  </span>
                </div>
                <div style={{ display: "grid", gap: 4, fontSize: 13, color: "var(--color-text-secondary)" }}>
                  <p>Total: <strong style={{ color: "#111" }}>₹{order.total_amount}</strong></p>
                  <p>Payment: {order.payment_status}</p>
                  <p>Address: {order.address}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}