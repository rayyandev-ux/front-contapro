import { findUserByEmail } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return Response.json({ ok: false, error: "Email requerido" }, { status: 400 });
    }
    const user = findUserByEmail(email);
    // Simulamos envío de correo. En producción integrar servicio de email.
    return Response.json({ ok: true, exists: Boolean(user) });
  } catch (e) {
    return Response.json({ ok: false, error: "Error inesperado" }, { status: 500 });
  }
}