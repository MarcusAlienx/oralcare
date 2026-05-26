import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "en" | "es";
export const supportedLocales: Locale[] = ["en", "es"];
const STORAGE_KEY = "oralcare_locale";
const defaultLocale: Locale = "en";

const translations = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      services: "Services",
      team: "Team",
      testimonials: "Testimonials",
      contact: "Contact",
      schedule: "Book Visit",
      language: "Language",
    },
    hero: {
      badge: "Medical Tourism Dentistry",
      title: "Premium dental care for U.S. and Canadian patients",
      subtitle: "High-value implants, smile design and holistic dentistry in Guadalajara with trusted clinical standards.",
      action: "Plan Your Visit",
      whatsapp: "Contact via WhatsApp",
    },
    about: {
      title: "Trusted dental tourism in Western Mexico",
      description: "We provide concierge-level care, advanced dental procedures and fast coordination for international patients.",
    },
    services: {
      implants: {
        title: "Dental Implants",
        desc: "Permanent implant restorations designed to look and feel natural for long-term function.",
      },
      smile: {
        title: "Smile Design",
        desc: "Custom cosmetic planning to transform your smile with veneers, whitening and digital planning.",
      },
      holistic: {
        title: "Holistic Dentistry",
        desc: "Comprehensive care focused on oral health, facial balance and a comfortable patient journey.",
      },
    },
    leadForm: {
      title: "International Patient Inquiry",
      subtitle: "Share your travel plans and treatment needs, and our concierge team will contact you within 24 hours.",
      fields: {
        name: "Full name",
        email: "Email",
        phone: "WhatsApp with country code",
        country: "Country of origin",
        treatment: "Treatment needed",
        travelDates: "Estimated travel dates",
        preferredAppointment: "Preferred appointment",
        message: "Additional details",
        submit: "Send inquiry",
      },
      options: {
        implants: "Dental Implants",
        smile: "Smile Design",
        holistic: "Holistic Dentistry",
        fullMouth: "Full Mouth Rehabilitation",
        veneers: "Porcelain Veneers",
      },
      validation: {
        required: "This field is required",
        selectDate: "Please select a valid date and time",
      },
      success: {
        title: "Inquiry sent",
        description: "One of our patient coordinators will reach out shortly.",
      },
      error: {
        title: "Submission failed",
        description: "Please verify your details and try again.",
      },
    },
    appointmentPicker: {
      label: "Preferred appointment",
      note: "Available hours Mon-Fri 09:00-19:00, Sat 09:00-14:00",
      chooseDate: "Choose a date",
      chooseTime: "Choose a time",
      noSlots: "No available slots for this date",
      invalidDate: "Select a valid future date",
    },
    footer: {
      services: "Services",
      hours: "Hours",
      contact: "Contact",
      privacy: "Privacy Notice",
      terms: "Terms & Conditions",
    },
    meta: {
      title: "A&E OralCare | Dental Tourism in Western Mexico",
      description: "Premium dental tourism services for U.S. and Canadian patients in Guadalajara. Implants, smile design and holistic dentistry with trusted clinical care.",
    },
  },
  es: {
    nav: {
      home: "Inicio",
      about: "Nosotros",
      services: "Servicios",
      team: "Equipo",
      testimonials: "Testimonios",
      contact: "Contacto",
      schedule: "Agendar Visita",
      language: "Idioma",
    },
    hero: {
      badge: "Turismo Médico Dental",
      title: "Atención dental premium para pacientes de Estados Unidos y Canadá",
      subtitle: "Implantes, diseño de sonrisa y odontología holística en Guadalajara con altos estándares clínicos.",
      action: "Planifica tu visita",
      whatsapp: "Contactar por WhatsApp",
    },
    about: {
      title: "Turismo médico dental confiable en el occidente de México",
      description: "Coordinamos atención concierge, procedimientos avanzados y una experiencia segura para pacientes internacionales.",
    },
    services: {
      implants: {
        title: "Implantes Dentales",
        desc: "Restauraciones implantosoportadas diseñadas para lucir y sentirse naturales con función duradera.",
      },
      smile: {
        title: "Diseño de Sonrisa",
        desc: "Planificación estética personalizada para transformar tu sonrisa con carillas, blanqueamiento y diseño digital.",
      },
      holistic: {
        title: "Odontología Holística",
        desc: "Cuidado integral enfocado en salud oral, equilibrio facial y confort en todo el viaje del paciente.",
      },
    },
    leadForm: {
      title: "Contacto para Turismo Médico",
      subtitle: "Comparte tus fechas de viaje y necesidades de tratamiento. Nuestro equipo de concierge te contactará en menos de 24 horas.",
      fields: {
        name: "Nombre completo",
        email: "Correo electrónico",
        phone: "WhatsApp con código de país",
        country: "País de origen",
        treatment: "Tratamiento requerido",
        travelDates: "Fechas estimadas de viaje",
        preferredAppointment: "Cita preferida",
        message: "Detalles adicionales",
        submit: "Enviar consulta",
      },
      options: {
        implants: "Implantes Dentales",
        smile: "Diseño de Sonrisa",
        holistic: "Odontología Holística",
        fullMouth: "Rehabilitación Total",
        veneers: "Carillas de Porcelana",
      },
      validation: {
        required: "Este campo es obligatorio",
        selectDate: "Selecciona una fecha y hora válidas",
      },
      success: {
        title: "Consulta enviada",
        description: "Nuestro coordinador se pondrá en contacto contigo pronto.",
      },
      error: {
        title: "Error al enviar",
        description: "Verifica los datos e intenta nuevamente.",
      },
    },
    appointmentPicker: {
      label: "Cita preferida",
      note: "Horario disponible Lun-Vie 09:00-19:00, Sáb 09:00-14:00",
      chooseDate: "Selecciona una fecha",
      chooseTime: "Selecciona una hora",
      noSlots: "No hay horarios disponibles en esta fecha",
      invalidDate: "Selecciona una fecha futura válida",
    },
    footer: {
      services: "Servicios",
      hours: "Horario",
      contact: "Contacto",
      privacy: "Aviso de Privacidad",
      terms: "Términos y Condiciones",
    },
    meta: {
      title: "A&E OralCare | Turismo dental en el occidente de México",
      description: "Servicios premium de turismo dental para pacientes de Estados Unidos y Canadá en Guadalajara. Implantes, diseño de sonrisa y odontología holística con atención confiable.",
    },
  },
};

type TranslationKey = keyof typeof translations[Locale];

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
  t: (key: string) => key,
});

const resolveTranslation = (locale: Locale, key: string): string => {
  const path = key.split(".");
  let current: any = translations[locale];
  for (const segment of path) {
    if (!current || typeof current !== "object") {
      return key;
    }
    current = current[segment];
  }
  return typeof current === "string" ? current : key;
};

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && supportedLocales.includes(stored)) {
      setLocaleState(stored);
      return;
    }

    const browserLocale = window.navigator.language.slice(0, 2).toLowerCase();
    if (supportedLocales.includes(browserLocale as Locale)) {
      setLocaleState(browserLocale as Locale);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: (key: string) => resolveTranslation(locale, key),
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}
