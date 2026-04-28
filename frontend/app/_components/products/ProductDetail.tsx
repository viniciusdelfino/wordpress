"use client";

import InfoProd from "./blocks/ProductInfo";
import InfoPremium from "./blocks/ProductPremium";
import { GroupedProduct } from "./types/generalProductType";

export default function ProductDetail({ product }: { product: GroupedProduct }) {
  return (
    <div>
      <InfoPremium product={product} isPremium={product.acf?.produto_premium} />
      <InfoProd product={product} isPremium={product.acf?.produto_premium} />
    </div>
  )
}
