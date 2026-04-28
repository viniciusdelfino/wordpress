import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ProductCard from "../../products/ProductCard";

interface XlabRecommendationProps {
  recommendation: any;
  selectedModel: any;
  onReset: () => void;
}

export default function XlabRecommendationResults({
  recommendation,
  selectedModel,
  onReset,
}: XlabRecommendationProps) {
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

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!recommendation?.Components) return;
      const skus = new Set<string>();
      recommendation.Components.forEach((comp: any) => {
        comp.RecommendedProducts?.forEach((prod: any) => {
          if (prod.ReferenceKey) skus.add(prod.ReferenceKey);
        });
      });

      if (skus.size === 0) return;

      const promises = Array.from(skus).map(async (sku) => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/product/${sku.trim()}`,
          );
          const json = await res.json();
          return json.success ? { sku, data: json.data } : null;
        } catch (err) {
          return null;
        }
      });

      const results = await Promise.all(promises);
      const newEnriched = { ...enrichedProducts };
      results.forEach((item) => {
        if (item) newEnriched[item.sku] = item.data;
      });
      setEnrichedProducts(newEnriched);
    };
    fetchProductDetails();
  }, [recommendation]);

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const mapToProductCard = (p: any, type: any) => {
    const wpData = enrichedProducts[p.ReferenceKey];
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

  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkForScroll = () => {
    const el = carouselRef.current;
    if (el) {
      const hasOverflow = el.scrollWidth > el.clientWidth;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(
        hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 1,
      );
    }
  };

  useEffect(() => {
    const timer = setTimeout(checkForScroll, 150);
    window.addEventListener("resize", checkForScroll);
    return () => window.removeEventListener("resize", checkForScroll);
  }, [availableTypes]);

  const scrollCarousel = (direction: "left" | "right") => {
    const el = carouselRef.current;
    if (el) {
      const scrollAmount = el.clientWidth * 0.75;
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
      {/* BLOCO DE INFORMAÇÕES DO VEÍCULO - ESTILO REPLICADO */}
      <article className="tab bg-white rounded-2xl mx-auto overflow-hidden shadow-search-bar mb-10 md:mb-[3.75rem] lg:mb-20 px-4 py-6 lg:px-6">
        <div className="flex items-center gap-2 mb-4">
          <Image
            alt="Check"
            width="20"
            height="20"
            src="/icons/check_car.svg"
          />
          <p className="text-dark-blue text-base md:text-lg lg:text-xl">
            Encontramos produtos compatíveis
          </p>
        </div>

        <p className="text-low-dark-blue text-xs md:text-sm mb-[0.25rem]">
          {selectedModel?.MakeName} / {selectedModel?.DisplayName} /{" "}
          {selectedModel?.Year} / {selectedModel?.Fuel}
        </p>

        <div className="flex flex-col lg:flex-row items-start md:items-center justify-between gap-y-6 mb-4 lg:gap-x-6">
          <div className="flex items-center gap-2">
            <div className="w-[80px] h-[70px] relative flex-shrink-0">
              <Image
                alt="Veículo"
                fill
                className="object-contain w-full h-full"
                src={selectedModel?.Image}
              />
            </div>
            <h2 className="text-dark-blue text-base lg:text-lg">
              {selectedModel?.MakeName} {selectedModel?.DisplayName}{" "}
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

        {/* SEÇÃO DE CAPACIDADES REPLICADA */}
        <div className="mb-4">
          <h3 className="text-low-dark-blue text-sm md:text-base mb-2 md:font-light">
            Quantidades recomendadas:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendation.Components?.map((comp: any, idx: number) => (
              <div
                key={`cap-${idx}`}
                className="px-4 py-3 flex flex-col gap-1 border border-[#9CA3AF] rounded-lg h-[3.875rem] md:h-[4rem]"
              >
                <span className="text-xs text-dark-blue lg:text-sm">
                  {comp.ComponentType?.Description || comp.Name}
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

        <div className="flex items-start gap-2 text-low-dark-blue text-xs gap-x-2 lg:items-center">
          <Image
            alt="Alerta"
            width={16}
            height={16}
            className="mt-0.5"
            src="/icons/alert.svg"
          />
          <p>
            Lembre-se de sempre consultar o manual do veículo para confirmar as
            especificações recomendadas pelo fabricante.
          </p>
        </div>
      </article>

      <div className="container">
        {typesCount !== 0 && (
          <h2 className="text-2xl md:text-[1.75rem] lg:text-[2rem] text-dark-blue mb-4 lg:mb-2 ">
            Produtos Recomendados
          </h2>
        )}

        {typesCount === 1 && (
          <div className="mb-6">
            <h3 className="text-dark-blue font-semibold text-xl md:text-[1.375rem] lg:text-2xl truncate">
              {availableTypes[0].Description}
            </h3>
          </div>
        )}

        {typesCount > 1 && typesCount <= 4 && (
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-hide layout-2">
            {availableTypes.map((type: any) => (
              <button
                key={type.Id}
                onClick={() => setActiveComponentTab(type.Id)}
                className={`cursor-pointer shrink-0 w-[15.9375rem] md:w-[20.9375rem] lg:max-w-[21.125rem] lg:flex-1 p-2 text-base transition-all rounded-sm snap-center border h-[3.6875rem] font-semibold text-left truncate ${
                  activeComponentTab === type.Id
                    ? "bg-dark-blue text-white border-dark-blue"
                    : "bg-white text-dark-blue border-neutral hover:bg-dark-blue hover:text-white"
                }`}
              >
                {type.Description}
              </button>
            ))}
          </div>
        )}

        {typesCount > 4 && (
          <div className="relative md:mb-6">
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
                  alt="Prev"
                  width={40}
                  height={40}
                />
              </button>
              <div
                ref={carouselRef}
                onScroll={checkForScroll}
                className="flex-grow flex overflow-x-auto gap-3 snap-x scrollbar-hide"
              >
                {availableTypes.map((type: any) => (
                  <button
                    key={type.Id}
                    onClick={() => setActiveComponentTab(type.Id)}
                    className={`shrink-0 min-w-[8.9375rem] px-[1.25rem] py-[0.375rem] text-base transition-all rounded-lg snap-start border h-[2.75rem] ${activeComponentTab === type.Id ? "bg-dark-blue text-white border-dark-blue" : "bg-white text-gray-600 border-gray-300"}`}
                  >
                    {type.Description}
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
                  alt="Next"
                  width={40}
                  height={40}
                />
              </button>
            </div>
          </div>
        )}

        <div className="min-h-[300px] mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendation.Components?.filter(
              (comp: any) => comp.ComponentType.Id === activeComponentTab,
            ).map((component: any) =>
              component.RecommendedProducts?.map((prod: any) => (
                <ProductCard
                  key={prod.ReferenceKey || prod.Id}
                  product={mapToProductCard(prod, component.ComponentType)}
                  layout="grid"
                />
              )),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
