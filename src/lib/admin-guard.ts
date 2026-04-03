import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email);
}

export async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!isAdminEmail(session.user.email)) {
    return { session: null, error: NextResponse.json({ error: 'Not found' }, { status: 404 }) };
  }
  return { session, error: null };
}
