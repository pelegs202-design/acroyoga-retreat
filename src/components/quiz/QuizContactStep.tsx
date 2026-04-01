"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, {
      message: "Include country code, e.g. +972501234567",
    }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const LABELS = {
  en: {
    name: "Full name",
    email: "Email address",
    phone: "Phone number",
    phoneHint: "Include country code, e.g. +972...",
    submit: "Continue",
  },
  he: {
    name: "שם מלא",
    email: "כתובת אימייל",
    phone: "מספר טלפון",
    phoneHint: "כולל קידומת מדינה, למשל +972...",
    submit: "המשך",
  },
};

interface QuizContactStepProps {
  onSubmit: (info: { name: string; email: string; phone: string }) => void;
  locale: string;
}

export default function QuizContactStep({ onSubmit, locale }: QuizContactStepProps) {
  const t = locale === "he" ? LABELS.he : LABELS.en;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const handleFormSubmit = (values: ContactFormValues) => {
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5 w-full" noValidate>
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="quiz-name" className="text-sm font-medium text-neutral-300">
          {t.name}
        </label>
        <input
          id="quiz-name"
          type="text"
          autoComplete="name"
          {...register("name")}
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F472B6] transition-colors"
        />
        {errors.name && (
          <p className="text-xs text-red-400">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="quiz-email" className="text-sm font-medium text-neutral-300">
          {t.email}
        </label>
        <input
          id="quiz-email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F472B6] transition-colors"
        />
        {errors.email && (
          <p className="text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="quiz-phone" className="text-sm font-medium text-neutral-300">
          {t.phone}
        </label>
        <input
          id="quiz-phone"
          type="tel"
          autoComplete="tel"
          placeholder="+972..."
          {...register("phone")}
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F472B6] transition-colors"
          dir="ltr"
        />
        <p className="text-xs text-neutral-500">{t.phoneHint}</p>
        {errors.phone && (
          <p className="text-xs text-red-400">{errors.phone.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-xl bg-[#F472B6] px-6 py-3 text-sm font-semibold text-black disabled:opacity-60 transition-opacity hover:opacity-90"
      >
        {t.submit}
      </button>
    </form>
  );
}
