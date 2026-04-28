"use client";

import React, { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import Image from "next/image";
import ModelList from "../FindOil/ModelList";

interface VehiclePlateCheckProps {
  setRecommendation: (data: any) => void;
  setSelectedModelData: (model: any) => void;
  setStep: React.Dispatch<React.SetStateAction<any>>;
  setDataSource: React.Dispatch<React.SetStateAction<any>>;
  className?: string;
  accessToken: string;
}

export default function VehiclePlateCheck({
  setRecommendation,
  setSelectedModelData,
  setStep,
  accessToken,
  setDataSource,
  className = "",
}: VehiclePlateCheckProps) {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [xlabToken, setXlabToken] = useState<string | null>(null);
  const [pendingTicket, setPendingTicket] = useState<string | null>(null);

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue || inputValue.trim().length < 3) {
      setError("Por favor, digite uma placa ou modelo válido.");
      return;
    }
    setError(null);
    setShowCaptcha(true);
  };

  const onCaptchaChange = async (captchaToken: string | null) => {
    if (!captchaToken) return;

    setLoading(true);
    setError(null);

    try {
      // A. Login continua igual...
      const loginRes = await fetch("/api/xlab", {
        method: "POST",
        body: JSON.stringify({
          path: "/auth/login",
          method: "POST",
          body: {},
        }),
      });
      const loginData = await loginRes.json();
      if (!loginData.token) throw new Error("Sem Token");
      setXlabToken(loginData.token);

      const rawInput = inputValue.trim().toUpperCase();
      const isPlate = rawInput.replace("-", "").length >= 7;
      const endpoint = isPlate ? `/plate/${rawInput}` : `/models?q=${rawInput}`;

      const res = await fetch("/api/xlab", {
        method: "POST",
        body: JSON.stringify({
          path: endpoint,
          token: loginData.token,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success && result.data?.length > 0) {
        setResults(result.data);
        setPendingTicket(result.ticket);
        setShowCaptcha(false);
      } else {
        setError(
          "Veículo não encontrado. Tente com/sem hífen ou pelo nome do modelo.",
        );
        recaptchaRef.current?.reset();
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSelection = async (model: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/xlab", {
        method: "POST",
        body: JSON.stringify({
          path: `/recommendation/${model.Id}`,
          method: "GET",
          token: xlabToken,
          ticket: pendingTicket,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        const normalizedData = {
          ...result,
          Components: result.data,
          AvailableComponentTypes:
            result.data?.map((c: any) => c.ComponentType) || [],
        };

        setSelectedModelData(model);
        setRecommendation(normalizedData); 
        setDataSource("xlab");
        setStep("results");
      } else {
        setError("Não encontramos produtos recomendados.");
      }
    } catch (err) {
      setError("Erro ao carregar recomendações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${className}`}>
      {results.length === 0 && (
        <>
          <form onSubmit={handleSubmit}>
            <div className="pb-4 p-4 lg:px-6">
              <label className="block text-base lg:text-lg text-low-dark-blue mb-2">
                Placa do veículo
              </label>
              <div className="relative">
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <Image
                    src="/icons/brasil.svg"
                    width={24}
                    height={16}
                    alt="Brasil"
                  />
                </div>
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={loading}
                  placeholder="XXX9X99"
                  className={`w-full uppercase rounded-sm border h-10 pl-10 transition-colors max-w-[28rem] ${error ? "border-red-500 bg-red-50" : "border-gray"}`}
                />
              </div>
              {error && (
                <p className="text-red-600 text-xs mt-2 font-bold italic">
                  {error}
                </p>
              )}
            </div>

            {/* O Captcha fora do fluxo de botões evita o Timeout de Renderização */}
            {showCaptcha && (
              <div className="px-4 lg:px-6 mb-4 animate-in fade-in">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                  onChange={onCaptchaChange}
                  hl="pt-BR"
                />
              </div>
            )}

            <div className="flex flex-col lg:flex-row justify-between mt-4 pt-4 pb-4 border-t border-neutral px-4 lg:px-6 gap-y-4">
              <p className="flex items-center gap-x-2 text-xs text-[#6D7280]">
                <Image
                  alt="Alerta"
                  width={16}
                  height={16}
                  src="/icons/alert.svg"
                />
                Consulte sempre o manual do veículo.
              </p>

              <button
                type="submit"
                disabled={loading || showCaptcha || !inputValue.trim()}
                className="flex flex-row items-center justify-center rounded-sm py-2 px-6 h-10 bg-red text-white w-full lg:w-[22.25rem] disabled:opacity-30"
              >
                {loading ? "Processando..." : "Ver resultados"}
                <Image
                  src="/icons/arrow-right-white.svg"
                  width={5}
                  height={10}
                  alt="Ver"
                  className="ml-2"
                />
              </button>
            </div>
          </form>
        </>
      )}

      {results.length > 0 && (
        <ModelList
          models={results}
          onSelect={handleFinalSelection}
          onReset={() => {
            setResults([]);
            setShowCaptcha(false);
            setInputValue("");
          }}
          loading={loading}
        />
      )}
    </div>
  );
}
