import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

export async function GET() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
  const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
  const res = await fetch(`${BASE}/api/integrations/telegram/status`, {
    headers: { cookie: cookieHeader },
    next: { revalidate: 300, tags: ['integration-telegram-status'] },
  });
  const data = await res.json().catch(() => ({}));
  return new Response(JSON.stringify(data), { status: res.status, headers: { "Content-Type": "application/json" } });
}