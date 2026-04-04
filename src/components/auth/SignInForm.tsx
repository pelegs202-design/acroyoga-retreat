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
      {/* Wordmark at top of card — Stitch design */}
      <div className="text-center mb-10">
        <div className="text-2xl font-black tracking-tighter uppercase mb-4">
          <span className="text-brand">Acro</span>
          <span className="text-white">Havura</span>
        </div>
        <h1 className="text-4xl font-black mb-2 text-neutral-100">
          {t("signIn")}
        </h1>
        <p className="text-gray-400 text-sm">{t("signInSubtitle") ?? ""}</p>
      </div>

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
            className="w-full bg-neutral-900 border-2 border-white/20 text-white p-3 outline-none transition-all placeholder:text-gray-600 focus:border-brand focus:shadow-[4px_4px_0px_0px_#F472B6]"
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
            className="w-full bg-neutral-900 border-2 border-white/20 text-white p-3 outline-none transition-all placeholder:text-gray-600 focus:border-brand focus:shadow-[4px_4px_0px_0px_#F472B6]"
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
          className="btn-press w-full bg-brand text-black font-black py-4 uppercase tracking-widest hover:bg-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "..." : t("signIn")}
        </button>
      </form>

      {/* Signup link — Stitch: divider + centered text */}
      <div className="mt-10 pt-6 border-t border-white/10 text-center">
        <p className="text-sm text-gray-400">
          {t("noAccount")}{" "}
          <a
            href={`/${locale}/sign-up`}
            className="text-brand font-bold hover:underline ms-1"
          >
            {t("signUp")}
          </a>
        </p>
      </div>
    </div>
  );
}
