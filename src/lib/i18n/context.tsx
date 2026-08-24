"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { dictionaries, type Locale } from "./dictionaries";

type I18nContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string>) => string;
  dir: "ltr" | "rtl";
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("gpsr-locale") as Locale | null;
    if (saved && ["en", "fr", "ar"].includes(saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    localStorage.setItem("gpsr-locale", locale);
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
  };

  const t = (key: string, vars?: Record<string, string>) => {
    let str = dictionaries[locale][key] ?? dictionaries["en"][key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, v);
      }
    }
    return str;
  };

  const dir = locale === "ar" ? "rtl" : "ltr";

  return <I18nContext.Provider value={{ locale, setLocale, t, dir }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
