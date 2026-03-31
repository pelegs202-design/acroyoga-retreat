"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@/i18n/navigation";

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
  const router = useRouter();
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
      router.push(`/${locale}/tos` as Parameters<typeof router.push>[0]);
    } else if (!user.city || !user.role || !user.level) {
      // Onboarding incomplete
      router.push(`/${locale}/onboarding` as Parameters<typeof router.push>[0]);
    } else {
      // Fully onboarded — go to dashboard
      router.push(`/${locale}/dashboard` as Parameters<typeof router.push>[0]);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-100">{t("signIn")}</h1>

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
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
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
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
          />
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot password link */}
        <div className="text-end">
          <a
            href={`/${locale}/reset-password`}
            className="text-sm text-neutral-400 hover:text-neutral-200"
          >
            {t("forgotPassword")}
          </a>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {serverError}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "..." : t("signIn")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        {t("noAccount")}{" "}
        <a
          href={`/${locale}/sign-up`}
          className="font-medium text-neutral-100 underline underline-offset-4 hover:text-white"
        >
          {t("signUp")}
        </a>
      </p>
    </div>
  );
}
