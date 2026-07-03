import { cookies } from "next/headers";

import { DEFAULT_LOCALE, LOCALE_COOKIE_KEY } from "./dictionary";
import type { Locale } from "./types";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE_KEY)?.value;
  if (value === "en" || value === "zh") return value;
  return DEFAULT_LOCALE;
}
