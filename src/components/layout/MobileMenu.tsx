"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "@/i18n/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  unreadCount?: number;
}

/**
 * MobileMenu — Accessible slide-in navigation panel using Radix Dialog (Sheet pattern).
 *
 * Uses Radix Dialog primitives to provide FOR FREE:
 * - Focus trap (Tab cycles within the panel)
 * - Escape key closes the menu
 * - aria-modal="true" on content
 * - Scroll lock on body when open
 * - Proper focus restoration to trigger button on close
 *
 * @see DSGN-04 — Radix UI accessible primitives requirement
 * @see stitch-screens/header-footer.html — mobile menu open state design spec
 */
export default function MobileMenu({
  isOpen,
  onOpenChange,
  unreadCount = 0,
}: MobileMenuProps) {
  const t = useTranslations("common");
  const tAuth = useTranslations("auth");
  const tJams = useTranslations("jams");
  const tMessages = useTranslations("messages");
  const { data: session } = useSession();
  const router = useRouter();

  function close() {
    onOpenChange(false);
  }

  async function handleSignOut() {
    close();
    await authClient.signOut();
    router.push("/");
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Dark backdrop — semi-transparent overlay */}
        <Dialog.Overlay className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Slide-in panel from inline-end (right in LTR, left in RTL) */}
        <Dialog.Content
          className="fixed inset-block-0 end-0 rtl:end-auto rtl:start-0 z-[201] flex h-full w-4/5 max-w-sm flex-col bg-[#0a0a0a] border-s-2 border-s-neutral-800 px-8 py-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right rtl:data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-right rtl:data-[state=open]:slide-in-from-left duration-200"
          aria-describedby={undefined}
        >
          {/* Screen reader title (visually hidden) */}
          <Dialog.Title className="sr-only">
            {t("menu")}
          </Dialog.Title>

          {/* Menu header: logo + close button */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
            <Link href="/" onClick={close} className="flex items-center gap-2 text-xl font-black tracking-tighter">
              <span className="h-2 w-2 shrink-0 bg-brand" aria-hidden="true" />
              <span className="text-neutral-100">Acro</span>
              <span className="text-brand">Havura</span>
            </Link>

            <Dialog.Close asChild>
              <button
                aria-label={t("closeMenu")}
                className="flex h-9 w-9 items-center justify-center text-2xl font-black text-neutral-400 transition-colors hover:text-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                ×
              </button>
            </Dialog.Close>
          </div>

          {/* Giant brutalist nav links — per stitch-screens/header-footer.html */}
          <nav className="flex flex-1 flex-col gap-0 py-10">
            {session && (
              <>
                <Link
                  href="/members"
                  onClick={close}
                  className="py-2 text-[40px] font-black tracking-tighter text-neutral-200/20 transition-colors duration-150 hover:text-neutral-100"
                >
                  {tAuth("dashboard")}
                </Link>
                <Link
                  href="/jams"
                  onClick={close}
                  className="py-2 text-[40px] font-black tracking-tighter text-neutral-200/20 transition-colors duration-150 hover:text-neutral-100"
                >
                  {tJams("title")}
                </Link>
                <Link
                  href="/messages"
                  onClick={close}
                  className="relative inline-block py-2 text-[40px] font-black tracking-tighter text-neutral-200/20 transition-colors duration-150 hover:text-neutral-100"
                >
                  {tMessages("title")}
                  {unreadCount > 0 && (
                    <span className="ms-3 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-bold text-black leading-none">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </nav>

          {/* Bottom CTA */}
          <div className="border-t border-neutral-800 pt-6">
            {session ? (
              <div className="space-y-3">
                <p className="truncate text-sm text-neutral-500">
                  {session.user.name || session.user.email}
                </p>
                <button
                  onClick={handleSignOut}
                  className="btn-press w-full border-2 border-neutral-700 py-3 text-sm font-bold uppercase tracking-widest text-neutral-300 transition-colors hover:border-brand hover:text-brand"
                >
                  {tAuth("signOut")}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/sign-up"
                  onClick={close}
                  className="btn-press block w-full bg-brand py-4 text-center text-lg font-black tracking-tight text-black transition-colors hover:bg-brand-muted"
                >
                  {tAuth("signUp")}
                </Link>
                <Link
                  href="/sign-in"
                  onClick={close}
                  className="block text-center text-sm font-bold text-neutral-400 transition-colors hover:text-brand"
                >
                  {tAuth("signIn")}
                </Link>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
