"use client";
import { useState, useEffect } from "react";
import KairoDecode from "./KairoDecode";

// Renders nothing on the server — KairoDecode is pure client-side UI and must
// not be server-rendered. This eliminates React hydration mismatches entirely.
// The splash screen covers the blank shell until KairoDecode mounts and calls
// window.kairoReady().
export default function ClientApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <KairoDecode />;
}
