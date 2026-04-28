"use client";

import React, { useState, useCallback, ChangeEvent } from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Currency = "R$" | "$" | "€" | "£";
export type OilUnit = "litros" | "galões" | "lbs" | "kGs";
export type GreaseUnit = "kg" | "lb";

export interface CalculatorInputField {
  id: string;
  label: string;
  placeholder?: string;
  decimals?: number;
  integer?: boolean;
  suffix?: string;
  info?: string;
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatCurrency(
  value: number,
  currency: Currency = "R$",
): string {
  if (isNaN(value) || !isFinite(value)) return `${currency} 0,00`;
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  let formatted: string;
  if (currency === "R$") {
    formatted = absValue.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    formatted = absValue.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  if (isNegative) {
    return `(${currency} ${formatted})`;
  }
  return `${currency} ${formatted}`;
}

export function formatNumber(value: number, locale: string = "pt-BR"): string {
  if (isNaN(value) || !isFinite(value)) return "0";
  return Math.round(value).toLocaleString(locale);
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateRange(
  value: number,
  min: number,
  max: number,
): boolean {
  return value >= min && value <= max;
}

export function sanitizeNumericInput(
  value: string,
  allowDecimals: boolean = true,
  maxDecimals: number = 2,
): string {
  let sanitized = value.replace(/[^0-9.]/g, "");

  if (!allowDecimals) {
    sanitized = sanitized.replace(/\./g, "");
    return sanitized;
  }

  const parts = sanitized.split(".");
  if (parts.length > 2) {
    sanitized = parts[0] + "." + parts.slice(1).join("");
  }

  if (parts.length === 2 && parts[1].length > maxDecimals) {
    sanitized = parts[0] + "." + parts[1].slice(0, maxDecimals);
  }

  return sanitized;
}

// ─── Hook: useCalculatorState ─────────────────────────────────────────────────

export function useCalculatorState(initialValues: Record<string, string>) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [currency, setCurrency] = useState<Currency>("R$");
  const [unit, setUnit] = useState<string>("litros");

  const setValue = useCallback((id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const getNumericValue = useCallback(
    (id: string): number => {
      const raw = values[id] || "";
      const parsed = parseFloat(raw);
      return isNaN(parsed) ? 0 : parsed;
    },
    [values],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  const changeCurrency = useCallback(
    (newCurrency: Currency) => {
      setCurrency(newCurrency);
      setValues(initialValues);
    },
    [initialValues],
  );

  const changeUnit = useCallback(
    (newUnit: string) => {
      setUnit(newUnit);
      setValues(initialValues);
    },
    [initialValues],
  );

  return {
    values,
    currency,
    unit,
    setValue,
    getNumericValue,
    reset,
    changeCurrency,
    changeUnit,
    setCurrency,
    setUnit,
  };
}

// ─── Icons (matching Figma design) ─────────────────────────────────────────────

// Settings/Gear icon - for "Dados do equipamento e uso"
function SettingsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.1833 1.66675H9.81667C9.37464 1.66675 8.95072 1.84234 8.63816 2.1549C8.3256 2.46746 8.15 2.89139 8.15 3.33341V3.48341C8.1497 3.77569 8.07255 4.06274 7.92628 4.31578C7.78002 4.56882 7.56978 4.77895 7.31667 4.92508L6.95834 5.13341C6.70497 5.2797 6.41756 5.35671 6.125 5.35671C5.83244 5.35671 5.54503 5.2797 5.29167 5.13341L5.16667 5.06675C4.78422 4.84613 4.32987 4.78628 3.90334 4.90034C3.47681 5.01439 3.11296 5.29303 2.89167 5.67508L2.70833 5.99175C2.48772 6.37419 2.42787 6.82855 2.54192 7.25508C2.65598 7.68161 2.93461 8.04546 3.31667 8.26675L3.44167 8.35008C3.69356 8.49551 3.90302 8.70432 4.04921 8.95577C4.1954 9.20723 4.27325 9.49256 4.275 9.78341V10.2084C4.27617 10.5021 4.19971 10.7909 4.05337 11.0455C3.90703 11.3001 3.69601 11.5116 3.44167 11.6584L3.31667 11.7334C2.93461 11.9547 2.65598 12.3186 2.54192 12.7451C2.42787 13.1716 2.48772 13.626 2.70833 14.0084L2.89167 14.3251C3.11296 14.7071 3.47681 14.9858 3.90334 15.0998C4.32987 15.2139 4.78422 15.154 5.16667 14.9334L5.29167 14.8667C5.54503 14.7205 5.83244 14.6435 6.125 14.6435C6.41756 14.6435 6.70497 14.7205 6.95834 14.8667L7.31667 15.0751C7.56978 15.2212 7.78002 15.4313 7.92628 15.6844C8.07255 15.9374 8.1497 16.2245 8.15 16.5167V16.6667C8.15 17.1088 8.3256 17.5327 8.63816 17.8453C8.95072 18.1578 9.37464 18.3334 9.81667 18.3334H10.1833C10.6254 18.3334 11.0493 18.1578 11.3618 17.8453C11.6744 17.5327 11.85 17.1088 11.85 16.6667V16.5167C11.8503 16.2245 11.9275 15.9374 12.0737 15.6844C12.22 15.4313 12.4302 15.2212 12.6833 15.0751L13.0417 14.8667C13.295 14.7205 13.5824 14.6435 13.875 14.6435C14.1676 14.6435 14.455 14.7205 14.7083 14.8667L14.8333 14.9334C15.2158 15.154 15.6701 15.2139 16.0967 15.0998C16.5232 14.9858 16.887 14.7071 17.1083 14.3251L17.2917 14.0001C17.5123 13.6176 17.5721 13.1633 17.4581 12.7367C17.344 12.3102 17.0654 11.9464 16.6833 11.7251L16.5583 11.6584C16.304 11.5116 16.093 11.3001 15.9466 11.0455C15.8003 10.7909 15.7238 10.5021 15.725 10.2084V9.79175C15.7238 9.49806 15.8003 9.20929 15.9466 8.95466C16.093 8.70003 16.304 8.48859 16.5583 8.34175L16.6833 8.26675C17.0654 8.04546 17.344 7.68161 17.4581 7.25508C17.5721 6.82855 17.5123 6.37419 17.2917 5.99175L17.1083 5.67508C16.887 5.29303 16.5232 5.01439 16.0967 4.90034C15.6701 4.78628 15.2158 4.84613 14.8333 5.06675L14.7083 5.13341C14.455 5.2797 14.1676 5.35671 13.875 5.35671C13.5824 5.35671 13.295 5.2797 13.0417 5.13341L12.6833 4.92508C12.4302 4.77895 12.22 4.56882 12.0737 4.31578C11.9275 4.06274 11.8503 3.77569 11.85 3.48341V3.33341C11.85 2.89139 11.6744 2.46746 11.3618 2.1549C11.0493 1.84234 10.6254 1.66675 10.1833 1.66675Z"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Droplet icon - for "Custos com lubrificante" and "Custo inicial de lavagem"
function DropletIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.99984 18.3333C11.5469 18.3333 13.0307 17.7188 14.1246 16.6248C15.2186 15.5308 15.8332 14.0471 15.8332 12.5C15.8332 10.8333 14.9998 9.25 13.3332 7.91667C11.6665 6.58333 10.4165 4.58333 9.99984 2.5C9.58317 4.58333 8.33317 6.58333 6.6665 7.91667C4.99984 9.25 4.1665 10.8333 4.1665 12.5C4.1665 14.0471 4.78109 15.5308 5.87505 16.6248C6.96901 17.7188 8.45274 18.3333 9.99984 18.3333Z"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Wrench icon - for "Custos de manutenção"
function WrenchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.25 5.25C12.25 5.25 13 3 15.5 3C18 3 18.5 5 18.5 6.5C18.5 8 17.5 9.5 15.5 9.5C14.5 9.5 13.5 9 13 8.5L5.5 16C5.5 16 4.5 17 3.5 16C2.5 15 3.5 14 3.5 14L11 6.5C10.5 6 10 5 10 4C10 2 11.5 0.5 13.5 0.5C15 0.5 16 1.5 16 1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Zap/Lightning icon - for "Consumo energético"
function ZapIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.8333 1.66666L2.5 11.6667H10L9.16667 18.3333L17.5 8.33332H10L10.8333 1.66666Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// BarChart3 icon - for "Parâmetros da simulação"
function BarChartIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 3V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 17V9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 17V5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 17V14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Fuel icon - for gas-related sections
function FuelIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 18.3333V3.33332C2.5 2.89129 2.67559 2.46737 2.98816 2.15481C3.30072 1.84225 3.72464 1.66666 4.16667 1.66666H10.8333C11.2754 1.66666 11.6993 1.84225 12.0118 2.15481C12.3244 2.46737 12.5 2.89129 12.5 3.33332V18.3333H2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 8.33334H14.1667C14.6087 8.33334 15.0326 8.50894 15.3452 8.8215C15.6577 9.13406 15.8333 9.55798 15.8333 10V13.3333C15.8333 13.7754 16.0089 14.1993 16.3215 14.5118C16.634 14.8244 17.058 15 17.5 15C17.942 15 18.366 14.8244 18.6785 14.5118C18.9911 14.1993 19.1667 13.7754 19.1667 13.3333V7.35834C19.1667 7.13741 19.1232 6.91859 19.039 6.71461C18.9547 6.51063 18.8314 6.32553 18.6758 6.17L15 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 10H10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5 6.66666H10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Clock icon - for "Custos de manutenção"
function ClockIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.99984 18.3334C14.6022 18.3334 18.3332 14.6025 18.3332 10.0001C18.3332 5.39771 14.6022 1.66675 9.99984 1.66675C5.39746 1.66675 1.6665 5.39771 1.6665 10.0001C1.6665 14.6025 5.39746 18.3334 9.99984 18.3334Z"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 5V10L13.3333 11.6667"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export const SECTION_ICONS: Record<string, React.FC> = {
  settings: SettingsIcon,
  droplet: DropletIcon,
  wrench: WrenchIcon,
  zap: ZapIcon,
  barChart: BarChartIcon,
  fuel: FuelIcon,
  clock: ClockIcon,
};

// ─── Components ───────────────────────────────────────────────────────────────

// Currency Selector
interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
}

export function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  const options: Currency[] = ["R$", "$", "€", "£"];
  return (
    <div className="flex flex-col gap-2">
      <span className="text-base text-[#002959] leading-[1.5]">Moeda</span>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`h-[44px] min-w-[70px] px-4 rounded-lg border text-sm transition-all ${
              value === opt
                ? "bg-neutral-2 border-[1.5px] border-dark-blue shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] font-semibold text-dark-blue"
                : "bg-white border-gray text-[#5a5a5a] hover:border-dark-blue"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// Unit Selector
interface UnitSelectorProps {
  value: string;
  options: string[];
  onChange: (unit: string) => void;
  label?: string;
}

export function UnitSelector({
  value,
  options,
  onChange,
  label = "Unidade",
}: UnitSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-base text-[#002959] leading-[1.5]">{label}</span>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`h-[44px] px-4 rounded-lg border text-sm transition-all ${
              value === opt
                ? "bg-neutral-2 border-[1.5px] border-dark-blue shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] font-semibold text-dark-blue"
                : "bg-white border-gray text-[#5a5a5a] hover:border-dark-blue"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// OBS Note (currency/unit change warning)
export function ObsNote() {
  return (
    <p className="text-xs text-medium-gray mt-3">
      OBS: A atualização da moeda ou alguma unidade de medida pode apagar todos
      os valores inseridos anteriormente.
    </p>
  );
}

// Calculator Input
interface CalculatorInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (id: string, value: string) => void;
  placeholder?: string;
  integer?: boolean;
  decimals?: number;
  suffix?: string;
  info?: string;
  disabled?: boolean;
  error?: string;
}

export function CalculatorInput({
  id,
  label,
  value,
  onChange,
  placeholder = "Ex: 75",
  integer = false,
  decimals = 2,
  suffix,
  info,
  disabled = false,
  error,
}: CalculatorInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const sanitized = sanitizeNumericInput(e.target.value, !integer, decimals);
    onChange(id, sanitized);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        <label
          htmlFor={`calc-${id}`}
          className="text-base text-[#002959] leading-[1.5]"
        >
          {label}
        </label>
        {info && (
          <div className="group relative">
            <button
              type="button"
              className="w-[18px] h-[18px] rounded-full bg-[#e8ecf2] text-[#002959] text-[10px] font-semibold flex items-center justify-center"
            >
              ?
            </button>
            <div className="hidden group-hover:block absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-3 bg-dark-blue text-white text-xs rounded-lg shadow-lg">
              {info}
            </div>
          </div>
        )}
      </div>
      <div className="relative">
        <input
          id={`calc-${id}`}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-[44px] rounded px-3 text-sm text-dark-blue outline-none transition-all ${
            error
              ? "border-[1.5px] border-red"
              : isFocused
                ? "border-[1.5px] border-blue bg-neutral-2"
                : "border border-gray"
          } ${disabled ? "bg-neutral-2 cursor-not-allowed text-medium-gray" : "bg-white"} ${suffix ? "pr-16" : ""} placeholder:text-[#9ca3af]`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#6d7280] pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <span className="text-xs text-red">{error}</span>}
    </div>
  );
}

// Multiplier Buttons
interface MultiplierButtonsProps {
  options: number[];
  selected: number;
  onChange: (factor: number) => void;
  label?: string;
  labels?: Record<number, string>;
}

export function MultiplierButtons({
  options,
  selected,
  onChange,
  label = "Multiplicador Mobil SHC",
  labels,
}: MultiplierButtonsProps) {
  const getButtonLabel = (factor: number, idx: number) => {
    if (labels && labels[factor]) return labels[factor];
    if (idx === 0) return `${factor}x (mínimo)`;
    if (idx === options.length - 1) return `${factor}x (máximo)`;
    return `${factor}x`;
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-base text-[#002959] leading-[1.5]">{label}</span>
      <div className="flex gap-2">
        {options.map((factor, idx) => (
          <button
            key={factor}
            type="button"
            onClick={() => onChange(factor)}
            className={`flex-1 h-[44px] rounded-lg border text-sm font-medium transition-all ${
              selected === factor
                ? "bg-red text-white border-red"
                : "bg-white text-dark-blue border-gray hover:border-red"
            }`}
          >
            {getButtonLabel(factor, idx)}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Calculator Detail Hero ──────────────────────────────────────────────────

interface CalculatorDetailHeroProps {
  title?: string;
  description?: string;
  image?: { url: string; alt?: string };
  image_mobile?: { url: string; alt?: string };
}

export function CalculatorDetailHero({
  title,
  description,
  image,
  image_mobile,
}: CalculatorDetailHeroProps) {
  if (!title && !description) return null;

  return (
    <section className="relative overflow-hidden min-h-[280px] md:min-h-[300px] lg:min-h-0">
      {/* Background Image */}
      {image && (
        <Image
          src={image.url ?? null}
          alt={image.alt ?? null}
          fill
          sizes="100vw"
          quality={88}
          className="object-cover object-[center_35%] hidden md:block"
          priority
        />
      )}
      {(image_mobile || image) && (
        <Image
          src={(image_mobile?.url || image?.url) ?? null}
          alt={(image_mobile?.alt || image?.alt) ?? null}
          fill
          sizes="100vw"
          quality={88}
          className="object-cover object-[center_30%] md:hidden"
          priority
        />
      )}

      {/* Lighter dual-stop overlay (readable text without crushing photo / Figma parity) */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(0,20,80,0.72) 0%, rgba(0,20,80,0.38) 52%, rgba(0,20,80,0) 100%), linear-gradient(180deg, rgba(0,13,43,0.12) 0%, rgba(0,13,43,0.28) 100%)",
        }}
      />

      {/* Fallback dark background when no image */}
      {!image && <div className="absolute inset-0 bg-dark-blue" />}

      {/* Content */}
      <div className="relative z-10 py-12 md:py-14 lg:py-[60px]">
        <div className="container">
          <div className="max-w-[614px] flex flex-col gap-3 md:gap-4 antialiased [text-rendering:optimizeLegibility]">
            {title && (
              <h1
                className="text-white text-[28px] md:text-[36px] lg:text-[40px] leading-tight font-normal prose-strong:text-red prose-strong:font-semibold"
                dangerouslySetInnerHTML={{ __html: title }}
              />
            )}
            {description && (
              <p className="text-white text-base lg:text-lg leading-normal font-normal">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ children, className = "" }: SectionCardProps) {
  return (
    <div
      className={`bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04)] p-5 md:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export function SectionHeader({
  icon,
  title,
  subtitle,
  rightElement,
}: SectionHeaderProps) {
  const IconComponent = SECTION_ICONS[icon];
  return (
    <div className="flex items-center justify-between pb-4 mb-5 border-b border-neutral px-2">
      <div className="flex items-center gap-4 text-dark-blue">
        <div className="shrink-0 w-6 h-6 flex items-center justify-center">
          {IconComponent && <IconComponent />}
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold leading-normal">{title}</h3>
          {subtitle && (
            <p className="text-sm text-[#6d7280] leading-normal">{subtitle}</p>
          )}
        </div>
      </div>
      {rightElement}
    </div>
  );
}

// ─── Result Comparison Cards ──────────────────────────────────────────────────

interface ResultComparisonProps {
  label: string;
  currentLabel?: string;
  proposedLabel?: string;
  currentValue: string;
  proposedValue: string;
  unit?: string;
}

export function ResultComparison({
  label,
  currentLabel = "Seu óleo atual",
  proposedLabel = "Mobil SHC™ sugerido",
  currentValue,
  proposedValue,
  unit,
}: ResultComparisonProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <p className="text-sm text-medium-gray">{label}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-neutral-2 border border-[#e5e7eb] rounded-[14px] px-4 py-3">
          <p className="text-xs text-medium-gray mb-1">{currentLabel}</p>
          <p className="text-base font-semibold text-dark-blue">
            {currentValue}
            {unit && (
              <span className="text-sm font-normal text-medium-gray ml-1">
                {unit}
              </span>
            )}
          </p>
        </div>
        <div className="bg-[#f4fbf9] border border-[rgba(62,181,200,0.2)] rounded-[14px] px-4 py-3">
          <p className="text-xs text-[#006244] mb-1">{proposedLabel}</p>
          <p className="text-base font-semibold text-[#006244]">
            {proposedValue}
            {unit && (
              <span className="text-sm font-normal text-[#006244]/70 ml-1">
                {unit}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Savings Bar ──────────────────────────────────────────────────────────────

interface SavingsBarProps {
  label: string;
  value: string;
}

export function SavingsBar({ label, value }: SavingsBarProps) {
  return (
    <div className="bg-dark-blue rounded-lg h-[63px] px-5 flex items-center justify-between mt-4">
      <span className="text-base text-white font-medium">{label}</span>
      <span className="text-xl text-white font-bold">{value}</span>
    </div>
  );
}

// ─── Result Row (for table-like results) ──────────────────────────────────────

interface ResultRowProps {
  label: string;
  currentValue: string;
  proposedValue: string;
  highlight?: boolean;
}

export function ResultRow({
  label,
  currentValue,
  proposedValue,
  highlight = false,
}: ResultRowProps) {
  return (
    <div
      className={`flex items-center justify-between py-3 ${highlight ? "bg-neutral-2 rounded-lg px-4 -mx-1" : "px-1"}`}
    >
      <span className="text-sm text-dark-blue flex-1">{label}</span>
      <span className="text-sm text-medium-gray w-[140px] text-right">
        {currentValue}
      </span>
      <span className="text-sm font-semibold text-dark-blue w-[140px] text-right">
        {proposedValue}
      </span>
    </div>
  );
}

// ─── Collapsible Section ──────────────────────────────────────────────────────

interface CollapsibleSectionProps {
  icon: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({
  icon,
  title,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const IconComponent = SECTION_ICONS[icon];

  return (
    <SectionCard>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5 text-dark-blue">
          {IconComponent && <IconComponent />}
          <span className="text-lg font-semibold">{title}</span>
        </div>
        <ChevronDownIcon
          className={`text-dark-blue transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="mt-5 pt-5 border-t border-neutral">{children}</div>
      )}
    </SectionCard>
  );
}

// ─── Savings Card (Sidebar) ───────────────────────────────────────────────────

interface SavingsCardProps {
  title: string;
  totalSavings: string;
  description?: string;
  items: { label: string; value: string; isNegative?: boolean }[];
  currency: Currency;
  contactUrl?: string;
  productUrl?: string;
}

export function SavingsCard({
  title,
  totalSavings,
  description,
  items,
  contactUrl = "/contato",
  productUrl = "/mobil-shc",
}: SavingsCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      {/* Total Savings Card */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{
          background:
            "linear-gradient(254.97deg, rgb(19,49,137) 4%, rgb(0,20,80) 33.38%)",
        }}
      >
        <p className="text-xs font-semibold text-[#bedbff] uppercase tracking-wider mb-2">
          {title}
        </p>
        <p className="text-[32px] lg:text-[40px] font-bold leading-tight tracking-[-1px] text-white">
          {totalSavings}
        </p>
        {description && (
          <p className="text-sm text-[#bedbff] mt-2">{description}</p>
        )}
      </div>

      {/* Detailed Comparison */}
      <SectionCard>
        <button
          type="button"
          onClick={() => setIsDetailOpen(!isDetailOpen)}
          className="w-full flex items-center justify-between"
        >
          <span className="text-base font-semibold text-dark-blue">
            Comparativo detalhado
          </span>
          <ChevronDownIcon
            className={`text-dark-blue transition-transform ${isDetailOpen ? "rotate-180" : ""}`}
          />
        </button>
        {isDetailOpen && (
          <div className="mt-4 pt-4 border-t border-neutral flex flex-col gap-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-medium-gray">{item.label}</span>
                <span
                  className={`text-sm font-semibold ${item.isNegative ? "text-red" : "text-dark-blue"}`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Next Steps */}
      <SectionCard>
        <p className="text-base font-semibold text-dark-blue mb-4">
          Próximos passos
        </p>
        <div className="flex flex-col gap-3">
          <a
            href={contactUrl}
            className="flex items-center justify-center h-[48px] bg-red text-white text-sm font-semibold rounded-lg hover:bg-red/90 transition-colors"
          >
            Fale conosco
          </a>
          <a
            href={productUrl}
            className="flex items-center justify-center h-[48px] bg-white text-dark-blue text-sm font-semibold rounded-lg border border-dark-blue hover:bg-neutral-2 transition-colors"
          >
            Conhecer a linha Mobil SHC™
          </a>
        </div>
        <p className="text-[11px] text-medium-gray mt-3 leading-relaxed">
          Os resultados apresentados são estimativas baseadas nos dados
          inseridos e não constituem garantia de economia real.
        </p>
      </SectionCard>
    </div>
  );
}

// ─── Results Table Header ─────────────────────────────────────────────────────

export function ResultsTableHeader() {
  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral mb-1">
      <span className="text-xs font-semibold text-medium-gray flex-1 uppercase tracking-wider">
        Descrição
      </span>
      <span className="text-xs font-semibold text-medium-gray w-[140px] text-right uppercase tracking-wider">
        Atual
      </span>
      <span className="text-xs font-semibold text-medium-gray w-[140px] text-right uppercase tracking-wider">
        Proposto
      </span>
    </div>
  );
}

// ─── Section Title ────────────────────────────────────────────────────────────

interface SectionTitleProps {
  title: string;
  description?: string;
}

export function SectionTitle({ title, description }: SectionTitleProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-dark-blue">{title}</h3>
      {description && (
        <p className="text-sm text-medium-gray mt-1">{description}</p>
      )}
    </div>
  );
}

// ─── Reset Button ─────────────────────────────────────────────────────────────

interface ResetButtonProps {
  onClick: () => void;
}

export function ResetButton({ onClick }: ResetButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-sm text-medium-gray hover:text-dark-blue transition-colors"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      Resetar valores
    </button>
  );
}

// ─── Info Banner ──────────────────────────────────────────────────────────────

interface InfoBannerProps {
  children: React.ReactNode;
}

export function InfoBanner({ children }: InfoBannerProps) {
  return (
    <div className="bg-[rgba(239,246,255,0.5)] border border-[rgba(219,234,254,0.5)] rounded-[10px] px-3.5 py-3 flex items-start gap-2.5">
      <span className="text-blue mt-0.5 shrink-0">
        <InfoIcon />
      </span>
      <p className="text-xs text-[#002959] leading-relaxed">{children}</p>
    </div>
  );
}
