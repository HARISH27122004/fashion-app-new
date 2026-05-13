// ═══════════════════════════════════════════════════════════════
// app/cart/address/page.tsx
// Back → goes to /cart (via Header route config + router.back())
// ═══════════════════════════════════════════════════════════════
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

export default function AddressPage() {
  const router = useRouter();
  const [fullName, setFullName]   = useState("");
  const [phone,    setPhone]      = useState("");
  const [city,     setCity]       = useState("");
  const [pincode,  setPincode]    = useState("");
  const [address,  setAddress]    = useState("");

  async function handleSubmit() {
    const { error } = await supabase.from("addresses").insert([
      { full_name: fullName, phone, city, pincode, address }
    ]);
    if (error) { console.log(error); alert("Failed to save address"); return; }
    router.push("/cart/payment");
  }

  return (
    <>
      {/* Header reads pathname="/cart/address" → showBack=true, backFallback="/cart"
          router.back() used if history exists, otherwise pushes /cart */}
      <Header />

      <main className={styles.main}>
        <section className={styles.card}>
          <h2 className={styles.heading}>Delivery Address</h2>
          <p className={styles.subtext}>Enter your shipping details below</p>

          {[
            { label: "Full Name",     value: fullName,  set: setFullName,  placeholder: "Enter full name",      type: "text"  },
            { label: "Phone Number",  value: phone,     set: setPhone,     placeholder: "Enter phone number",   type: "tel"   },
            { label: "City",          value: city,      set: setCity,      placeholder: "Enter city",           type: "text"  },
            { label: "Pincode",       value: pincode,   set: setPincode,   placeholder: "Enter pincode",        type: "text"  },
          ].map(({ label, value, set, placeholder, type }) => (
            <div key={label} className={styles.formGroup}>
              <label className={styles.label}>{label}</label>
              <input type={type} placeholder={placeholder} className={styles.input}
                value={value} onChange={(e) => set(e.target.value)} />
            </div>
          ))}

          <div className={styles.formGroup}>
            <label className={styles.label}>Full Address</label>
            <textarea placeholder="House no, street, landmark..." className={styles.textarea}
              value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <button className={styles.button} onClick={handleSubmit}>
            Continue to Payment
          </button>
        </section>
      </main>
    </>
  );
}


// ═══════════════════════════════════════════════════════════════
// app/cart/payment/page.tsx
// Back → goes to /cart/address (via Header route config)
// ═══════════════════════════════════════════════════════════════
// (Keep this in its own file — shown here for reference)
/*
export default function PaymentPage() {
  ...
  return (
    <>
      <Header />   ← no props needed, route config handles it
      ...
    </>
  );
}
*/


// ═══════════════════════════════════════════════════════════════
// app/bookmarks/page.tsx
// Back → previous page via pill bar / top bar (showMenu page)
// ═══════════════════════════════════════════════════════════════
// "use client";
// import Header from "@/components/Header";
// ...
// <Header showMenu showSearch />   ← unchanged, already correct