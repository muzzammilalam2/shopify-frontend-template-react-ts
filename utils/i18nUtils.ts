import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import ShopifyFormat from "@shopify/i18next-shopify";
import resourcesToBackend from "i18next-resources-to-backend";
import { match } from "@formatjs/intl-localematcher";
import { shouldPolyfill as shouldPolyfillLocale } from "@formatjs/intl-locale/should-polyfill";
import { shouldPolyfill as shouldPolyfillPluralRules } from "@formatjs/intl-pluralrules/should-polyfill";
import {
  DEFAULT_LOCALE as DEFAULT_POLARIS_LOCALE,
  SUPPORTED_LOCALES as SUPPORTED_POLARIS_LOCALES,
} from "@shopify/polaris";

const DEFAULT_APP_LOCALE: string = "en";
const SUPPORTED_APP_LOCALES: string[] = ["en", "de", "fr"];

let _userLocale: string;
let _polarisTranslations: Record<string, any> | undefined;

export function getUserLocale(): string {
  if (_userLocale) {
    return _userLocale;
  }
  const url = new URL(window.location.href);
  const locale = url.searchParams.get("locale") || DEFAULT_APP_LOCALE;
  _userLocale = match([locale], SUPPORTED_APP_LOCALES, DEFAULT_APP_LOCALE) as string;
  return _userLocale;
}

export function getPolarisTranslations(): Record<string, any> | undefined {
  return _polarisTranslations;
}

export async function initI18n(): Promise<void> {
  await loadIntlPolyfills();
  await Promise.all([initI18next(), fetchPolarisTranslations()]);
}

async function loadIntlPolyfills(): Promise<void> {
  if (shouldPolyfillLocale()) {
    await import("@formatjs/intl-locale/polyfill");
  }
  const promises: Promise<void>[] = [];
  if (shouldPolyfillPluralRules(DEFAULT_APP_LOCALE)) {
    await import("@formatjs/intl-pluralrules/polyfill-force");
    promises.push(loadIntlPluralRulesLocaleData(DEFAULT_APP_LOCALE));
  }
  if (
    DEFAULT_APP_LOCALE !== getUserLocale() &&
    shouldPolyfillPluralRules(getUserLocale())
  ) {
    promises.push(loadIntlPluralRulesLocaleData(getUserLocale()));
  }
  await Promise.all(promises);
}

const PLURAL_RULES_LOCALE_DATA: Record<string, () => Promise<any>> = {
  en: () => import("@formatjs/intl-pluralrules/locale-data/en"),
  de: () => import("@formatjs/intl-pluralrules/locale-data/de"),
  fr: () => import("@formatjs/intl-pluralrules/locale-data/fr"),
};

async function loadIntlPluralRulesLocaleData(locale: string): Promise<void> {
  await PLURAL_RULES_LOCALE_DATA[locale]?.();
}
// @ts-ignore
async function initI18next(): Promise<i18next.i18n> {
  return await i18next
    .use(initReactI18next)
    .use(ShopifyFormat)
    .use(localResourcesToBackend())
    .init({
      debug: process.env.NODE_ENV === "development",
      lng: getUserLocale(),
      fallbackLng: DEFAULT_APP_LOCALE,
      supportedLngs: SUPPORTED_APP_LOCALES,
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
}

function localResourcesToBackend() {
  return resourcesToBackend(async (locale: string, _namespace: string) => {
    return (await import(`../locales/${locale}.json`)).default;
  });
}

async function fetchPolarisTranslations(): Promise<Record<string, any>> {
  if (_polarisTranslations) {
    return _polarisTranslations;
  }
  const defaultPolarisLocale = match(
    [DEFAULT_APP_LOCALE],
    SUPPORTED_POLARIS_LOCALES,
    DEFAULT_POLARIS_LOCALE
  ) as string;
  const polarisLocale = match(
    [getUserLocale()],
    SUPPORTED_POLARIS_LOCALES,
    defaultPolarisLocale
  ) as string;
  _polarisTranslations = await loadPolarisTranslations(polarisLocale);
  return _polarisTranslations;
}

const POLARIS_LOCALE_DATA: Record<string, () => Promise<any>> = {
  en: () => import("@shopify/polaris/locales/en.json"),
  de: () => import("@shopify/polaris/locales/de.json"),
  fr: () => import("@shopify/polaris/locales/fr.json"),
};

async function loadPolarisTranslations(locale: string): Promise<Record<string, any>> {
  return (await POLARIS_LOCALE_DATA[locale]?.())?.default ?? {};
}
