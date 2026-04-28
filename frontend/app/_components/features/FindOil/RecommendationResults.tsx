import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ProductCard from "../../products/ProductCard";
import { InforlubeModel } from "./ModelList";

interface InforlubeType {
  Id: number;
  Name: string;
  Description: string;
}

interface InforlubeProduct {
  ReferenceKey: string;
  Id: string;
  Name: string;
  Description?: string;
  Image?: string;
  Brand?: string;
  Url?: string;
}

interface InforlubeSpecification {
  Capacity?: { Average?: number; Min?: number; Max?: number };
  Unit?: { Name?: string; Description?: string };
}

interface InforlubeComponent {
  Id: string;
  Name: string;
  ComponentType: InforlubeType;
  ProductType?: InforlubeType;
  Specifications?: InforlubeSpecification[];
  RecommendedProducts: InforlubeProduct[];
}

export interface InforlubeRecommendation {
  recommendations: any;
  RecommendationId: string;
  Components: InforlubeComponent[];
  AvailableComponentTypes: InforlubeType[];
  AvailableProductTypes?: InforlubeType[];
}

interface RecommendationResultsProps {
  recommendation: InforlubeRecommendation;
  selectedModel: InforlubeModel | null;
  onReset: () => void;
}

export default function RecommendationResults({
  recommendation,
  selectedModel,
  onReset,
}: RecommendationResultsProps) {
  // O ID agora é number nos logs (ex: 3, 502), mas usamos number | string para flexibilidade
  const [activeComponentTab, setActiveComponentTab] = useState<number | string>(
    "",
  );
  const [enrichedProducts, setEnrichedProducts] = useState<Record<string, any>>(
    {},
  );

  useEffect(() => {
    if (recommendation?.AvailableComponentTypes?.length > 0) {
      setActiveComponentTab(recommendation.AvailableComponentTypes[0].Id);
    }
  }, [recommendation]);

  // Busca dados enriquecidos (Slug correto, Viscosidade, Tech) do WP/Salesforce via SKU
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!recommendation?.Components) return;

      const skus = new Set<string>();
      recommendation.Components.forEach((comp) => {
        comp.RecommendedProducts.forEach((prod) => {
          if (prod.ReferenceKey) skus.add(prod.ReferenceKey);
          else if (prod.Id && /^\d+$/.test(prod.Id)) skus.add(prod.Id);
        });
      });

      if (skus.size === 0) return;

      const promises = Array.from(skus).map(async (sku) => {
        try {
          const cleanSku = sku.toString().trim();
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/product/${cleanSku}`,
          );

          if (!res.ok) return null;
          const json = await res.json();

          return json.success ? { sku: cleanSku, data: json.data } : null;
        } catch (err) {
          console.error(`Erro fetching SKU ${sku}:`, err);
          return null;
        }
      });

      const results = await Promise.all(promises);
      const newEnriched = { ...enrichedProducts };
      results.forEach((item) => {
        if (item) {
          newEnriched[item.sku] = item.data;
        }
      });
      setEnrichedProducts(newEnriched);
    };

    fetchProductDetails();
  }, [recommendation]);

  // Helper para criar slug do produto a partir do nome
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  // Helper mapeamento Produto Inforlube -> ProductCard Salesforce
  const mapToProductCard = (p: InforlubeProduct, type: InforlubeType) => {
    // Tenta encontrar dados enriquecidos usando ReferenceKey ou Id
    const wpData = enrichedProducts[p.ReferenceKey] || enrichedProducts[p.Id];

    return {
      B2BProductName__c: wpData?.title || wpData?.B2BProductName__c || p.Name,
      Description: wpData?.Description || p.Description || "",
      image: p.Image || "/images/placeholder.png",
      slug: wpData?.slug || slugify(p.Name),
      category_slug: wpData?.category_slug || "produto",
      ProductApplication__c:
        wpData?.ProductApplication__c || type.Description || type.Name,
      Viscosity__c: wpData?.Viscosity__c,
      IndustryClassifications__c: wpData?.IndustryClassifications__c,
      variations: [{ sku: p.ReferenceKey }],
    } as any;
  };

  const availableTypes = recommendation.AvailableComponentTypes || [];
  const typesCount = availableTypes.length;

  // --- Carousel Logic for Layout 3 ---
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkForScroll = () => {
    const el = carouselRef.current;
    if (el) {
      const hasOverflow = el.scrollWidth > el.clientWidth;
      setCanScrollLeft(el.scrollLeft > 0);
      // A small buffer is added to account for sub-pixel rendering issues
      setCanScrollRight(
        hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 1,
      );
    }
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    // A small delay to ensure the DOM is fully rendered and widths are calculated
    const timer = setTimeout(() => {
      checkForScroll();
    }, 150);

    window.addEventListener("resize", checkForScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkForScroll);
    };
  }, [availableTypes]);

  const scrollCarousel = (direction: "left" | "right") => {
    const el = carouselRef.current;
    if (el) {
      const scrollAmount = el.clientWidth * 0.75; // Scroll 75% of the visible width
      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const translateUnit = (unit: string) => {
    if (!unit) return "L";
    const u = unit.toLowerCase();
    if (u.includes("liter") || u.includes("litre")) return "Litros(L)";
    if (u.includes("ounce")) return "Oz"; 
    return unit; 
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* --- INFORMAÇÕES DO VEÍCULO E CAPACIDADES --- */}
      <article className="tab bg-white rounded-2xl mx-auto overflow-hidden shadow-search-bar mb-10 md:mb-[3.75rem] lg:mb-20 px-4 py-6 lg:px-6">
        <div className="flex items-center gap-2 mb-4">
          <Image
            src="/icons/check_car.svg"
            width={20}
            height={20}
            alt="Check"
          />
          <p className="text-dark-blue text-base md:text-lg lg:text-xl">
            Encontramos produtos compatíveis
          </p>
        </div>

        {/* Breadcrumb Info */}
        <p className="text-low-dark-blue text-xs md:text-sm mb-[0.25rem]">
          {selectedModel?.MakeName || "Montadora"} /{" "}
          {selectedModel?.DisplayName || selectedModel?.Name || "Modelo"} /{" "}
          {selectedModel?.Year} / {selectedModel?.Fuel || "Combustível"}
        </p>

        {/* Detalhes do Veículo e Botão */}
        <div className="flex flex-col lg:flex-row items-start md:items-center justify-between gap-y-6 mb-4 lg:gap-x-6">
          <div className="flex items-center gap-2">
            <div className="w-[80px] h-[70px] relative flex-shrink-0">
              {selectedModel?.Image ? (
                <img
                  src={selectedModel.Image}
                  alt="Veículo"
                  className="object-contain w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-neutral-100 flex items-center justify-center rounded">
                  <Image
                    src="/icons/car-blue.svg"
                    width={40}
                    height={40}
                    alt="Veículo"
                  />
                </div>
              )}
            </div>
            <h2 className="text-dark-blue text-base lg:text-lg">
              {selectedModel?.MakeName}{" "}
              {selectedModel?.DisplayName || selectedModel?.Model}{" "}
              {selectedModel?.Year}
            </h2>
          </div>

          <button
            onClick={onReset}
            className="cursor-pointer text-white bg-dark-blue flex items-center justify-center w-full h-[2.5625rem] md:h-[2.75rem] rounded-sm text-sm md:text-base lg:bg-transparent lg:border lg:border-dark-blue rounded-sm lg:text-dark-blue lg:w-[22.25rem] lg:px-4 lg:py-3"
          >
            Alterar veículo
          </button>
        </div>

        {/* Capacidades */}
        <div className="mb-4">
          <h3 className="text-low-dark-blue text-sm md:text-base mb-2 md:font-light">
            Quantidades recomendadas:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendation.Components?.map((comp, idx) => (
              <div
                key={`cap-${idx}`}
                className={`px-4 py-3 flex flex-col gap-1 border border-[#9CA3AF] rounded-lg h-[3.875rem] md:h-[4rem] ${
                  recommendation.Components.length === 3 && idx === 3
                    ? "col-span-1 md:col-span-2 lg:col-span-1"
                    : ""
                }`}
              >
                <span className="text-xs text-dark-blue lg:text-sm">
                  {comp.ProductType?.Description ||
                    comp.ComponentType.Description ||
                    comp.Name}
                </span>
                <span className="text-sm text-low-dark-blue">
                  {comp.Specifications?.[0]?.Capacity?.Average
                    ? `${comp.Specifications[0].Capacity.Average} ${translateUnit(comp.Specifications[0].Unit?.Name)}`
                    : "--"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 text-low-dark-blue text-xs gap-x-2 lg:items-center">
          <Image
            src="/icons/alert.svg"
            width={16}
            height={16}
            alt="Alerta"
            className="mt-0.5"
          />
          <p>
            Lembre-se de sempre consultar o manual do veículo para confirmar as
            especificações recomendadas pelo fabricante.
          </p>
        </div>
      </article>

      {/* --- BLOCO 2: PRODUTOS RECOMENDADOS (POR FORA) --- */}
      <div className="container">
        {typesCount !== 0 && (
          <h2 className="text-2xl md:text-[1.75rem] lg:text-[2rem] text-dark-blue mb-4 lg:mb-2 ">
            Produtos Recomendados
          </h2>
        )}

        {/* Abas de Produtos */}
        {/* LAYOUT 1: Apenas 1 item (Título simples) */}
        {typesCount === 1 && (
          <div className="mb-6">
            <h3
              className="text-dark-blue font-semibold text-xl md:text-[1.375rem] lg:text-2xl truncate"
              title={availableTypes[0].Description || availableTypes[0].Name}
            >
              {availableTypes[0].Description || availableTypes[0].Name}
            </h3>
          </div>
        )}

        {/* LAYOUT 2: Entre 2 e 4 itens (Carrossel simples) */}
        {typesCount > 1 && typesCount <= 4 && (
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-hide layout-2">
            {availableTypes.map((type) => (
              <button
                key={type.Id}
                onClick={() => setActiveComponentTab(type.Id)}
                title={type.Description || type.Name}
                className={`cursor-pointer shrink-0 w-[15.9375rem] md:w-[20.9375rem] lg:max-w-[21.125rem] lg:flex-1 p-2 text-base transition-all rounded-sm snap-center border h-[3.6875rem] font-semibold text-left truncate ${
                  activeComponentTab === type.Id
                    ? "bg-dark-blue text-white border-dark-blue"
                    : "bg-white text-dark-blue border-neutral hover:bg-dark-blue hover:text-white"
                }`}
              >
                {type.Description || type.Name}
              </button>
            ))}
          </div>
        )}

        {/* LAYOUT 3: Mais de 4 itens (Select no Mobile / Carrossel no Desktop) */}
        {typesCount > 4 && (
          <div className="relative md:mb-6">
            {/* Mobile: Select */}
            <div className="md:hidden flex items-center gap-x-6 mb-6 bg-white p-4 shadow-[0px_4px_8px_0px_rgba(0,22,43,0.04)] rounded-lg">
              <span className="font-bold uppercase text-[0.625rem] text-bold text-[#737477] whitespace-nowrap">
                Filtrar por:
              </span>
              <select
                value={activeComponentTab}
                onChange={(e) => setActiveComponentTab(Number(e.target.value))}
                className="w-full h-[2.5rem] px-2 py-[0.5625rem] bg-transparent text-dark-blue font-medium focus:outline-none rounded-sm border border-gray"
              >
                {availableTypes.map((type) => (
                  <option key={type.Id} value={type.Id} className="text-dark-blue text-sm">
                    {type.Description || type.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop/Tablet: Carrossel (3 itens Tablet / 6 itens Desktop) */}
            <div className="hidden md:flex items-center gap-x-2">
              <button
                onClick={() => scrollCarousel("left")}
                className="shrink-0 p-2 disabled:opacity-30"
                disabled={!canScrollLeft}
              >
                <Image
                  src={
                    canScrollLeft
                      ? "/icons/arrow-right-gray-active.svg"
                      : "/icons/arrow-left-gray.svg"
                  }
                  alt="Scroll Left"
                  width={40}
                  height={40}
                />
              </button>
              <div
                ref={carouselRef}
                onScroll={checkForScroll}
                className="flex-grow flex overflow-x-auto gap-3 snap-x scrollbar-hide"
              >
                {availableTypes.map((type) => (
                  <button
                    key={type.Id}
                    onClick={() => setActiveComponentTab(type.Id)}
                    title={type.Description || type.Name}
                    className={`shrink-0 min-w-[8.9375rem] px-[1.25rem] py-[0.375rem] text-base transition-all rounded-lg snap-start border truncate h-[2.75rem] ${
                      activeComponentTab === type.Id
                        ? "bg-dark-blue text-white border-dark-blue"
                        : "bg-white text-gray-600 border-gray-300 hover:border-dark-blue"
                    }`}
                  >
                    {type.Description || type.Name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => scrollCarousel("right")}
                className="shrink-0 p-2 disabled:opacity-30"
                disabled={!canScrollRight}
              >
                <Image
                  src={
                    canScrollRight
                      ? "/icons/arrow-left-gray-active.svg"
                      : "/icons/arrow-right-gray.svg"
                  }
                  alt="Scroll Right"
                  width={40}
                  height={40}
                />
              </button>
            </div>
          </div>
        )}

        {/* Lista de Produtos */}
        {(() => {
          const activeComponents =
            recommendation.Components?.filter(
              (comp) => comp.ComponentType.Id === activeComponentTab,
            ) ?? [];

          if (!activeComponents.some((c) => c.RecommendedProducts?.length > 0)) {
            return null;
          }

          return (
            <div className="min-h-[300px]">
              {activeComponents.map((component, idx) => (
                <div key={`${component.Id}-${idx}`} className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {component.RecommendedProducts?.map((prod) => (
                      <div key={prod.ReferenceKey || prod.Id} className="h-full">
                        <ProductCard
                          product={mapToProductCard(
                            prod,
                            component.ProductType || component.ComponentType,
                          )}
                          layout="grid"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {recommendation.recommendations?.length === 0 && (
        <article className="container animate-in fade-in lg:mb-20">
          <div className="border border-gray rounded-2xl p-4">
            <div className="flex flex-col items-center text-center">
              <Image
                src="/icons/alert-circle.svg"
                width={58}
                height={58}
                alt="Alerta"
                className="w-[3.625rem] h-[3.625rem] md:w-20 md:h-20"
              />
              <h2 className="text-lg md:text-2xl lg:text-3xl font-semibold text-low-dark-blue my-6">
                Não encontramos uma recomendação exata para este veículo
              </h2>
              <p className="font-semibold text-low-dark-blue text-sm md:text-lg lg:text-2xl">
                Sugestões para encontrar o óleo ideal:
              </p>
              <ul className="mt-6 text-left flex flex-col lg:flex-row md:gap-x-3 gap-y-3 lg:gap-x-6 ">
                <li className="find-oil-list-suggestion flex flex-col bg-neutral-2 p-4 md:p-2 lg:p-4 gap-y-2 rounded-[0.625rem] border-neutral border md:min-w-[12.3125rem]">
                  <span className="font-semibold text-low-dark-blue text-sm lg:text-base flex flex-row items-center gap-x-2 lg:gap-x-4">
                    <span className="text-dark-blue bg-transparent-gray-2 block w-8 h-8 md:min-w-8 text-center flex items-center justify-center rounded-full">1</span> Verifique os dados do veículo
                  </span>
                  <p className="text-sm text-[#6A7282]">
                    Confirme ano, montadora e modelo informados.
                  </p>
                </li>
                <li className="find-oil-list-suggestion flex flex-col bg-neutral-2 p-4 md:p-2 lg:p-4 gap-y-2 rounded-[0.625rem] border-neutral border md:min-w-[12.3125rem]">
                  <span className="font-semibold text-low-dark-blue text-sm lg:text-base flex flex-row items-center gap-x-2 lg:gap-x-4">
                    <span className="text-dark-blue bg-transparent-gray-2 block w-8 h-8 md:min-w-8 text-center flex items-center justify-center rounded-full">2</span> Tente outra combinação de dados
                  </span>
                  <p className="text-sm text-[#6A7282]">
                    Pequenas variações de versão ou ano podem influenciar o
                    resultado da busca.
                  </p>
                </li>
                <li className="find-oil-list-suggestion flex flex-col bg-neutral-2 p-4 md:p-2 lg:p-4 gap-y-2 rounded-[0.625rem] border-neutral border md:min-w-[12.3125rem] 4xl:min-w-[24.5625rem]">
                  <span className="font-semibold text-low-dark-blue text-sm lg:text-base flex flex-row items-center gap-x-2 lg:gap-x-4">
                    <span className="text-dark-blue bg-transparent-gray-2 block w-8 h-8 md:min-w-8 text-center flex items-center justify-center rounded-full">3</span> Consulte o manual do veículo
                  </span>
                  <p className="text-sm text-[#6A7282]">
                    O manual do proprietário traz a especificação exata indicada
                    pelo fabricante.
                  </p>
                </li>
              </ul>
              <button
                onClick={onReset}
                className="mt-6 text-dark-blue text-sm md:text-base py-3 px-4 rounded-sm border-dark-blue border rounded-sm w-full h-[2.5625rem] md:h-[2.75rem] md:w-fit md:min-w-[18.75rem] cursor-pointer"
              >
                Tentar nova busca
              </button>
            </div>
          </div>
          <div className="text-center mt-6">
            <p className="text-[#6A7282] text-sm md:text-lg lg:text-xl md:w-[37.5rem] mx-auto">
              Não encontrou o óleo ideal para o seu veículo? Não se preocupe,
              nossos especialistas podem te ajudar.
            </p>
            <button className="mt-2 bg-red text-white py-3 px-4 h-[2.5625rem] md:h-[2.75rem] min-w-[18.75rem] text-sm md:text-base rounded-sm cursor-pointer">
              Fale conosco
            </button>
          </div>
        </article>
      )}
    </div>
  );
}
