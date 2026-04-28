import BlockRenderer from "@/app/_components/BlockRenderer";
import ProductGrid from "@/app/_components/products/ProductGrid";
import FaqSection from "@/app/_components/blocks/FaqSection";

interface PageRendererProps {
  page: any;
  salesforceData?: any;
}

export function PageRenderer({ page, salesforceData }: PageRendererProps) {
  // FAQ Page — detected by acf_fields.faq_categories
  const acfFields = page.acf_fields || page.acf;
  if (acfFields?.faq_categories) {
    return <FaqSection {...acfFields} />;
  }

  const blocks = page.blocks || page.acf?.blocks || [];
  const hasBlocks = blocks.length > 0;

  if (hasBlocks) {
    return (
      <>
        <BlockRenderer blocks={blocks} />
        {salesforceData && <SalesforceProductsSection data={salesforceData} />}
        {page.acf?.blocks_after_products && (
          <BlockRenderer blocks={page.acf.blocks_after_products} />
        )}
      </>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <article className="prose prose-lg max-w-none">
        {page.title?.rendered && (
          <h1
            className="text-4xl font-bold mb-8"
            dangerouslySetInnerHTML={{ __html: page.title.rendered }}
          />
        )}
        {page.content?.rendered && (
          <div dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
        )}
      </article>
      {salesforceData && (
        <div className="mt-16 pt-12 border-t border-gray-200">
          <SalesforceProductsSection data={salesforceData} />
        </div>
      )}
    </div>
  );
}

function SalesforceProductsSection({ data }: { data: any }) {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Produtos {data.category.name}</h2>
        <p className="text-gray-600 mt-2">
          {data.products.category.total_products} produtos disponíveis
        </p>
      </div>
      <ProductGrid
        products={data.products.products}
        pagination={data.products.pagination}
      />
    </>
  );
}