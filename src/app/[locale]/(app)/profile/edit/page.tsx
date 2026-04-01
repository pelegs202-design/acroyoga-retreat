import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getAuthSession } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ProfileEditForm } from './ProfileEditForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'profile' });
  return { title: t('editButton') };
}

export default async function ProfileEditPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getAuthSession();
  if (!session) {
    redirect({ href: '/sign-in', locale });
  }

  const userId = session!.user.id;

  const [profile] = await db
    .select({
      name: user.name,
      image: user.image,
      city: user.city,
      role: user.role,
      level: user.level,
      bio: user.bio,
      skills: user.skills,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return (
    <div className="mx-auto max-w-2xl pb-16">
      <ProfileEditForm
        name={profile?.name ?? session!.user.name ?? ''}
        imageUrl={profile?.image ?? null}
        city={profile?.city ?? ''}
        role={profile?.role ?? ''}
        level={profile?.level ?? ''}
        bio={profile?.bio ?? ''}
        skills={profile?.skills ?? []}
        locale={locale}
      />
    </div>
  );
}
