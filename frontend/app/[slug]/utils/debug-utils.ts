export async function testSalesforceEndpoints(segmentSlug: string) {
  const map: Record<string, string> = {
    'carros': 'motor-de-carros',
    'motos': 'motor-de-motos',
  };
  
  const salesforceSlug = map[segmentSlug];
  
  try {
    // Testar endpoint de produtos
    if (salesforceSlug) {
      const productsRes = await fetch(
        `http://localhost:8080/moove/backend/wp-json/salesforce/v1/products/category/${salesforceSlug}`
      );
      await productsRes.json();
    }
  } catch (error) {
    console.error(`Erro no endpoint de produtos:`, error);
  }
}