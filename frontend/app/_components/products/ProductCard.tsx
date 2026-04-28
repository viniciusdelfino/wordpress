import Link from "next/link";
import Image from "next/image";
import { GroupedProduct } from "@/app/lib/salesforce-client";

interface ProductCardProps {
  product: GroupedProduct;
  layout?: "grid" | "list";
  basePath?: string;
  showDownloads?: boolean;
}

export default function ProductCard({
  product,
  layout = "grid",
  basePath = '/product',
  showDownloads = false
}: ProductCardProps) {

  const variations = product.variations || [];
  const firstVariation = variations[0];
  const variationCount = variations?.length;
  const sku = firstVariation?.sku || 'unknown';

  const productCategorySlug = (product as any).category_slug;
  const finalBasePath = (basePath && basePath !== '/product') ? basePath : (productCategorySlug ? `/${productCategorySlug}` : '/produto');

  const productUrl = `${finalBasePath}/${product.slug}`;

  const app = (product as any).ProductApplication__c;
  const tech = (product as any).IndustryClassifications__c;
  const visc = (product as any).Viscosity__c;
  const filledCount = [app, tech, visc].filter(Boolean)?.length;
  const infoBoxClass = "min-h-[61px] bg-neutral rounded-[0.625rem] flex flex-col p-2 gap-y-2";
  const infoValueBaseClass = "block text-xs md:text-sm text-low-dark-blue leading-4 min-h-8 capitalize";

  if (layout === "list") {
    return (
      <Link href={productUrl}>
        <div className={`product-card flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-gray product-sku-${sku}`}>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  {(product as any).B2BProductName__c}
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {(product as any).Description || "Sem descrição disponível."}
                </p>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {product.category_slug.toUpperCase()}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {firstVariation.viscosity && (
                <div>
                  <span className="text-gray-500">Viscosidade:</span>
                  <span className="font-medium ml-2">
                    {firstVariation.viscosity}
                  </span>
                </div>
              )}
              {(product as any).IndustryClassifications__c && (
                <div>
                  <span className="text-gray-500">Tipo:</span>
                  <span className="font-medium ml-2">
                    {(product as any).IndustryClassifications__c}
                  </span>
                </div>
              )}
              {firstVariation.packing && (
                <div>
                  <span className="text-gray-500">Embalagem:</span>
                  <span className="font-medium ml-2">
                    {firstVariation.packing}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="font-mono text-sm text-gray-800">
                {variationCount}{" "}
                {variationCount === 1 ? "Variação" : "Variações"}
              </div>
              <div className="flex items-center text-blue-600 group-hover:translate-x-2 transition-transform">
                <span className="text-sm font-medium">Ver detalhes</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Layout Grid (default)
  return (
    <div className={`group w-full h-full bg-white rounded-lg border border-gray-200 flex flex-col pb-5 pt-4 px-[12px] relative product-sku-${sku}`}>
      {/* Título */}
      <Link href={productUrl} className="block">
        <h3 className="text-dark-blue font-semibold text-lg line-clamp-2 h-[56px] mb-0 pl-3 uppercase">
          {(product as any).B2BProductName__c}
        </h3>
      </Link>

      {/* Imagem */}
      <div className="relative w-full h-[174px] shrink-0 flex items-center justify-center bg-white">
        <Link href={productUrl} className="block w-full h-full relative">
          <Image
            src={(product as any).image || "/images/produto.webp"}
            alt={(product as any).B2BProductName__c || 'Produto sem título'}
            fill
            className="object-contain"
          />
        </Link>
      </div>
      {/* Blocos de Informação */}
      <div className={`mt-4 grid grid-cols-2 auto-rows-fr ${visc?.length ? "lg:grid-cols-3" : "lg:grid-cols-2"} gap-2 lg:gap-x-2`}>
        {filledCount === 3 && (
          <>
            <div className={`col-span-1 ${infoBoxClass}`}>
              <span className="block text-sm md:text-base text-dark-blue font-semibold">
                Aplicação
              </span>
              <span
                className={`${infoValueBaseClass} first-letter:uppercase`}
                title={app}
              >
                {app?.toLowerCase()}
              </span>
            </div>
            <div className={`col-span-1 ${infoBoxClass}`}>
              <span className="block text-sm md:text-base text-dark-blue font-semibold">
                Tecnologia
              </span>
              <span
                className={`${infoValueBaseClass} capitalize`}
                title={tech}
              >
                {tech?.toLowerCase()}
              </span>
            </div>
            <div className={`col-span-2 lg:col-span-1 ${infoBoxClass}`}>
              <span className="block text-sm md:text-base text-dark-blue font-semibold">
                Viscosidade
              </span>
              <span
                className={`${infoValueBaseClass} uppercase`}
                title={visc}
              >
                {visc}
              </span>
            </div>
          </>
        )}

        {filledCount === 2 && (
          <>
            {app && (
              <div className={infoBoxClass}>
                <span className="block text-sm md:text-base text-dark-blue font-semibold">
                  Aplicação
                </span>
                <span
                  className={`${infoValueBaseClass} first-letter:uppercase`}
                  title={app}
                >
                  {app?.toLowerCase()}
                </span>
              </div>
            )}
            {tech && (
              <div className={infoBoxClass}>
                <span className="block text-sm md:text-base text-dark-blue font-semibold">
                  Tecnologia
                </span>
                <span
                  className={infoValueBaseClass}
                  title={tech}
                >
                  {tech?.toLowerCase()}
                </span>
              </div>
            )}
            {visc && (
              <div className={infoBoxClass}>
                <span className="block text-sm md:text-base text-dark-blue font-semibold">
                  Viscosidade
                </span>
                <span
                  className={infoValueBaseClass}
                  title={visc}
                >
                  {visc?.toLowerCase()}
                </span>
              </div>
            )}
          </>
        )}

        {filledCount === 1 && (
          <>
            {app && (
              <div className={`w-full ${infoBoxClass}`}>
                <span className="block text-sm md:text-base text-dark-blue font-semibold">
                  Aplicação
                </span>
                <span
                  className={`${infoValueBaseClass} first-letter:uppercase`}
                  title={app}
                >
                  {app?.toLowerCase()}
                </span>
              </div>
            )}
            {tech && (
              <div className={`w-full ${infoBoxClass}`}>
                <span className="block text-sm md:text-base text-dark-blue font-semibold">
                  Tecnologia
                </span>
                <span
                  className={infoValueBaseClass}
                  title={tech}
                >
                  {tech?.toLowerCase()}
                </span>
              </div>
            )}
            {visc && (
              <div className={`w-full ${infoBoxClass}`}>
                <span className="block text-sm md:text-base text-dark-blue font-semibold">
                  Viscosidade
                </span>
                <span
                  className={infoValueBaseClass}
                  title={visc}
                >
                  {visc?.toLowerCase()}
                </span>
              </div>
            )}
          </>
        )}
      </div>
      {/* Downloads */}
     {showDownloads && (
        <div className="mt-2 flex gap-4 text-xs md:text-sm text-dark-blue justify-center">
          <a
            href="#"
            className="flex items-center gap-1"
          >
            <Image
              src="/icons/download.svg"
              width={16}
              height={16}
              alt="Download"
            />
            <span className="underline">Ficha técnica</span>
          </a>
          <a href="#" className="flex items-center gap-1">
            <Image
              src="/icons/download.svg"
              width={16}
              height={16}
              alt="Download"
            />
            <span className="underline">Ficha de segurança</span>
          </a>
        </div>
      )}

      {/* Botão */}
      <div className="mt-auto pt-4">
        <Link
          href={productUrl}
          className="flex items-center justify-center w-full h-10 border text-white font-semibold rounded-sm bg-red text-sm md:text-base"
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  );
}
