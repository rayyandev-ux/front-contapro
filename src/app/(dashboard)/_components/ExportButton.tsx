"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export function ExportButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      // Use the helper to include credentials and headers properly
      const response = await fetch(`${BASE}/api/export/monthly?month=${month}&year=${year}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Add any auth headers if needed, usually cookies handle this with credentials: include
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Export error response:', text);
        throw new Error('Error al descargar reporte');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_ContaPRO_${year}_${String(month).padStart(2, '0')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Error al generar el reporte. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="default" 
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap px-6 py-2.5 rounded-full bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-colors text-sm w-full sm:w-auto border-none"
    >
      <Download className="h-4 w-4" />
      {loading ? 'Generando...' : 'Exportar Excel'}
    </Button>
  );
}
