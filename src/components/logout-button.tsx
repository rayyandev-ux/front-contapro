"use client";
import { useState } from "react";
import { apiJson } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function LogoutButton({ className }: { className?: string }) {
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
    <Button
      onClick={onClick}
      disabled={loading}
      variant="outline"
      size="sm"
      className={className}
    >
      {loading ? "Cerrando sesión..." : "Cerrar sesión"}
    </Button>
  );
}