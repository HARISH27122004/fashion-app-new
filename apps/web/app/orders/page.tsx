"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Loader from "@/components/Loader";
import Header from "@/components/Header";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMyOrders(); }, []);

  async function fetchMyOrders() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data, error } = await supabase.from("orders").select("*").eq("user_id", user.id).order("id", { ascending: false });
    if (error) { console.log(error); return; }
    if (data) setOrders(data);
    setLoading(false);
  }

  async function cancelOrder(orderId: number) {
    if (!window.confirm("Cancel this order?")) return;
    const { error } = await supabase.from("orders").update({ orders_status: "Cancelled" }).eq("id", orderId);
    if (error) { console.log(error); alert("Failed to cancel order"); return; }
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, orders_status: "Cancelled" } : o));
    alert("Order Cancelled");
  }

  if (loading) return <><Header /><Loader /></>;

  return (
    <>
      <Header />
      <main style={{ padding: "24px" }}>
        <div style={{ display: "grid", gap: "18px", marginTop: "24px" }}>
          {orders.length === 0 && <p style={{ color: "#888" }}>No orders yet.</p>}
          {orders.map((order) => (
            <Link href={`/orders/${order.id}`} key={order.id} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ background: "#fff", borderRadius: "24px", padding: "22px", border: "1px solid #eee", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                  <h2 style={{ fontSize: "20px", fontWeight: 700 }}>
                    Ordered on {new Date(order.created_at).toLocaleDateString()}
                  </h2>
                  <div style={{
                    padding: "8px 14px", borderRadius: "999px", fontSize: "14px", fontWeight: 600,
                    background: order.orders_status === "Delivered" ? "#dcfce7" : order.orders_status === "Cancelled" ? "#fee2e2" : "#fef3c7",
                    color: order.orders_status === "Delivered" ? "#166534" : order.orders_status === "Cancelled" ? "#991b1b" : "#92400e",
                  }}>
                    {order.orders_status}
                  </div>
                </div>
                <div style={{ display: "grid", gap: "10px" }}>
                  <p><strong>Total:</strong> ₹{order.total_amount}</p>
                  <p><strong>Payment:</strong> {order.payment_status}</p>
                  <p><strong>Address:</strong> {order.address}</p>
                </div>
                {order.orders_status !== "Delivered" && order.orders_status !== "Cancelled" && (
                  <div style={{ marginTop: "20px" }}>
                    <button
                      onClick={(e) => { e.preventDefault(); cancelOrder(order.id); }}
                      style={{ padding: "12px 18px", borderRadius: "12px", border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: 600 }}
                    >Cancel Order</button>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
