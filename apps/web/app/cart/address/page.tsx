"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCheckout } from "@/contexts/CheckoutContext";
import Header from "@/components/Header";
import styles from "./page.module.css";

export default function AddressPage() {
  const router = useRouter();
  const { setShippingAddress } = useCheckout();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");

  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [cityError, setCityError] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [addressError, setAddressError] = useState("");

  async function handleSubmit() {
    setNameError(""); setPhoneError(""); setCityError(""); setPincodeError(""); setAddressError("");
    let hasError = false;
    if (!fullName.trim()) { setNameError("Please fill out this field"); hasError = true; }
    if (!phone.trim()) { setPhoneError("Please fill out this field"); hasError = true; }
    if (!city.trim()) { setCityError("Please fill out this field"); hasError = true; }
    if (!pincode.trim()) { setPincodeError("Please fill out this field"); hasError = true; }
    if (!address.trim()) { setAddressError("Please fill out this field"); hasError = true; }
    if (hasError) return;

    setShippingAddress({
      fullName, phoneNumber: phone, addressLine1: address,
      city, pincode, state: "", country: "India", email: "", addressLine2: "", landmark: "",
    });

    const { error } = await supabase.from("addresses").insert([{ full_name: fullName, phone, city, pincode, address }]);
    if (error) { console.log(error); alert("Failed to save address"); return; }
    router.push("/cart/payment");
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.card}>
          <h2 className={styles.heading}>Delivery Address</h2>
          <p className={styles.subtext}>Enter your shipping details below</p>

          {[
            { label: "Full Name", value: fullName, set: setFullName, err: nameError, setErr: setNameError, placeholder: "Enter full name" },
            { label: "Phone Number", value: phone, set: setPhone, err: phoneError, setErr: setPhoneError, placeholder: "Enter phone number" },
            { label: "City", value: city, set: setCity, err: cityError, setErr: setCityError, placeholder: "Enter city" },
            { label: "Pincode", value: pincode, set: setPincode, err: pincodeError, setErr: setPincodeError, placeholder: "Enter pincode" },
          ].map(({ label, value, set, err, setErr, placeholder }) => (
            <div key={label} className={styles.formGroup}>
              <label className={styles.label}>{label}</label>
              <input
                type="text" placeholder={placeholder} className={styles.input}
                value={value} onChange={(e) => { set(e.target.value); setErr(""); }}
                style={{ border: err ? "1px solid red" : undefined }}
              />
              {err && <p style={{ color: "red", fontSize: "13px", marginTop: "6px" }}>{err}</p>}
            </div>
          ))}

          <div className={styles.formGroup}>
            <label className={styles.label}>Full Address</label>
            <textarea
              placeholder="House no, street, landmark..."
              className={styles.textarea} value={address}
              onChange={(e) => { setAddress(e.target.value); setAddressError(""); }}
              style={{ border: addressError ? "1px solid red" : undefined }}
            />
            {addressError && <p style={{ color: "red", fontSize: "13px", marginTop: "6px" }}>{addressError}</p>}
          </div>

          <button className={styles.button} onClick={handleSubmit}>Continue to Payment</button>
        </section>
      </main>
    </>
  );
}
