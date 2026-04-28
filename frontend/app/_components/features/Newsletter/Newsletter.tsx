"use client";

import React, { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";

interface NewsletterImage {
    url?: string;
    alt?: string;
}

interface NewsletterProps {
    bg_image?: NewsletterImage;
    desc?: string;
    form?: string;
}

type InputKind = "text" | "email" | "tel" | "number" | "url" | "date";

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

interface ParsedCheckboxField {
    kind: "checkbox";
    name: string;
    label: string;
    options: string[];
    required: boolean;
}

type ParsedField = ParsedInputField | ParsedAcceptanceField | ParsedCheckboxField;

interface ParsedNewsletterForm {
    formId: string;
    submitLabel: string;
    fields: ParsedField[];
}

type FormValues = Record<string, string | boolean | string[]>;

const DEFAULT_INTEREST_FIELD: ParsedCheckboxField = {
    kind: "checkbox",
    name: "checkbox-442",
    label: "Qual o assunto de interesse?",
    options: ["Carros, motos e caminhões", "Frotista", "Indústria"],
    required: false,
};

export default function Newsletter({ bg_image, desc, form }: NewsletterProps) {
    const [values, setValues] = useState<FormValues>({});
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [loading, setLoading] = useState(false);
    const [resolvedFormMarkup, setResolvedFormMarkup] = useState("");

    const formId = useMemo(() => {
        const isPlainId = form && !form.includes("[") && !form.includes("<") && /\S/.test(form);
        const formIdFromShortcode =
            form?.match(/\[contact-form-7[^\]]*\bid=(?:\"([^\"]+)\"|'([^']+)'|([^\s\]]+))/i) || null;
        const formIdFromHtml = form?.match(/<input[^>]*name=["']_wpcf7["'][^>]*value=["']([^"']+)["'][^>]*>/i);

        return (
            (isPlainId ? form?.trim() : "") ||
            formIdFromShortcode?.[1] ||
            formIdFromShortcode?.[2] ||
            formIdFromShortcode?.[3] ||
            formIdFromHtml?.[1] ||
            ""
        );
    }, [form]);

    useEffect(() => {
        const source = form || "";
        const hasInlineFields =
            /\[(text|email|tel|number|url|date|checkbox|acceptance)/i.test(source) ||
            source.includes("<input");

        if (!formId || hasInlineFields) {
            setResolvedFormMarkup("");
            return;
        }

        let isMounted = true;

        const fetchCf7FormMarkup = async () => {
            try {
                const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "";
                const baseUrl = wpUrl.replace(/\/wp-json\/?$/, "");
                const endpoint = `${baseUrl}/wp-json/contact-form-7/v1/contact-forms/${formId}`;

                const response = await fetch(endpoint);
                if (!response.ok) {
                    return;
                }

                const data = await response.json();
                const markup = data?.properties?.form || "";

                if (isMounted) {
                    setResolvedFormMarkup(typeof markup === "string" ? markup : "");
                }
            } catch {
                if (isMounted) {
                    setResolvedFormMarkup("");
                }
            }
        };

        fetchCf7FormMarkup();

        return () => {
            isMounted = false;
        };
    }, [form, formId]);

    const parsedForm = useMemo<ParsedNewsletterForm>(() => {
        const formSource = (resolvedFormMarkup || form || "").trim();
        // Se o ACF enviou apenas o ID direto (sem shortcode ou HTML)
        const isPlainId = formSource && !formSource.includes("[") && !formSource.includes("<") && /\S/.test(formSource);

        const formIdFromShortcode =
            formSource.match(/\[contact-form-7[^\]]*\bid=(?:\"([^\"]+)\"|'([^']+)'|([^\s\]]+))/i) || null;
        const formIdFromHtml = formSource.match(/<input[^>]*name=["']_wpcf7["'][^>]*value=["']([^"']+)["'][^>]*>/i);
        const submitMatch = formSource.match(/\[submit\s+\"([^\"]+)\"\]/i);

        const fields: ParsedField[] = [];

        const inputRegex = /\[(text|email|tel|number|url|date)(\*?)\s+([^\s\]]+)([^\]]*)\]/gi;
        let inputMatch: RegExpExecArray | null = inputRegex.exec(formSource);
        while (inputMatch) {
            const placeholderMatch = inputMatch[4]?.match(/\"([^\"]*)\"/);
            fields.push({
                kind: "input",
                type: inputMatch[1].toLowerCase() as InputKind,
                name: inputMatch[3],
                placeholder: placeholderMatch?.[1] || "",
                required: inputMatch[2] === "*",
            });
            inputMatch = inputRegex.exec(formSource);
        }

        const acceptanceRegex = /\[acceptance(\*?)\s+([^\]\s]+)[^\]]*\]([\s\S]*?)\[\/acceptance\]/gi;
        let acceptanceMatch: RegExpExecArray | null = acceptanceRegex.exec(formSource);
        while (acceptanceMatch) {
            fields.push({
                kind: "acceptance",
                name: acceptanceMatch[2],
                label: (acceptanceMatch[3] || "Concordo com a política de privacidade").trim(),
                required: acceptanceMatch[1] === "*",
            });
            acceptanceMatch = acceptanceRegex.exec(formSource);
        }

        const checkboxRegex = /\[checkbox(\*?)\s+([^\]\s]+)([^\]]*)\]/gi;
        let checkboxMatch: RegExpExecArray | null = checkboxRegex.exec(formSource);
        while (checkboxMatch) {
            const options = Array.from(checkboxMatch[3].matchAll(/"([^"]+)"|'([^']+)'/g))
                .map((optionMatch) => optionMatch[1] || optionMatch[2])
                .filter(Boolean);

            if (options.length > 0) {
                fields.push({
                    kind: "checkbox",
                    name: checkboxMatch[2],
                    label: "Qual o assunto de interesse?",
                    options,
                    required: checkboxMatch[1] === "*",
                });
            }

            checkboxMatch = checkboxRegex.exec(formSource);
        }

        // Fallback: quando o backend já devolve HTML renderizado do CF7 em vez de shortcode
        if (fields.length === 0 && formSource.includes("<input")) {
            const htmlInputRegex = /<input[^>]*>/gi;
            let htmlInputMatch: RegExpExecArray | null = htmlInputRegex.exec(formSource);

            while (htmlInputMatch) {
                const tag = htmlInputMatch[0];
                const type = (tag.match(/type=["']([^"']+)["']/i)?.[1] || "text").toLowerCase();
                const name = tag.match(/name=["']([^"']+)["']/i)?.[1] || "";
                const placeholder = tag.match(/placeholder=["']([^"']*)["']/i)?.[1] || "";
                const required = /required/i.test(tag);

                if (
                    name &&
                    ["text", "email", "tel", "number", "url", "date"].includes(type)
                ) {
                    fields.push({
                        kind: "input",
                        type: type as InputKind,
                        name,
                        placeholder,
                        required,
                    });
                }

                htmlInputMatch = htmlInputRegex.exec(formSource);
            }

            const htmlCheckboxRegex = /<input[^>]*type=["']checkbox["'][^>]*>/gi;
            let htmlCheckboxMatch: RegExpExecArray | null = htmlCheckboxRegex.exec(formSource);
            const checkboxGroups: Record<string, { options: Set<string>; required: boolean }> = {};

            while (htmlCheckboxMatch) {
                const tag = htmlCheckboxMatch[0];
                const rawName = tag.match(/name=["']([^"']+)["']/i)?.[1] || "";
                const name = rawName.replace(/\[\]$/, "");
                const optionValue = (tag.match(/value=["']([^"']*)["']/i)?.[1] || "").trim();

                if (name && !/acceptance/i.test(name) && optionValue && optionValue !== "1") {
                    if (!checkboxGroups[name]) {
                        checkboxGroups[name] = {
                            options: new Set<string>(),
                            required: /required/i.test(tag),
                        };
                    }

                    checkboxGroups[name].options.add(optionValue);
                    checkboxGroups[name].required = checkboxGroups[name].required || /required/i.test(tag);
                }

                htmlCheckboxMatch = htmlCheckboxRegex.exec(formSource);
            }

            Object.entries(checkboxGroups).forEach(([name, group]) => {
                const options = Array.from(group.options);
                if (options.length > 0) {
                    fields.push({
                        kind: "checkbox",
                        name,
                        label: "Qual o assunto de interesse?",
                        options,
                        required: group.required,
                    });
                }
            });

            const acceptanceLabelMatch = formSource.match(/<span class=["']wpcf7-list-item-label["']>([\s\S]*?)<\/span>/i);
            const acceptanceInputMatch = formSource.match(/<input[^>]*type=["']checkbox["'][^>]*name=["']([^"']*acceptance[^"']*)["'][^>]*>/i);
            if (acceptanceInputMatch) {
                fields.push({
                    kind: "acceptance",
                    name: acceptanceInputMatch[1],
                    label: (acceptanceLabelMatch?.[1] || "Concordo com a Política de Privacidade").trim(),
                    required: /required/i.test(acceptanceInputMatch[0]),
                });
            }
        }

        const submitLabelFromHtml = formSource.match(/<input[^>]*type=["']submit["'][^>]*value=["']([^"']+)["'][^>]*>/i)?.[1];

        if (!fields.some((field) => field.kind === "input")) {
            fields.unshift({
                kind: "input",
                type: "email",
                name: "your-email",
                placeholder: "Seu melhor e-mail",
                required: true,                
            });
        }

        if (!fields.some((field) => field.kind === "acceptance")) {
            fields.push({
                kind: "acceptance",
                name: "acceptance-privacy",                
                label: `Concordo com a Política de Privacidade`,
                required: true,
            });
        }

        // Fallback para ambientes onde GET /contact-forms/{id} retorna 403.
        // Mantemos o campo visível no frontend e o envio segue via endpoint feedback (POST).
        if (!fields.some((field) => field.kind === "checkbox")) {
            fields.push(DEFAULT_INTEREST_FIELD);
        }

        return {
            formId:
                isPlainId
                                        ? formSource.trim()
                    : formIdFromShortcode?.[1] ||
                      formIdFromShortcode?.[2] ||
                      formIdFromShortcode?.[3] ||
                                            formIdFromHtml?.[1] ||
                                            formId ||
                                            "",
            submitLabel: submitMatch?.[1] || submitLabelFromHtml || "Inscreva-se",
            fields,
        };
        }, [form, formId, resolvedFormMarkup]);

    useEffect(() => {
        const initialValues: FormValues = {};

        parsedForm.fields.forEach((field) => {
            if (field.kind === "input") {
                initialValues[field.name] = "";
            }

            if (field.kind === "acceptance") {
                initialValues[field.name] = false;
            }

            if (field.kind === "checkbox") {
                initialValues[field.name] = [];
            }
        });

        setValues(initialValues);
        setStatus("idle");
    }, [parsedForm]);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked, type } = event.target;

        if (type === "checkbox") {
            const checkboxField = parsedForm.fields.find(
                (field) => field.kind === "checkbox" && field.name === name,
            );

            if (checkboxField) {
                setValues((prev) => {
                    const current = Array.isArray(prev[name]) ? prev[name] : [];
                    const next = checked
                        ? Array.from(new Set([...current, value]))
                        : current.filter((item) => item !== value);

                    return {
                        ...prev,
                        [name]: next,
                    };
                });
                return;
            }
        }

        setValues((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!parsedForm.formId) {
            setStatus("error");
            return;
        }

        const hasInvalidRequiredField = parsedForm.fields.some((field) => {
            if (!field.required) return false;

            if (field.kind === "input") {
                return !String(values[field.name] || "").trim();
            }

            if (field.kind === "checkbox") {
                const selectedValues: string[] = Array.isArray(values[field.name])
                    ? (values[field.name] as string[])
                    : [];
                return selectedValues.length === 0;
            }

            return Boolean(values[field.name]) !== true;
        });

        if (hasInvalidRequiredField) {
            setStatus("error");
            return;
        }

        setLoading(true);
        setStatus("idle");

        try {
            const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "";
            const baseUrl = wpUrl.replace(/\/wp-json\/?$/, "");
            const endpoint = `${baseUrl}/wp-json/contact-form-7/v1/contact-forms/${parsedForm.formId}/feedback`;

            const body = new FormData();
            body.append("_wpcf7", parsedForm.formId);
            body.append("_wpcf7_unit_tag", `wpcf7-f${parsedForm.formId}-o1`);

            parsedForm.fields.forEach((field) => {
                if (field.kind === "input") {
                    body.append(field.name, String(values[field.name] || ""));
                }

                if (field.kind === "acceptance" && values[field.name]) {
                    body.append(field.name, "1");
                }

                if (field.kind === "checkbox") {
                    const selectedValues: string[] = Array.isArray(values[field.name])
                        ? (values[field.name] as string[])
                        : [];
                    selectedValues.forEach((selectedValue) => {
                        body.append(field.name, selectedValue);
                    });
                }
            });

            const response = await fetch(endpoint, {
                method: "POST",
                body,
            });
            const result = await response.json();

            if (response.ok && result?.status === "mail_sent") {
                setStatus("success");
                const resetValues: FormValues = {};
                parsedForm.fields.forEach((field) => {
                    if (field.kind === "acceptance") {
                        resetValues[field.name] = false;
                        return;
                    }

                    if (field.kind === "checkbox") {
                        resetValues[field.name] = [];
                        return;
                    }

                    resetValues[field.name] = "";
                });
                setValues(resetValues);
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="newsletter py-10 lg:py-14">
            <div className="container">
                <div className="relative overflow-hidden rounded-xl h-[336px] md:h-[20rem] lg:h-[13.125rem] px-4 pb-10 pt-[2.1875rem] md:px-[2.4375rem] md:py-[61px]">
                    {bg_image?.url && (
                        <Image
                            src={bg_image.url}
                            alt={bg_image.alt || "Newsletter"}
                            fill
                            className="object-cover"
                            sizes="100vw"
                        />
                    )}

                    <div className="absolute inset-0 bg-dark-blue/30" />

                    <div className="relative z-10 w-full max-w-[48rem] mx-auto flex flex-col lg:flex-row items-center gap-6 md:gap-y-10 lg:gap-x-[5rem] 3xl:gap-x-[6.25rem] lg:max-w-none">
                        {desc && (
                            <div
                                className="prose prose-invert prose-headings:text-white prose-headings:font-semibold prose-headings:text-2xl md:prose-headings:text-[1.75rem] prose-headings:mb-0 prose-p:text-white prose-p:text-base xxl:min-w-[26.375rem]"
                                dangerouslySetInnerHTML={{ __html: desc }}
                            />
                        )}

                        {form && (
                            <div className="w-full lg:w-auto lg:ml-auto newsletter-form text-left lg:min-w-[31.875rem] 3xl:min-w-[41.25rem]">
                                <form className="wpcf7-form gap-y-2 md:flex-col md:items-stretch" onSubmit={handleSubmit}>
                                    <div className="order-1 w-full flex flex-col gap-y-2 md:flex-row md:items-center md:gap-3">
                                        {parsedForm.fields
                                            .filter((field) => field.kind === "input")
                                            .map((field) => (
                                                <input
                                                    key={field.name}
                                                    type={field.type}
                                                    name={field.name}
                                                    value={String(values[field.name] || "")}
                                                    onChange={handleInputChange}
                                                    placeholder={field.placeholder}
                                                    required={field.required}
                                                />
                                            ))}

                                        <input
                                            type="submit"
                                            value={loading ? "Enviando..." : parsedForm.submitLabel}
                                            disabled={loading}
                                            className="hidden md:block"
                                        />
                                    </div>

                                    {parsedForm.fields
                                        .filter((field) => field.kind === "checkbox")
                                        .map((field) => (
                                            <fieldset key={field.name} className="order-2 w-full text-white [font-family:Inter,sans-serif] flex flex-col md:flex-row md:items-center gap-y-2 md:gap-y-0 md:gap-x-4">
                                                <legend className="text-xs mb-2 md:mb-0 md:shrink-0 md:whitespace-nowrap">{field.label}</legend>
                                                <div className="flex flex-col flex-row md:flex-nowrap md:items-center gap-x-2 gap-y-2 md:gap-y-0 md:gap-x-4">
                                                    {field.options.map((option) => {
                                                        const selectedValues: string[] = Array.isArray(values[field.name])
                                                            ? (values[field.name] as string[])
                                                            : [];

                                                        return (
                                                            <label key={option} className="flex w-full md:w-auto items-center gap-2 text-xs whitespace-nowrap">
                                                                <input
                                                                    type="checkbox"
                                                                    name={field.name}
                                                                    value={option}
                                                                    checked={selectedValues.includes(option)}
                                                                    onChange={handleInputChange}
                                                                    required={field.required && selectedValues.length === 0}
                                                                />
                                                                <span>{option}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </fieldset>
                                        ))}

                                    <input
                                        type="submit"
                                        value={loading ? "Enviando..." : parsedForm.submitLabel}
                                        disabled={loading}
                                        className="order-3 md:hidden"
                                    />

                                    {parsedForm.fields
                                        .filter((field) => field.kind === "acceptance")
                                        .map((field) => (
                                            <span key={field.name} className="order-4 md:order-3 wpcf7-acceptance">
                                                <span className="wpcf7-list-item">
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            name={field.name}
                                                            checked={Boolean(values[field.name])}
                                                            onChange={handleInputChange}
                                                            required={field.required}
                                                        />
                                                        <span>
                                                            Concordo com a &nbsp;
                                                            <a
                                                                href="/politica-de-privacidade"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="underline"
                                                            >
                                                                Política de Privacidade
                                                            </a>
                                                        </span>
                                                    </label>
                                                </span>
                                            </span>
                                        ))}
                                </form>

                                {status === "success" && (
                                    <p className="mt-2 text-xs text-white">Inscrição realizada com sucesso.</p>
                                )}
                                {status === "error" && (
                                    <p className="mt-2 text-xs text-red">Não foi possível enviar. Verifique os campos.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}