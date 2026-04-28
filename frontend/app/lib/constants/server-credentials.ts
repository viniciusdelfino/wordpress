/**
 * Server-only credentials. NEVER import from 'use client' components.
 * Hybrid: reads from .env first, falls back to hardcoded values.
 */

if (typeof window !== "undefined") {
  throw new Error("[server-credentials] Server-only module. Client import blocked.");
}

export const INFORLUBE_CREDENTIALS = {
  API_URL: "https://mobil-api.dafitech.com/api/v2",
  HASH: process.env.INFORLUBE_HASH || "",
} as const;

export const XLAB_CREDENTIALS = {
  EMAIL: process.env.XLAB_EMAIL || "",
  PASSWORD: process.env.XLAB_PASSWORD || "",
} as const;

export const RECAPTCHA = {
  SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "",
} as const;