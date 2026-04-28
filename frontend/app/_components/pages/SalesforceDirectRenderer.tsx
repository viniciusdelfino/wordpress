import ProductGrid from "@/app/_components/products/ProductGrid";

interface SalesforceDirectRendererProps {
  category: any;
  products: any;
}

export function SalesforceDirectRenderer({ category, products }: SalesforceDirectRendererProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{category.name}</h1>
        <p className="text-gray-600 mt-2">
          {products.category.total_products} produtos disponíveis
        </p>
      </div>
      <ProductGrid
        products={products.products}
        pagination={products.pagination}
      />
    </div>
  );
}