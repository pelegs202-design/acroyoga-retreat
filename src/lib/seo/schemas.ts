import type {
  Organization,
  LocalBusiness,
  Event,
  FAQPage,
  WithContext,
} from "schema-dts";

const BASE_URL = "https://acroretreat.co.il";

export function buildOrganizationSchema(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AcroHavura",
    alternateName: "אקרוחבורה",
    url: BASE_URL,
    logo: `${BASE_URL}/icon-512x512.png`,
    sameAs: ["https://instagram.com/acroshay"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "community",
      availableLanguage: ["Hebrew", "English"],
    },
  };
}

export function buildLocalBusinessSchema(
  city: "tel-aviv" | "kfar-saba"
): WithContext<LocalBusiness> {
  const cityData = {
    "tel-aviv": {
      name: "AcroHavura Tel Aviv",
      alternateName: "אקרוחבורה תל אביב",
      address: {
        addressLocality: "תל אביב",
        addressRegion: "מרכז",
        addressCountry: "IL",
      },
    },
    "kfar-saba": {
      name: "AcroHavura Kfar Saba",
      alternateName: "אקרוחבורה כפר סבא",
      address: {
        addressLocality: "כפר סבא",
        addressRegion: "מרכז",
        addressCountry: "IL",
      },
    },
  }[city];

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: cityData.name,
    alternateName: cityData.alternateName,
    url: `${BASE_URL}/he/cities/${city}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: cityData.address.addressLocality,
      addressRegion: cityData.address.addressRegion,
      addressCountry: cityData.address.addressCountry,
    },
  };
}

export function buildEventSchema(jam: {
  id: string;
  scheduledAt: Date;
  location: string;
  level: string;
}): WithContext<Event> {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `ג'אם אקרויוגה - ${jam.location}`,
    startDate: jam.scheduledAt.toISOString(),
    location: {
      "@type": "Place",
      name: jam.location,
      address: { "@type": "PostalAddress", addressCountry: "IL" },
    },
    organizer: { "@type": "Organization", name: "AcroHavura", url: BASE_URL },
    url: `${BASE_URL}/he/jams/${jam.id}`,
    eventAttendanceMode:
      "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
  };
}

export function buildFAQSchema(
  faqs: Array<{ q: string; a: string }>
): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}
