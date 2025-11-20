import { NextResponse } from 'next/server';

function getOrigin(req: Request) {
  const fh = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const host = fh.split(':')[0] || new URL(req.url).hostname;
  const proto = (req.headers.get('x-forwarded-proto') || req.headers.get('x-forwarded-scheme') || 'https');
  const envHost = (process.env.NEXT_PUBLIC_APP_HOST || '').trim();
  const base = envHost ? (envHost.includes('://') ? envHost : `https://${envHost}`) : `${proto}://${host}`;
  return base;
}

function buildSuccessUrl(req: Request, token?: string, orderId?: string) {
  const u = new URL('/payments/success', getOrigin(req));
  if (token) u.searchParams.set('token', token);
  if (orderId) u.searchParams.set('orderId', orderId);
  return u;
}

export async function POST(req: Request) {
  try {
    const ct = String(req.headers.get('content-type') || '').toLowerCase();
    let token = '';
    let orderId = '';
    if (ct.includes('application/x-www-form-urlencoded')) {
      const bodyText = await req.text();
      const form = new URLSearchParams(bodyText);
      token = form.get('token') || form.get('Token') || '';
      orderId = form.get('commerceOrder') || form.get('orderId') || '';
    } else if (ct.includes('application/json')) {
      const body: any = await req.json().catch(() => ({}));
      token = String(body?.token || body?.Token || '');
      orderId = String(body?.commerceOrder || body?.orderId || '');
    } else {
      const bodyText = await req.text();
      const form = new URLSearchParams(bodyText);
      token = form.get('token') || form.get('Token') || '';
      orderId = form.get('commerceOrder') || form.get('orderId') || '';
    }
    const url = buildSuccessUrl(req, token, orderId);
    return NextResponse.redirect(url, { status: 302 });
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  const token = u.searchParams.get('token') || '';
  const orderId = u.searchParams.get('orderId') || '';
  const url = buildSuccessUrl(req, token || undefined, orderId || undefined);
  return NextResponse.redirect(url, { status: 302 });
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}