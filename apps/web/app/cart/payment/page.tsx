"use client";
import { supabase } from "@/lib/supabase";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useCart } from "@/contexts/CartContext";
import { getProductById } from "@/data/products";
import Header from "@/components/Header";

declare global { interface Window { Razorpay: any; } }

export default function PaymentPage() {
  const { shippingAddress } = useCheckout();
  const { cart, clearCart } = useCart();

  function loadRazorpay() {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => { openPayment(); };
  }

  async function saveOrder(paymentMethod: string, paymentStatus: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Please login first"); return; }

    const totalAmount = cart.reduce((sum, item) => {
      const product = getProductById(item.productId);
      return product ? sum + product.price * item.quantity : sum;
    }, 0);

    const fullAddress = [
      shippingAddress.addressLine1, shippingAddress.addressLine2,
      shippingAddress.city, shippingAddress.state, shippingAddress.pincode, shippingAddress.country,
    ].filter(Boolean).join(", ");

    const { data, error } = await supabase.from("orders").insert([{
      user_id: user.id,
      customer_name: shippingAddress.fullName,
      phone: shippingAddress.phoneNumber,
      address: fullAddress,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      orders_status: "Pending",
    }]).select().single();

    if (error) { console.log(error); alert(error.message); return; }

    const orderId = data.id;
    const orderItems = cart.map((item) => {
      const product = getProductById(item.productId);
      return { order_id: orderId, product_id: item.productId, product_name: product?.name, product_image: product?.image, quantity: item.quantity, price: product?.price };
    });

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) { console.log(itemsError); alert("Failed to save order items"); return; }

    await clearCart();
    window.location.href = "/order-success";
  }

  function openPayment() {
    const totalAmount = cart.reduce((sum, item) => {
      const product = getProductById(item.productId);
      return product ? sum + product.price * item.quantity : sum;
    }, 0);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      name: "Fashion App",
      description: "Order Payment",
      handler: async function () { await saveOrder("Razorpay", "Paid"); },
      theme: { color: "#111111" },
    };
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  }

  async function handleCOD() { await saveOrder("Cash on Delivery", "Pending"); }

  return (
    <>
      <Header />
      <main style={{ padding: "24px", maxWidth: "500px", margin: "0 auto" }}>
        <h2>Select Payment Method</h2>
        <div style={{ marginTop: "20px", display: "grid", gap: "12px" }}>
          <button onClick={handleCOD} style={{ padding: "16px", borderRadius: "14px", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: "15px", fontWeight: 600 }}>
            💵 Cash on Delivery
          </button>
          <button onClick={loadRazorpay} style={{ padding: "16px", borderRadius: "14px", border: "1px solid #ddd", background: "#111", color: "#fff", cursor: "pointer", fontSize: "15px", fontWeight: 600 }}>
            💳 Pay with Razorpay
          </button>
        </div>
      </main>
    </>
  );
}
