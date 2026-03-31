"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@/i18n/navigation";

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpValues = z.infer<typeof signUpSchema>;

type Props = {
  locale: string;
};

export default function SignUpForm({ locale }: Props) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(values: SignUpValues) {
    setServerError(null);
    const result = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
    });

    if (result.error) {
      setServerError(result.error.message ?? "Sign up failed. Please try again.");
      return;
    }

    // Success — redirect to TOS acceptance (not dashboard)
    router.push(`/${locale}/tos` as Parameters<typeof router.push>[0]);
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-100">{t("signUp")}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-neutral-300"
          >
            {t("name")}
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            {...register("name")}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
          />
          {errors.name && (
            <p className="mt-1.5 text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>

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
            autoComplete="new-password"
            {...register("password")}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
          />
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-400">{errors.password.message}</p>
          )}
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
          {isSubmitting ? "..." : t("signUp")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        {t("hasAccount")}{" "}
        <a
          href={`/${locale}/sign-in`}
          className="font-medium text-neutral-100 underline underline-offset-4 hover:text-white"
        >
          {t("signIn")}
        </a>
      </p>
    </div>
  );
}
