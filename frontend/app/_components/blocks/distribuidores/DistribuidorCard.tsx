"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { DistributorEntry } from "./types";

interface DistribuidorCardProps {
  distributor: DistributorEntry;
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "w-4 h-4 text-[#6b7280] shrink-0"}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 1C5.24 1 3 3.24 3 6C3 9.75 8 15 8 15C8 15 13 9.75 13 6C13 3.24 10.76 1 8 1ZM8 7.5C7.17 7.5 6.5 6.83 6.5 6C6.5 5.17 7.17 4.5 8 4.5C8.83 4.5 9.5 5.17 9.5 6C9.5 6.83 8.83 7.5 8 7.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      className="w-4 h-4 text-[#6b7280] shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.41 7.19C5.37 9.08 6.92 10.62 8.81 11.59L10.27 10.13C10.45 9.95 10.71 9.89 10.94 9.97C11.69 10.21 12.5 10.35 13.33 10.35C13.7 10.35 14 10.65 14 11.02V13.33C14 13.7 13.7 14 13.33 14C6.72 14 1.33 8.61 1.33 2C1.33 1.63 1.63 1.33 2 1.33H4.33C4.7 1.33 5 1.63 5 2C5 2.84 5.14 3.64 5.38 4.39C5.45 4.62 5.4 4.87 5.21 5.06L4.41 7.19Z"
        fill="currentColor"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      className="w-4 h-4 text-[#6b7280] shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M1.5 8H14.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M8 1.5C9.8 3.7 10.7 5.8 10.7 8C10.7 10.2 9.8 12.3 8 14.5C6.2 12.3 5.3 10.2 5.3 8C5.3 5.8 6.2 3.7 8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function CoverageIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-low-dark-blue shrink-0"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 1L1.5 3.5V7C1.5 10 4 12.5 7 13C10 12.5 12.5 10 12.5 7V3.5L7 1Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      className="size-[18px] shrink-0"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11 2H16V7M16 2L8.5 9.5M7.5 3H4C2.89543 3 2 3.89543 2 5V14C2 15.1046 2.89543 16 4 16H13C14.1046 16 15 15.1046 15 14V10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      className="size-[18px] shrink-0"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="6"
        y="6"
        width="10"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 6V4.5C12 3.67157 11.3284 3 10.5 3H4C3.17157 3 2.5 3.67157 2.5 4.5V11C2.5 11.8284 3.17157 12.5 4 12.5H6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function normalizeStringRepeater(
  value: string[] | { [key: string]: string }[] | undefined,
  key: string,
): string[] {
  if (!value || !Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && key in item) return item[key];
      return "";
    })
    .filter((s) => s && s.trim().length > 0);
}

// ACF link groups default the `title` field to the URL itself when the
// editor leaves it blank. Treat URL-like titles as "no title" so the
// component falls back to its default label.
function getLinkLabel(link: { title?: string; url?: string } | undefined, fallback: string): string {
  const title = link?.title?.trim();
  if (!title) return fallback;
  if (/^https?:\/\//i.test(title)) return fallback;
  if (link?.url && title === link.url) return fallback;
  return title;
}

export default function DistribuidorCard({ distributor }: DistribuidorCardProps) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    },
    [],
  );

  const phonesFromRepeater = normalizeStringRepeater(distributor.phones, "phone");
  const phones =
    phonesFromRepeater.length > 0
      ? phonesFromRepeater
      : distributor.phone
        ? [distributor.phone]
        : [];

  const coverageAreas = normalizeStringRepeater(
    distributor.coverage_areas,
    "area",
  );

  const handleCopyPhone = async () => {
    if (phones.length === 0) return;
    const value = phones.join(" / ");

    const writeViaTextarea = () => {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    };

    let success = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        success = true;
      } else {
        success = writeViaTextarea();
      }
    } catch {
      // Clipboard API may reject for NotAllowedError (e.g. document not focused)
      // or NotFoundError. Cascade to the textarea fallback before giving up.
      try {
        success = writeViaTextarea();
      } catch (fallbackError) {
        console.error("Falha ao copiar telefone:", fallbackError);
      }
    }

    if (!success) return;

    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    setCopied(true);
    copyTimerRef.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-white border border-dark-blue rounded-lg p-6 flex flex-col gap-6 shadow-[0px_2px_12px_0px_rgba(0,0,0,0.04)] flex-[1_0_0] min-w-full sm:min-w-[410px]">
      <div className="flex items-center gap-3">
        {distributor.logo?.url && (
          <div className="bg-white border-[2.5px] border-light-gray rounded-[10px] flex items-center justify-center w-[153px] h-[110px] px-3 py-0.5 shrink-0 overflow-hidden">
            <div className="bg-neutral flex-1 h-[85px] rounded-[10px] flex items-center justify-center">
              <div className="relative w-[112px] h-[56px]">
                <Image
                  src={distributor.logo.url}
                  alt={distributor.logo.alt || distributor.name}
                  fill
                  className="object-contain"
                  sizes="112px"
                />
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <h3 className="font-semibold text-[#111827] text-[22px] md:text-[28px] leading-6 tracking-[-0.3px]">
            {distributor.name}
          </h3>
          {distributor.state_label && (
            <p className="text-base text-dark-blue leading-[19.5px] tracking-[-0.08px]">
              {distributor.state_label}
              {distributor.state_code ? ` — ${distributor.state_code}` : ""}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {distributor.address && (
          <div className="flex items-start gap-2">
            <MapPinIcon className="w-4 h-4 text-[#6b7280] shrink-0 mt-[3px]" />
            <p className="flex-1 text-[14px] text-[#6b7280] leading-[21px] tracking-[-0.15px] whitespace-pre-line">
              {distributor.address}
            </p>
          </div>
        )}

        {phones.length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
            {phones.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <PhoneIcon />
                <p className="text-[14px] text-[#6b7280] leading-[21px] tracking-[-0.15px] whitespace-nowrap">
                  {p}
                </p>
              </div>
            ))}
          </div>
        )}

        {distributor.website?.url && (
          <div className="flex items-center gap-2">
            <GlobeIcon />
            <p className="flex-1 text-[14px] text-[#6b7280] leading-[21px] tracking-[-0.15px] truncate">
              {distributor.website.url}
            </p>
          </div>
        )}
      </div>

      {coverageAreas.length > 0 && (
        <>
          <div className="bg-light-gray h-px w-full" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <CoverageIcon />
              <p className="text-[13px] font-semibold text-low-dark-blue leading-[19.5px] tracking-[-0.08px]">
                Áreas de cobertura
              </p>
            </div>
            <ul className="flex flex-wrap items-center gap-[7px]">
              {coverageAreas.map((area, index) => (
                <li
                  key={index}
                  className="bg-[rgba(0,20,80,0.05)] text-dark-blue text-[12px] leading-[18px] rounded-[2px] px-2.5 py-px"
                >
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="flex gap-2 h-[43px] mt-auto">
        {distributor.website?.url && (
          <a
            href={distributor.website.url}
            target={distributor.website.target || "_blank"}
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 border border-dark-blue text-dark-blue text-base px-4 py-2 rounded-[4px] hover:bg-neutral-2 transition-colors"
          >
            <ExternalLinkIcon />
            <span>{getLinkLabel(distributor.website, "Visitar site")}</span>
          </a>
        )}
        <button
          type="button"
          onClick={handleCopyPhone}
          disabled={phones.length === 0}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-dark-blue text-white text-base px-4 py-2 rounded-[4px] hover:bg-[#000d33] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          aria-live="polite"
        >
          <CopyIcon />
          <span>{copied ? "Telefone copiado" : "Copiar telefone"}</span>
        </button>
      </div>
    </div>
  );
}
