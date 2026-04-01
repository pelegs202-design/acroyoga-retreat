import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { del } from '@vercel/blob';

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as HandleUploadBody;

  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async () => {
      return {
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ userId: session.user.id }),
      };
    },
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      const { userId } = JSON.parse(tokenPayload ?? '{}');
      // Delete old blob to prevent storage leaks
      const [existing] = await db
        .select({ image: user.image })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
      if (existing?.image) {
        await del(existing.image).catch(() => {}); // non-fatal if old blob already gone
      }
      await db.update(user).set({ image: blob.url }).where(eq(user.id, userId));
    },
  });

  return NextResponse.json(jsonResponse);
}
