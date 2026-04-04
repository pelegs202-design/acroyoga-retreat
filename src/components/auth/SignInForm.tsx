"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useLocale } from "next-intl";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInValues = z.infer<typeof signInSchema>;

type Props = {
  locale: string;
};

export default function SignInForm({ locale }: Props) {
  const t = useTranslations("auth");
  const currentLocale = useLocale();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(values: SignInValues) {
    setServerError(null);
    const result = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    if (result.error) {
      setServerError(result.error.message ?? "Sign in failed. Please check your credentials.");
      return;
    }

    // Success — determine where to redirect based on user's onboarding state
    const session = await authClient.getSession();
    const user = session?.data?.user as {
      tosAcceptedAt?: string | null;
      city?: string | null;
      role?: string | null;
      level?: string | null;
    } | undefined;

    if (!user?.tosAcceptedAt) {
      // TOS not yet accepted
      window.location.href = `/${currentLocale}/tos`;
    } else if (!user.city || !user.role || !user.level) {
      // Onboarding incomplete
      window.location.href = `/${currentLocale}/onboarding`;
    } else {
      // Fully onboarded — go to dashboard
      window.location.href = `/${currentLocale}/dashboard`;
    }
  }

  return (
    <div>
      {/* Brutalist bold heading with pink accent bar */}
      <h1 className="mb-2 text-3xl font-black tracking-tighter text-neutral-100">
        {t("signIn")}
      </h1>
      {/* Pink accent bar under heading */}
      <div className="mb-6 h-1 w-12 bg-brand" aria-hidden="true" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-neutral-300"
          >
            {t("email")}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="w-full rounded-none border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-neutral-100 placeholder-neutral-500 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-neutral-300"
          >
            {t("password")}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className="w-full rounded-none border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-neutral-100 placeholder-neutral-500 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot password link */}
        <div className="text-end">
          <a
            href={`/${locale}/reset-password`}
            className="text-sm text-brand transition-colors hover:text-brand-muted"
          >
            {t("forgotPassword")}
          </a>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {serverError}
          </div>
        )}

        {/* Submit — brutalist: btn-press + full pink block */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-press w-full bg-brand px-4 py-3 text-sm font-black uppercase tracking-wide text-black transition-colors hover:bg-brand-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "..." : t("signIn")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        {t("noAccount")}{" "}
        <a
          href={`/${locale}/sign-up`}
          className="font-bold text-brand transition-colors hover:text-brand-muted"
        >
          {t("signUp")}
        </a>
      </p>
    </div>
  );
}
