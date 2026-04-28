import React from "react";
import Image from "next/image";
import Link from "next/link";
import { GroupedProduct } from "../../products/types/generalProductType";

interface ComparativeTableProps {
  title?: string;
  description?: string;
  desc?: string;
  currentProduct?: GroupedProduct;
  product_list?: any[];
}

export default function ComparativeTable({
  title,
  description,
  desc,
  currentProduct,
  product_list = [],
}: ComparativeTableProps) {
  const comparedProducts: GroupedProduct[] = product_list
    .map((p) => p?.extended_data?.sf)
    .filter(Boolean);

  const allProducts = currentProduct
    ? [currentProduct, ...comparedProducts]
    : comparedProducts;
  if (allProducts.length === 0) return null;

  const renderList = (text: string) => {
    if (!text) return "-";
    const items = text
      .split(/,|;|\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length === 0) return "-";
    return (
      <ul className="text-center text-base">
        {items.map((item, idx) => (
          <li key={idx} className="text-[#001023]">{item.replace(/•/g, "")}</li>
        ))}
      </ul>
    );
  };

  const getApiValue = (product: any) => {
    const candidate =
      product?.API__c ??
      product?.API__C ??
      product?.api__c ??
      product?._salesforce_api ??
      product?.extended_data?.sf?.API__c ??
      product?.extended_data?.sf?.API__C ??
      product?.extended_data?.sf?.api__c;

    if (candidate === null || candidate === undefined) return "-";

    const normalized = String(candidate).trim();
    return normalized.length > 0 ? normalized : "-";
  };

  const stickyHeaderBase =
    "text-left font-normal text-[1.125rem] text-[#002959] min-w-[9.4375rem] md:min-w-[15.375rem] lg:w-[15.9375rem] sticky left-0 z-20";

  const simpleHeaderStyle = `${stickyHeaderBase} bg-[#CCD0DC] pl-6 pr-0 py-4`;
  const sidebarTintStyle = `${stickyHeaderBase} bg-[rgba(0,20,80,0.2)] pl-6 pr-0 py-4`;

  const dataColStyle =
    "px-6 py-4 text-center bg-[rgba(0,20,80,0.1)] align-middle min-w-[256px] lg:min-w-0";

  const nameRowHeight = "h-[5rem]";
  const otherRowHeight = "min-h-[3.5rem]";

  return (
    <section className="comparative-table py-10 md:pb-[3rem] md:pt-[3.75rem] lg:pt-20 bg-white">
      <div className="container">
        <div className="mb-2 lg:mb-8">
          {desc ? (
            <div
              className="prose-headings:text-[28px] prose-headings:md:text-[32px] prose-headings:font-semibold prose-headings:text-dark-blue prose-headings:mb-2 prose-p:text-low-dark-blue prose-p:md:text-lg"
              dangerouslySetInnerHTML={{ __html: desc }}
            />
          ) : (
            <>
              {title && <h2 className="text-[28px] md:text-[32px] font-semibold text-dark-blue mb-2">{title}</h2>}
              {description && <p className="text-low-dark-blue md:text-lg">{description}</p>}
            </>
          )}
        </div>

        <div className="overflow-x-auto md:overflow-x-auto rounded-[16px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <table
            className="w-full min-w-[800px] lg:table-fixed border-separate border-spacing-x-0 border-spacing-y-[2px]"
            aria-label="Comparação de características técnicas dos óleos Mobil"
          >
            <thead>
              {/* Linha 1: Comparação de Produtos (Imagens) */}
              <tr className={otherRowHeight}>
                <th scope="col" className="pl-6 pr-0 py-4 text-left font-normal text-[1rem] md:text-[1.25rem] text-[#000C1A] bg-white min-w-[9.4375rem] md:min-w-[15.375rem] lg:w-[15.9375rem] sticky left-0 z-20 align-bottom">
                  Comparação de Produtos
                </th>
                {allProducts.map((product, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-6 py-4 text-center bg-white align-middle min-w-[256px] lg:min-w-0"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-[5rem] h-[6.9375rem]">
                        <Image
                          src={product.DisplayUrl || "/images/produto.webp"}
                          alt={`Embalagem ${product.B2BProductName__c}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Link
                        href={`/${(product as any).category_slug || "product"}/${product.slug}`}
                        className={`text-base font-medium text-dark-blue ${
                          index === 0 ? "" : "underline"
                        }`}
                      >
                        {index === 0 ? "Este produto" : "Ver Produto"}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Linha 2: Nome */}
              <tr className={nameRowHeight}>
                <th
                  scope="row"
                  className={`${sidebarTintStyle} h-[5rem] align-middle rounded-tl-2xl`}
                >
                  Nome
                </th>
                {allProducts.map((product, index) => (
                  <td
                    key={index}
                    className={`px-6 py-4 text-center bg-dark-blue text-white uppercase align-middle text-sm md:text-base font-semibold min-w-[256px] lg:min-w-0 ${
                      index === allProducts.length - 1 ? "rounded-tr-2xl" : ""
                    }`}
                  >
                    <div className="max-w-[31ch] mx-auto overflow-hidden line-clamp-2" title={product.B2BProductName__c}>
                      {product.B2BProductName__c}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Viscosidade */}
              <tr className={otherRowHeight}>
                <th scope="row" className={simpleHeaderStyle}>
                  Viscosidade
                </th>
                {allProducts.map((p, i) => (
                  <td key={i} className={dataColStyle}>
                    {p.Viscosity__c || "-"}
                  </td>
                ))}
              </tr>

              {/* Tipo de Óleo (Technology) */}
              <tr className={otherRowHeight}>
                <th scope="row" className={simpleHeaderStyle}>
                  Tipo de óleo
                </th>
                {allProducts.map((p, i) => (
                  <td key={i} className={dataColStyle}>
                    {p.IndustryClassifications__c || "-"}
                  </td>
                ))}
              </tr>

              {/* API */}
              <tr className={otherRowHeight}>
                <th scope="row" className={simpleHeaderStyle}>
                  API
                </th>
                {allProducts.map((p, i) => (
                  <td key={i} className={dataColStyle}>
                    {getApiValue(p)}
                  </td>
                ))}
              </tr>

              {/* Atende ou Excede */}
              <tr className={otherRowHeight}>
                <th scope="row" className={`${simpleHeaderStyle} align-top`}>
                  Atende ou Excede
                </th>
                {allProducts.map((p, i) => (
                  <td key={i} className={`${dataColStyle} align-top`}>
                    {renderList(p.MeetsOrExceeds__c)}
                  </td>
                ))}
              </tr>

              {/* Aprovações */}
              <tr className={otherRowHeight}>
                <th
                  scope="row"
                  className={`${sidebarTintStyle} align-top rounded-bl-2xl`}
                >
                  Aprovações
                </th>
                {allProducts.map((p, i) => (
                  <td key={i} className={`${dataColStyle} align-top`}>
                    {renderList(p.Approvals__c)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
