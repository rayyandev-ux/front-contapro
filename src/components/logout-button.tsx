"use client";
import { useState } from "react";
import { apiJson } from "@/lib/api";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await apiJson("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded-md border px-3 py-1 text-sm hover:bg-muted"
    >
      {loading ? "Saliendo..." : "Salir"}
    </button>
  );
}