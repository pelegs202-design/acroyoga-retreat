export interface WhatsAppButton {
  type: "reply" | "url" | "phone_number";
  reply?: { id: string; title: string };
  url?: { display_text: string; url: string };
  phone_number?: { display_text: string; phone_number: string };
}

export interface SendWhatsAppTemplateOptions {
  to: string;
  templateName: string;
  languageCode: string;
  bodyParams?: string[];
  buttons?: WhatsAppButton[];
}

export async function sendWhatsAppTemplate({
  to,
  templateName,
  languageCode,
  bodyParams,
  buttons,
}: SendWhatsAppTemplateOptions): Promise<void> {
  const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;
  const token = process.env.WA_CLOUD_API_TOKEN;

  if (!phoneNumberId || !token) {
    throw new Error(
      "Missing WA_PHONE_NUMBER_ID or WA_CLOUD_API_TOKEN environment variables",
    );
  }

  const components: Record<string, unknown>[] = [];

  if (bodyParams && bodyParams.length > 0) {
    components.push({
      type: "body",
      parameters: bodyParams.map((text) => ({ type: "text", text })),
    });
  }

  if (buttons && buttons.length > 0) {
    buttons.forEach((button, index) => {
      components.push({
        type: "button",
        sub_type: button.type,
        index: String(index),
        parameters: [button.reply ?? button.url ?? button.phone_number],
      });
    });
  }

  const body = {
    messaging_product: "whatsapp",
    to: normalizeIsraeliPhone(to),
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components: components.length > 0 ? components : undefined,
    },
  };

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      `WhatsApp API error ${res.status}: ${JSON.stringify(errorBody)}`,
    );
  }
}

/**
 * Normalize an Israeli phone number to the international format used by
 * WhatsApp (e.g. "0541234567" → "972541234567").
 * If the number already starts with "972", it is returned as-is (digits only).
 */
export function normalizeIsraeliPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0")) return "972" + digits.slice(1);
  return "972" + digits;
}
