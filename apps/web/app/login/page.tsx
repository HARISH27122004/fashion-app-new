"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Loader from "@/components/Loader";

export default function LoginPage() {
  const router = useRouter();
  const redirect =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("redirect") || "/"
      : "/";

  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  async function handleAuth() {
    setNameError(""); setEmailError(""); setPasswordError("");
    let hasError = false;
    if (isSignup && !fullName.trim()) { setNameError("Please fill out this field"); hasError = true; }
    if (!email.trim()) { setEmailError("Please fill out this field"); hasError = true; }
    if (!password.trim()) { setPasswordError("Please fill out this field"); hasError = true; }
    if (hasError) return;
    setLoading(true);
    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setLoading(false); alert(error.message); return; }
      if (data.user) {
        await supabase.from("profiles").insert([{ id: data.user.id, full_name: fullName, role: "user" }]);
      }
      setLoading(false); alert("Signup successful"); router.push(redirect);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setLoading(false); alert(error.message); return; }
      setLoading(false); router.push(redirect);
    }
  }

  if (loading) return <Loader />;

  const inputStyle = (err: string): React.CSSProperties => ({
    width: "100%", padding: "14px", borderRadius: "14px",
    border: err ? "1px solid red" : "1px solid #ddd",
    outline: "none", fontSize: "15px",
  });

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px", background: "#f8f8f8" }}>
      <div style={{ width: "100%", maxWidth: "420px", border: "1px solid #eee", padding: "28px", borderRadius: "24px", background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        {/* Back to home link */}
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#666", fontSize: "13px", textDecoration: "none", marginBottom: "24px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back to store
        </a>

        <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "6px" }}>
          {isSignup ? "Create Account" : "Login"}
        </h1>
        <p style={{ color: "#666", marginBottom: "24px" }}>
          {isSignup ? "Create your account" : "Welcome back"}
        </p>

        {isSignup && (
          <div style={{ marginBottom: "16px" }}>
            <input
              placeholder="Full Name" value={fullName}
              onChange={(e) => { setFullName(e.target.value); setNameError(""); }}
              style={inputStyle(nameError)}
            />
            {nameError && <p style={{ color: "red", fontSize: "13px", marginTop: "6px" }}>{nameError}</p>}
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <input
            placeholder="Email" value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
            style={inputStyle(emailError)}
          />
          {emailError && <p style={{ color: "red", fontSize: "13px", marginTop: "6px" }}>{emailError}</p>}
        </div>

        <div style={{ marginBottom: "18px" }}>
          <input
            type="password" placeholder="Password" value={password}
            onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
            style={inputStyle(passwordError)}
          />
          {passwordError && <p style={{ color: "red", fontSize: "13px", marginTop: "6px" }}>{passwordError}</p>}
        </div>

        <button
          onClick={handleAuth}
          style={{ width: "100%", padding: "14px", marginTop: "10px", background: "black", color: "white", borderRadius: "14px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "15px" }}
        >
          {isSignup ? "Sign Up" : "Login"}
        </button>

        <button
          onClick={() => setIsSignup(!isSignup)}
          style={{ width: "100%", padding: "12px", marginTop: "12px", background: "transparent", border: "none", cursor: "pointer", color: "#555" }}
        >
          {isSignup ? "Already have account? Login" : "New user? Create account"}
        </button>
      </div>
    </main>
  );
}