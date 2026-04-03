import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getAuthSession } from '@/lib/auth-guard';
import { NotificationPreferences } from '@/components/settings/NotificationPreferences';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'settings' });
  return { title: t('title') };
}

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getAuthSession();
  if (!session) {
    redirect({ href: '/sign-in', locale });
  }

  const t = await getTranslations({ locale, namespace: 'settings' });

  return (
    <div className="mx-auto max-w-2xl pb-16">
      <h1 className="mb-8 text-3xl font-bold text-neutral-100">{t('title')}</h1>

      <NotificationPreferences />
    </div>
  );
}
