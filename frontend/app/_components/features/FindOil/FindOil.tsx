"use client";

import React, { useState, useEffect, useCallback } from "react";
import VehiclePlateCheck from "../VehiclePlateCheck/VehiclePlateCheck";
import Image from "next/image";
import ModelList, { InforlubeModel } from "./ModelList";
import RecommendationResults, {
  InforlubeRecommendation,
} from "./RecommendationResults";
import ReCAPTCHA from "react-google-recaptcha";
import XlabRecommendationResults from "./XlabRecommendationResults";
import { INFORLUBE_CONFIG } from "@/app/lib/inforlube/config";

interface FindOilProps {
  title?: string;
  desc?: string;
  token?: string;
}

type TabOption = "plate" | "model" | "name";
type VehicleType = "leves" | "motos" | "pesados";
type Step = "form" | "models" | "results";

interface InforlubeMake {
  Id: string;
  Name: string;
}

export default function FindOil({ title, desc, token }: FindOilProps) {
  const INFORLUBE_BASE_URL = INFORLUBE_CONFIG.BASE_URL;

  const devLogError = (...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.error(...args);
    }
  };

  const devLogWarn = (...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(...args);
    }
  };

  const initializeTicket = useCallback(async (jwt: string) => {
    try {
      const res = await fetch(
        `${INFORLUBE_BASE_URL}/Models?SearchText=Toyota&IsPaged=true&PageSize=1`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            Accept: "application/json",
          },
        },
      );

      // Captura o Ticket do header de resposta
      const ticket = res.headers.get("Ticket");

      if (ticket) {
        setApiTicket(ticket);
      }
    } catch (err) {
      devLogError("[DEBUG] Erro na busca do Ticket:", err);
    }
  }, [INFORLUBE_BASE_URL]);

  const [activeTab, setActiveTab] = useState<TabOption>("plate");
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [makesList, setMakesList] = useState<InforlubeMake[]>([]);
  const [modelsList, setModelsList] = useState<InforlubeModel[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [apiTicket, setApiTicket] = useState<string>("");
  const [foundModels, setFoundModels] = useState<InforlubeModel[]>([]);
  const [selectedModelData, setSelectedModelData] = useState<InforlubeModel | null>(null);
  const [recommendation, setRecommendation] = useState<InforlubeRecommendation | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");

  const yearOptions: number[] = [];
  for (let year = 2025; year >= 2000; year--) {
    yearOptions.push(year);
  }

  const vehicleTypeMap: Record<VehicleType, string> = {
    leves: "Car",
    motos: "Motorcycle",
    pesados: "Truck",
  };

  const handleVehicleTypeSelect = (type: VehicleType) => {
    setMakesList([]);
    setModelsList([]);
    setSelectedMake("");
    setSelectedYear("");
    setSelectedModel("");
    setError(null);
    setApiTicket("");
    setSelectedVehicleType(type);
    if (accessToken) {
      initializeTicket(accessToken);
    }
  };

  // LOGIN SERVER-SIDE: hash nunca fica exposto no navegador
  useEffect(() => {
    if (accessToken) return;

    // Mantém compatibilidade caso o token já venha pronto (JWT)
    if (token && token.split(".").length === 3) {
      setAccessToken(token);
      initializeTicket(token);
      return;
    }

    fetch("/api/inforlube/auth", {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Falha na autenticação Inforlube");
        }
        return res.json();
      })
      .then((data) => {
        if (data?.jwt) {
          setAccessToken(data.jwt);
          initializeTicket(data.jwt);
        }
      })
      .catch(() => {
        setError("Não foi possível autenticar no Inforlube no momento.");
      });
  }, [token, accessToken, initializeTicket]);

  // BUSCA DE MONTADORAS (8 PÁGINAS ORIGINAIS)
  useEffect(() => {
    if (selectedVehicleType && accessToken && apiTicket) {
      setLoadingMakes(true);

      const fetchAllPages = async () => {
        const typeApi = vehicleTypeMap[selectedVehicleType];

        const typeIdMap: Record<VehicleType, number> = {
          leves: 1, // Car
          motos: 3, // Motorcycle
          pesados: 4, // Truck
        };

        const targetId = typeIdMap[selectedVehicleType];

        try {
          const pageNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
          const requests = pageNumbers.map((page) =>
            fetch(
              `${INFORLUBE_BASE_URL}/Makes?VehicleType=${typeApi}&PageSize=15&CurrentPage=${page}&IsPaged=true`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  Ticket: apiTicket,
                  Accept: "application/json",
                },
              },
            ).then((res) => (res.ok ? res.json() : { Makes: [] })),
          );

          const results = await Promise.all(requests);
          let combined: any[] = [];

          results.forEach((data) => {
            const list =
              data.Makes || data.Data || (Array.isArray(data) ? data : []);
            combined = [...combined, ...list];
          });

          const filteredMakes = combined.filter((make) => {
            if (!make.VehicleTypes) return true;
            return make.VehicleTypes.some((vt: any) => vt.Id === targetId);
          });

          const unique = Array.from(
            new Map(filteredMakes.map((m) => [m.Id, m])).values(),
          );
          const sorted = unique.sort((a, b) => a.Name.localeCompare(b.Name));

          setMakesList(sorted);
        } catch (err) {
          devLogError("[MAKES] Erro no carregamento/filtragem:", err);
        } finally {
          setLoadingMakes(false);
        }
      };

      fetchAllPages();
    }
  }, [selectedVehicleType, accessToken, apiTicket, INFORLUBE_BASE_URL]);

  useEffect(() => {
    const isMakeValid = makesList.some((m) => m.Id === selectedMake);

    if (
      selectedYear &&
      selectedMake &&
      selectedVehicleType &&
      accessToken &&
      apiTicket &&
      isMakeValid
    ) {
      setLoadingModels(true);
      const typeApi = vehicleTypeMap[selectedVehicleType];

      const url = `${INFORLUBE_BASE_URL}/Models?MakeId=${selectedMake}&Year=${selectedYear}&VehicleType=${typeApi}&IsManualSearch=true&IsPaged=true&PageSize=15`;

      fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Ticket: apiTicket,
          Accept: "application/json",
        },
      })
        .then(async (res) => {
          const newTicket = res.headers.get("Ticket");
          if (newTicket) setApiTicket(newTicket);

          if (res.status === 400 || res.status === 404 || res.status === 422) {
            devLogWarn(
              `[MODELS] API ${res.status} para o ID ${selectedMake}`,
            );
            return { Data: [] };
          }

          if (!res.ok) throw new Error(`Erro API Models (${res.status})`);
          return res.json();
        })
        .then((data) => {
          const list = data.Data || (Array.isArray(data) ? data : []);
          setModelsList(
            [...list].sort((a, b) =>
              (a.DisplayName || "").localeCompare(b.DisplayName || ""),
            ),
          );
        })
        .catch((err) => {
          devLogError("[MODELS] Erro crítico:", err);
          setModelsList([]);
        })
        .finally(() => setLoadingModels(false));
    } else {
      if (modelsList.length > 0 && !isMakeValid) {
        setModelsList([]);
      }
    }
  }, [
    selectedYear,
    selectedMake,
    selectedVehicleType,
    accessToken,
    apiTicket,
    makesList,
    INFORLUBE_BASE_URL,
  ]);

  const handleSearchByName = async () => {
    if (!searchText.trim() || !accessToken) return;

    setLoading(true);
    setError(null);
    setFoundModels([]); 
    setStep("form");

    try {
      const response = await fetch(
        `${INFORLUBE_BASE_URL}/Models?SearchText=${encodeURIComponent(searchText)}&IsPaged=true`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        },
      );

      const result = await response.json();

      const newTicket = response.headers.get("Ticket");
      if (newTicket) setApiTicket(newTicket);

      const models = result.Data || (Array.isArray(result) ? result : []);

      if (models.length > 0) {
        setFoundModels(models);
        setStep("models"); 
      } else {
        setError("Veículo não encontrado. Tente um nome diferente.");
      }
    } catch (err) {
      setError("Erro ao realizar a busca.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("form");
    setFoundModels([]);
    setRecommendation(null);
    setSearchText("");
    setError(null);
    setSelectedVehicleType(null);
    setSelectedYear("");
    setSelectedMake("");
    setSelectedModel("");
    setMakesList([]);
    setModelsList([]);
    setApiTicket("");
    setCaptchaResolved(false);
    if (recaptchaRef.current) recaptchaRef.current.reset();
  };

  const handleModelSearchSubmit = () => {
    const model = modelsList.find((m) => m.Id === selectedModel);
    if (model) handleModelSelect(model);
  };

  const handleModelSelect = async (model: InforlubeModel) => {
    if (!accessToken || !apiTicket) return;

    setLoading(true);
    setError(null);
    setSelectedModelData(model);

    const cleanTicket = apiTicket.trim().replace(/[\n\r]/g, "");

    try {
      const url = `${INFORLUBE_BASE_URL}/Products/Recommendation/Model/${model.Id}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Ticket: cleanTicket,
          Accept: "application/json",
        },
      });

      if (response.status === 404) {
        devLogWarn("[RECOMENDAÇÃO] Nenhum óleo encontrado para este modelo.");

        setRecommendation({
          recommendations: [],
          ...model,
        } as any);

        setStep("results");
        return;
      }

      if (!response.ok) throw new Error(`Erro ${response.status}`);

      const data: InforlubeRecommendation = await response.json();
      setRecommendation(data);
      setStep("results");
    } catch (err: any) {
      setError("Erro ao carregar as recomendações de óleo.");
    } finally {
      setLoading(false);
    }
  };

  const [captchaResolved, setCaptchaResolved] = useState<boolean>(false);
  const recaptchaRef = React.useRef<ReCAPTCHA>(null);

  const onCaptchaChange = (value: string | null) => {
    if (value) {
      setCaptchaResolved(true);
    } else {
      setCaptchaResolved(false);
    }
  };

  const [dataSource, setDataSource] = useState<"inforlube" | "xlab">(
    "inforlube",
  );

  return (
    <section className="find-oil relative">
      <div className="bg-darkness-blue absolute h-[26.625rem] w-full top-0 left-0 -z-10"></div>
      <article className="container pt-20">
        <div className="text-center flex flex-col justify-center items-center gap-y-[0.8125rem] mb-[1.75rem] md:mb-[4.5625rem] lg:mb-12">
          {title && (
            <h1 className="uppercase text-2xl md:text-[2rem] lg:text-[2.5rem] md:max-w-[29.0625rem] lg:max-w-[36.125rem] text-gradient font-bold italic">
              {title}
            </h1>
          )}
          {desc && (
            <p className="text-base md:text-[1.375rem] lg:text-2xl text-white max-w-[21.4375rem] md:max-w-[44.25rem]">
              {desc}
            </p>
          )}
        </div>
      </article>
      {step !== "results" && (
        <article className="tab bg-white rounded-2xl mx-auto overflow-hidden shadow-search-bar mb-10 md:mb-[3.75rem] lg:mb-20">
          {step === "form" && (
            <>
              {/* Navegação Mobile */}
              <div className="md:hidden p-4 bg-neutral-2">
                <label className="block text-gray-medium-2 text-sm mb-2">
                  Tipo de busca
                </label>
                <div className="relative">
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value as TabOption)}
                    className="w-full appearance-none border border-[#D2D5DA] rounded-sm px-3 py-[0.5625rem] text-sm text-low-dark-blue bg-white focus:outline-none focus:border-dark-blue"
                  >
                    <option value="plate">Busca por Placa</option>
                    <option value="model">Busca por Modelo</option>
                    <option value="name">Busca por Nome</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <Image
                      src="/icons/arrow-down-light-gray.svg"
                      alt="Seta"
                      width={12}
                      height={6}
                    />
                  </div>
                </div>
              </div>

              {/* Navegação Desktop */}
              <div className="hidden md:flex flex-row bg-neutral-2">
                <button
                  onClick={() => setActiveTab("plate")}
                  className={`cursor-pointer flex-1 py-5 text-center text-sm md:text-base lg:text-lg transition-all duration-300 md:max-w-[10.8125rem] lg:max-w-[11.625rem] h-[3.5rem] ${
                    activeTab === "plate"
                      ? "text-dark-blue border-b-2 border-dark-blue bg-white"
                      : "text-gray-medium-2 hover:text-dark-blue hover:border-b-2 hover:border-dark-blue"
                  }`}
                >
                  Busca por Placa
                </button>
                <button
                  onClick={() => setActiveTab("model")}
                  className={`cursor-pointer flex-1 py-5 text-center text-sm md:text-base lg:text-lg transition-all duration-300 md:max-w-[11.8125rem] lg:max-w-[12.8125rem] h-[3.5rem] ${
                    activeTab === "model"
                      ? "text-dark-blue border-b-2 border-dark-blue bg-white"
                      : "text-gray-medium-2 hover:text-dark-blue hover:border-b-2 hover:border-dark-blue"
                  }`}
                >
                  Busca por Modelo
                </button>
                <button
                  onClick={() => setActiveTab("name")}
                  className={`cursor-pointer flex-1 py-5 text-center text-sm md:text-base lg:text-lg transition-all duration-300 md:max-w-[11rem] lg:max-w-[11.875rem] h-[3.5rem] ${
                    activeTab === "name"
                      ? "text-dark-blue border-b-2 border-dark-blue bg-white"
                      : "text-gray-medium-2 hover:text-dark-blue hover:border-b-2 hover:border-dark-blue"
                  }`}
                >
                  Busca por Nome
                </button>
              </div>

              {/* Conteúdo das Abas */}
              <div className="mt-4">
                {activeTab === "plate" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <VehiclePlateCheck
                      accessToken={accessToken}
                      setStep={setStep}
                      setRecommendation={setRecommendation}
                      setSelectedModelData={setSelectedModelData}
                      setDataSource={setDataSource}
                    />
                  </div>
                )}

                {activeTab === "model" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 lg:px-6 pb-4 pt-2 md:pt-4">
                    <div className="flex flex-row justify-center px-6 gap-2 pb-2 md:pb-4">
                      <button
                        onClick={() => handleVehicleTypeSelect("leves")}
                        className={`model-button leves px-4 md:px-2 md:py-4 rounded-lg h-[5.0625rem] transition-colors duration-200 cursor-pointer ${
                          selectedVehicleType === "leves"
                            ? "border border-dark-blue text-dark-blue"
                            : "border-2 border-gray text-gray-gray hover:border-dark-blue hover:text-dark-blue"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-y-[9px]">
                          <Image
                            src={
                              selectedVehicleType === "leves"
                                ? "/icons/car-blue.svg"
                                : "/icons/car.svg"
                            }
                            width={16}
                            height={10}
                            alt="Veículos Leves"
                            className="w-[1rem] h-[0.8125rem] md:w-[1.25rem] md:h-[1.25rem]"
                          />
                          <span
                            className={`${selectedVehicleType === "leves" ? "text-dark-blue" : "text-gray-medium-2"} lg:text-lg text-base leading-[1.25rem]`}
                          >
                            Veículos Leves
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleVehicleTypeSelect("motos")}
                        className={`model-button motos p-[0.625rem] p-4 md:px-2 md:py-4 rounded-lg h-[5.0625rem] transition-colors duration-200 cursor-pointer  ${
                          selectedVehicleType === "motos"
                            ? "border border-dark-blue text-dark-blue"
                            : "border-2 border-gray text-gray-gray hover:border-dark-blue hover:text-dark-blue"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-y-[9px]">
                          <Image
                            src={
                              selectedVehicleType === "motos"
                                ? "/icons/motorcycle-blue.svg"
                                : "/icons/motorcycle.svg"
                            }
                            width={16}
                            height={14}
                            alt="Motos"
                            className="w-[1rem] h-[0.8125rem] md:w-[1.25rem] md:h-[1.25rem]"
                          />
                          <span
                            className={`${selectedVehicleType === "motos" ? "text-dark-blue" : "text-gray-medium-2"} lg:text-lg text-base`}
                          >
                            Motos
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleVehicleTypeSelect("pesados")}
                        className={`model-button pesados pt-[5px] p-4 md:px-2 md:py-4 rounded-lg h-[5.0625rem] transition-colors duration-200 cursor-pointer ${
                          selectedVehicleType === "pesados"
                            ? "border border-dark-blue text-dark-blue"
                            : "border-2 border-gray text-gray-gray hover:border-dark-blue hover:text-dark-blue"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-y-[9px]">
                          <Image
                            src={
                              selectedVehicleType === "pesados"
                                ? "/icons/truck-blue.svg"
                                : "/icons/truck.svg"
                            }
                            width={16}
                            height={13}
                            alt="Veículos Pesados"
                            className="w-[1rem] h-[0.8125rem] md:w-[1.25rem] md:h-[1.25rem]"
                          />
                          <span
                            className={`${selectedVehicleType === "pesados" ? "text-dark-blue" : "text-gray-medium-2"} lg:text-lg text-base leading-[1.25rem]`}
                          >
                            Veículos Pesados
                          </span>
                        </div>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-8 lg:grid-cols-12 gap-2 md:gap-4 mt-6 px-4 mb-4 lg:px-0">
                      <div className="md:col-span-4 lg:col-span-4">
                        <div className="relative">
                          <select
                            id="model-year"
                            value={selectedYear}
                            onChange={(e) => {
                              setSelectedYear(e.target.value);
                              setSelectedModel("");
                              setModelsList([]);
                              setCaptchaResolved(false);
                              recaptchaRef.current?.reset();
                            }}
                            disabled={!selectedVehicleType}
                            className={`w-full appearance-none border text-sm md:text-base py-[0.5625rem] px-[0.75rem] rounded-sm md:h-[2.75rem] ${
                              !selectedVehicleType
                                ? "bg-neutral border-gray text-gray-medium-2 cursor-not-allowed"
                                : "bg-white border-gray text-gray-medium-2"
                            }`}
                          >
                            <option value="">Ano</option>
                            {yearOptions.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                            <Image
                              src="/icons/arrow-down-light-gray.svg"
                              alt="Seta"
                              width={12}
                              height={6}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-4 lg:col-span-4">
                        <div className="relative">
                          <select
                            id="model-make"
                            value={selectedMake}
                            onChange={(e) => {
                              setSelectedMake(e.target.value);
                              setSelectedModel("");
                              setModelsList([]);
                              setCaptchaResolved(false);
                              recaptchaRef.current?.reset();
                            }}
                            disabled={!selectedYear}
                            className={`w-full appearance-none border text-sm md:text-base py-[0.5625rem] px-[0.75rem] rounded-sm md:h-[2.75rem] ${
                              !selectedYear || loadingMakes
                                ? "bg-neutral border-gray text-gray-medium-2 cursor-not-allowed"
                                : "bg-white border-gray text-gray-medium-2"
                            }`}
                          >
                            <option value="">
                              {loadingMakes ? "Carregando..." : "Montadora"}
                            </option>
                            {makesList.map((make) => (
                              <option key={make.Id} value={make.Id}>
                                {make.Name}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                            <Image
                              src="/icons/arrow-down-light-gray.svg"
                              alt="Seta"
                              width={12}
                              height={6}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-8 lg:col-span-4">
                        <div className="relative">
                          <select
                            id="model-model"
                            value={selectedModel}
                            onChange={(e) => {
                              setSelectedModel(e.target.value);
                              setCaptchaResolved(false);
                              recaptchaRef.current?.reset();
                            }}
                            disabled={!selectedMake}
                            className={`w-full appearance-none border text-sm md:text-base py-[0.5625rem] px-[0.75rem] rounded-sm md:h-[2.75rem] ${
                              !selectedMake || loadingModels
                                ? "bg-neutral border-gray text-gray-medium-2 cursor-not-allowed"
                                : "bg-white border-gray text-gray-medium-2"
                            }`}
                          >
                            <option value="">
                              {loadingModels ? "Carregando..." : "Modelo"}
                            </option>
                            {modelsList.map((model) => (
                              <option key={model.Id} value={model.Id}>
                                {model.DisplayName || model.Model}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                            <Image
                              src="/icons/arrow-down-light-gray.svg"
                              alt="Seta"
                              width={12}
                              height={6}
                            />
                          </div>
                        </div>
                      </div>

                      {/* BLOCO DO RECAPTCHA */}
                      {selectedModel && (
                        <div className="col-span-12">
                          <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                            onChange={onCaptchaChange}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between px-4 lg:px-0 mt-4 pt-4 border-t border-neutral">
                      <p className="flex flex-grow items-center gap-x-2 text-xs md:text-sm text-[#6D7280] mb-4 lg:mb-0 px-4 lg:px-0">
                        <Image
                          src="/icons/alert.svg"
                          width={16}
                          height={16}
                          alt="Alerta"
                        />{" "}
                        Lembre-se de sempre consultar o manual do veículo para
                        confirmar as especificações recomendadas pelo
                        fabricante.
                      </p>
                      <div>
                        <button
                          type="button"
                          onClick={handleModelSearchSubmit}
                          disabled={
                            !selectedModel || loading || !captchaResolved
                          }
                          className={`flex flex-row items-center text-center justify-center rounded-sm py-2 px-6 h-10 text-sm bg-red text-white md:text-base gap-x-[0.875rem] disabled:opacity-50 w-[20.25rem] md:w-full lg:w-[22.25rem] ${captchaResolved ? "cursor-pointer" : "cursor-not-allowed"}`}
                        >
                          {loading ? "Carregando..." : "Ver resultados"}
                          <Image
                            src="/icons/arrow-right-white.svg"
                            width={5}
                            height={10}
                            alt="Ver resultados"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "name" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <label
                      htmlFor="vehicle-name"
                      className="block text-base font-medium text-low-dark-blue mb-2 px-4 lg:px-6"
                    >
                      Busca por nome do veículo
                    </label>
                    <div className="relative px-4 pb-6 lg:border-b lg:border-neutral">
                      <input
                        type="text"
                        id="vehicle-name"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSearchByName()
                        }
                        placeholder=" "
                        className="peer placeholder:text-transparent px-3 py-[0.5625rem] w-full border border-[#D2D5DA] rounded-sm text-sm text-low-dark-blue focus:outline-none focus:border-dark-blue h-10"
                      />
                      <div className="absolute left-7 top-[0.6rem] text-sm text-gray-medium-2 pointer-events-none peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden">
                        <span className="md:hidden">
                          Escreva aqui o modelo do seu veículo. Se prefe...
                        </span>
                        <span className="hidden md:block lg:hidden">
                          Escreva aqui o modelo do seu veículo. Se preferir
                          informe também o ano. Ex: HB20...
                        </span>
                        <span className="hidden lg:block">
                          Escreva aqui o modelo do seu veículo. Se preferir
                          informe também o ano. Ex: HB20 2019
                        </span>
                      </div>
                    </div>

                    {error && (
                      <div className="px-4 lg:px-6 text-red text-sm mb-4">
                        {error}
                      </div>
                    )}

                    <div className="flex flex-col lg:flex-row justify-between mt-4 pt-4 pb-4 border-t border-neutral px-4 lg:px-6 gap-y-4">
                      <p className="flex flex-grow items-center gap-x-2 text-xs md:text-sm text-[#6D7280] mb-4 lg:mb-0">
                        <Image
                          src="/icons/alert.svg"
                          width={16}
                          height={16}
                          alt="Alerta"
                        />{" "}
                        Lembre-se de sempre consultar o manual do veículo para
                        confirmar as especificações recomendadas pelo
                        fabricante.
                      </p>
                      <div>
                        <button
                          type="button"
                          onClick={handleSearchByName}
                          disabled={loading || !searchText}
                          className="flex flex-row items-center text-center justify-center rounded-sm py-2 px-6 h-10 text-sm bg-red text-white md:text-base gap-x-[0.875rem] disabled:opacity-50 w-[20.25rem] md:w-full lg:w-[22.25rem]"
                        >
                          {loading ? "Buscando..." : "Ver resultados"}
                          {!loading && (
                            <Image
                              src="/icons/arrow-right-white.svg"
                              width={5}
                              height={10}
                              alt="Ver resultados"
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {step === "models" && (
            <ModelList
              models={foundModels}
              onSelect={handleModelSelect}
              onReset={handleReset}
              loading={loading}
            />
          )}
        </article>
      )}

      {/* RESULTADOS  */}
      {step === "results" && recommendation && (
        <>
          {dataSource === "xlab" ? (
            <XlabRecommendationResults
              recommendation={recommendation}
              selectedModel={selectedModelData}
              onReset={handleReset}
            />
          ) : (
            <RecommendationResults
              recommendation={recommendation}
              selectedModel={selectedModelData}
              onReset={handleReset}
            />
          )}
        </>
      )}
    </section>
  );
}
