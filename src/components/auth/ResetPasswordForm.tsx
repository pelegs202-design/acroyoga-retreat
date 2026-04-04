"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const requestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RequestValues = z.infer<typeof requestSchema>;
type ResetValues = z.infer<typeof resetSchema>;

type Props = {
  locale: string;
};

export default function ResetPasswordForm({ locale }: Props) {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const isResetMode = Boolean(token);

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  // Request mode form
  const requestForm = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
  });

  // Reset mode form
  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
  });

  async function onRequestSubmit(values: RequestValues) {
    setStatus("idle");
    setMessage(null);

    const result = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: `${window.location.origin}/${locale}/reset-password`,
    });

    if (result.error) {
      setStatus("error");
      setMessage(result.error.message ?? "Failed to send reset link. Please try again.");
    } else {
      setStatus("success");
      setMessage("Password reset link sent! Check your email.");
    }
  }

  async function onResetSubmit(values: ResetValues) {
    setStatus("idle");
    setMessage(null);

    const result = await authClient.resetPassword({
      newPassword: values.newPassword,
      token: token!,
    });

    if (result.error) {
      setStatus("error");
      setMessage(result.error.message ?? "Failed to reset password. The link may have expired.");
    } else {
      setStatus("success");
      setMessage("Password reset successfully! You can now sign in with your new password.");
    }
  }

  return (
    <div>
      {/* Brutalist bold heading with pink accent bar */}
      <h1 className="mb-2 text-3xl font-black tracking-tighter text-neutral-100">
        {t("resetPassword")}
      </h1>
      {/* Pink accent bar under heading */}
      <div className="mb-6 h-1 w-12 bg-brand" aria-hidden="true" />

      {status === "success" && message && (
        <div className="mb-4 border border-green-800 bg-green-950/50 px-4 py-3 text-sm text-green-300">
          {message}
        </div>
      )}

      {status === "error" && message && (
        <div className="mb-4 border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {message}
        </div>
      )}

      {!isResetMode ? (
        /* Request mode: ask for email */
        <form
          onSubmit={requestForm.handleSubmit(onRequestSubmit)}
          className="space-y-5"
          noValidate
        >
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
              {...requestForm.register("email")}
              className="w-full rounded-none border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-neutral-100 placeholder-neutral-500 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
            {requestForm.formState.errors.email && (
              <p className="mt-1.5 text-sm text-red-400">
                {requestForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={requestForm.formState.isSubmitting || status === "success"}
            className="btn-press w-full bg-brand px-4 py-3 text-sm font-black uppercase tracking-wide text-black transition-colors hover:bg-brand-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {requestForm.formState.isSubmitting ? "..." : t("sendResetLink")}
          </button>
        </form>
      ) : (
        /* Reset mode: new password form */
        <form
          onSubmit={resetForm.handleSubmit(onResetSubmit)}
          className="space-y-5"
          noValidate
        >
          <div>
            <label
              htmlFor="newPassword"
              className="mb-1.5 block text-sm font-medium text-neutral-300"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              {...resetForm.register("newPassword")}
              className="w-full rounded-none border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-neutral-100 placeholder-neutral-500 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
            {resetForm.formState.errors.newPassword && (
              <p className="mt-1.5 text-sm text-red-400">
                {resetForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium text-neutral-300"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...resetForm.register("confirmPassword")}
              className="w-full rounded-none border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-neutral-100 placeholder-neutral-500 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
            {resetForm.formState.errors.confirmPassword && (
              <p className="mt-1.5 text-sm text-red-400">
                {resetForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={resetForm.formState.isSubmitting || status === "success"}
            className="btn-press w-full bg-brand px-4 py-3 text-sm font-black uppercase tracking-wide text-black transition-colors hover:bg-brand-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resetForm.formState.isSubmitting ? "..." : t("resetPassword")}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-neutral-400">
        {t("hasAccount")}{" "}
        <a
          href={`/${locale}/sign-in`}
          className="font-bold text-brand transition-colors hover:text-brand-muted"
        >
          {t("signIn")}
        </a>
      </p>
    </div>
  );
}
