"use client";

import React, { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type FormVariant = "industria" | "guia-oleo-frotas";

interface EbookDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  ebookName: string;
  ebookUrl: string;
  variant: FormVariant;
}

type InputKind = "text" | "email";

interface ParsedInputField {
  kind: "input";
  type: InputKind;
  name: string;
  placeholder: string;
  required: boolean;
}

interface ParsedAcceptanceField {
  kind: "acceptance";
  name: string;
  label: string;
  required: boolean;
}

type ParsedField = ParsedInputField | ParsedAcceptanceField;

interface ParsedEbookForm {
  formId: string;
  fields: ParsedField[];
}

type FormValues = Record<string, string | boolean>;

/* ------------------------------------------------------------------ */
/*  CF7 form IDs per variant                                           */
/* ------------------------------------------------------------------ */

const FORM_CONFIG: Record<FormVariant, { formId: string }> = {
  industria: { formId: "809d20e" },
  "guia-oleo-frotas": { formId: "41b7684" },
};

/* ------------------------------------------------------------------ */
/*  Fallback field definitions (used when CF7 GET returns 403/empty)    */
/* ------------------------------------------------------------------ */

function getFallbackFields(variant: FormVariant): ParsedField[] {
  const common: ParsedField[] = [
    {
      kind: "input",
      type: "text",
      name: "your-name",
      placeholder: "Seu nome",
      required: true,
    },
    {
      kind: "input",
      type: "email",
      name: "your-email",
      placeholder: "Seu e-mail",
      required: true,
    },
  ];

  if (variant === "industria") {
    common.push({
      kind: "input",
      type: "text",
      name: "your-role",
      placeholder: "Cargo/Profissão",
      required: true,
    });
  }

  common.push({
    kind: "acceptance",
    name: "acceptance-newsletter",
    label:
      "Quero receber informações e materiais adicionais da marca Mobil no email informado",
    required: false,
  });

  return common;
}

/* ------------------------------------------------------------------ */
/*  CF7 shortcode parser (reuses Newsletter pattern)                    */
/* ------------------------------------------------------------------ */

function parseCf7Markup(markup: string, variant: FormVariant): ParsedField[] {
  const fields: ParsedField[] = [];

  const inputRegex =
    /\[(text|email)(\*?)\s+([^\s\]]+)([^\]]*)\]/gi;
  let match: RegExpExecArray | null = inputRegex.exec(markup);

  while (match) {
    const placeholderMatch = match[4]?.match(/"([^"]*)"/);
    fields.push({
      kind: "input",
      type: match[1].toLowerCase() as InputKind,
      name: match[3],
      placeholder: placeholderMatch?.[1] || "",
      required: match[2] === "*",
    });
    match = inputRegex.exec(markup);
  }

  const acceptanceRegex =
    /\[acceptance(\*?)\s+([^\]\s]+)[^\]]*\]([\s\S]*?)\[\/acceptance\]/gi;
  let acceptanceMatch: RegExpExecArray | null = acceptanceRegex.exec(markup);

  while (acceptanceMatch) {
    fields.push({
      kind: "acceptance",
      name: acceptanceMatch[2],
      label: (acceptanceMatch[3] || "").trim(),
      required: acceptanceMatch[1] === "*",
    });
    acceptanceMatch = acceptanceRegex.exec(markup);
  }

  if (fields.length === 0) {
    return getFallbackFields(variant);
  }

  // Ensure the newsletter opt-in checkbox is present
  if (!fields.some((f) => f.kind === "acceptance")) {
    fields.push({
      kind: "acceptance",
      name: "acceptance-newsletter",
      label:
        "Quero receber informações e materiais adicionais da marca Mobil no email informado",
      required: false,
    });
  }

  return fields;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function EbookDownloadModal({
  isOpen,
  onClose,
  ebookName,
  ebookUrl,
  variant,
}: EbookDownloadModalProps) {
  const [values, setValues] = useState<FormValues>({});
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);
  const [resolvedMarkup, setResolvedMarkup] = useState("");

  const formId = FORM_CONFIG[variant].formId;

  /* ---------- body scroll lock ---------- */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* ---------- close on Escape ---------- */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  /* ---------- fetch CF7 form markup ---------- */
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const fetchMarkup = async () => {
      try {
        const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "";
        const baseUrl = wpUrl.replace(/\/wp-json\/?$/, "");
        const endpoint = `${baseUrl}/wp-json/contact-form-7/v1/contact-forms/${formId}`;

        const response = await fetch(endpoint);
        if (!response.ok) return;

        const data = await response.json();
        const markup = data?.properties?.form || "";

        if (isMounted) {
          setResolvedMarkup(typeof markup === "string" ? markup : "");
        }
      } catch {
        /* fallback fields will be used */
      }
    };

    fetchMarkup();

    return () => {
      isMounted = false;
    };
  }, [isOpen, formId]);

  /* ---------- parse fields ---------- */
  const fields = useMemo<ParsedField[]>(() => {
    if (resolvedMarkup) {
      return parseCf7Markup(resolvedMarkup, variant);
    }

    return getFallbackFields(variant);
  }, [resolvedMarkup, variant]);

  /* ---------- reset form state when fields change ---------- */
  useEffect(() => {
    const initial: FormValues = {};
    fields.forEach((field) => {
      initial[field.name] = field.kind === "acceptance" ? false : "";
    });
    setValues(initial);
    setStatus("idle");
  }, [fields]);

  /* ---------- handlers ---------- */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const hasInvalidRequired = fields.some((field) => {
      if (!field.required) return false;
      if (field.kind === "input") return !String(values[field.name] || "").trim();
      return Boolean(values[field.name]) !== true;
    });

    if (hasInvalidRequired) {
      setStatus("error");
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "";
      const baseUrl = wpUrl.replace(/\/wp-json\/?$/, "");
      const endpoint = `${baseUrl}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`;

      const body = new FormData();
      body.append("_wpcf7", formId);
      body.append("_wpcf7_unit_tag", `wpcf7-f${formId}-o1`);

      fields.forEach((field) => {
        if (field.kind === "input") {
          body.append(field.name, String(values[field.name] || ""));
        }
        if (field.kind === "acceptance" && values[field.name]) {
          body.append(field.name, "1");
        }
      });

      const response = await fetch(endpoint, { method: "POST", body });
      const result = await response.json();

      if (response.ok && result?.status === "mail_sent") {
        setStatus("success");

        // Trigger file download
        if (ebookUrl) {
          const link = document.createElement("a");
          link.href = ebookUrl;
          link.download = "";
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  /* ---------- render ---------- */
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0, 20, 80, 0.5)" }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Download de e-book"
    >
      <div className="w-full max-w-[28rem] rounded-lg bg-white overflow-hidden shadow-2xl">
        {/* ---- Header ---- */}
        <div
          className="relative flex items-center justify-between p-6 h-[114px] md:h-[96px]"
          style={{
            background: "linear-gradient(90deg, #070B18 0%, #001450 100%)",
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Image
              src="/icons/download.svg"
              alt=""
              width={24}
              height={24}
              className="shrink-0 brightness-0 invert"
            />
            <div className="min-w-0">
              <p className="text-white text-lg md:text-xl font-semibold leading-tight">
                Acesse o material completo
              </p>
              <p className="text-gray text-sm leading-tight truncate mt-0.5">
                E-book: {ebookName || "Material"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 ml-3 p-1 text-white/80 hover:text-white transition-colors"
            aria-label="Fechar modal"
          >
            <Image src="/icons/close-white.png" height={28} width={28} alt="Fechar o modal" />
          </button>
        </div>

        {/* ---- Body ---- */}
        <div className="py-6 px-4">
          <p className="text-[#717182] text-sm md:text-lg mb-5">Preencha os dados abaixo para download gratuito.</p>
          {status === "success" ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-dark-blue font-semibold text-base mb-1">
                Download iniciado!
              </p>
              <p className="text-sm text-low-dark-blue">
                Seu material está sendo baixado. Verifique a pasta de downloads
                do seu navegador.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 text-sm text-red font-semibold hover:underline"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {fields
                .filter((f) => f.kind === "input")
                .map((field) => (
                  <input
                    key={field.name}
                    type={field.type}
                    name={field.name}
                    value={String(values[field.name] || "")}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full rounded-lg border border-light-gray px-4 py-3 placeholder:text-base text-low-dark-blue placeholder:text-low-dark-blue outline-none focus:border-blue focus:ring-1 focus:ring-blue transition min-h-[3.125rem]"
                  />
                ))}

              {fields
                .filter((f) => f.kind === "acceptance")
                .map((field) => (
                  <label
                    key={field.name}
                    className="flex items-start gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name={field.name}
                      checked={Boolean(values[field.name])}
                      onChange={handleInputChange}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border-[#9CA3AF] text-red accent-red"
                    />
                    <span className="text-sm text-[#575766] leading-snug">
                      {field.label}
                    </span>
                  </label>
                ))}

              {status === "error" && (
                <p className="text-xs text-red">
                  Não foi possível enviar. Verifique os campos e tente
                  novamente.
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg bg-red py-3 text-base text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Enviando..." : "Baixar material"}
              </button>
            </form>
          )}

          {/* ---- Footer / privacy ---- */}
          <p className="mt-4 text-[11px] text-medium-gray leading-snug text-center">
            Seus dados estão protegidos. Ao preencher este formulário, você
            concorda com nossa{" "}
            <a
              href="/politica-de-privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-dark-blue transition-colors"
            >
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
