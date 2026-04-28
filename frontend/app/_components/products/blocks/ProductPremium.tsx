"use client";

import Image from "next/image";
import InfoCard from "../components/InfoCard";
import { GroupedProduct } from "../types/generalProductType";

interface Props {
	product: GroupedProduct;
	isPremium: boolean;
}

export default function InfoPremium({ product, isPremium }: Props) {
	const sfPacking: string =
		(product as any).extended_data?.sf?.Packing__c ??
		(product as any).Packing__c ??
		"";

	const availableSizes = [
		...new Set(
			(product.variations ?? [])
				.map(v => v.packing)
				.filter(Boolean)
		)
	].join(", ") || sfPacking;

	const bannerUrl = product.acf?.banner_premium?.url;
	const bannerUrlMobile = product.acf?.banner_premium_mobile?.url;

	return (
		<section className={`w-full ${isPremium ? "" : "hidden"} mb-8 md:pb-6`}>
			<div className="flex flex-col">
				{bannerUrl && (
					<div className={`w-full ${bannerUrlMobile ? 'hidden lg:flex' : 'flex'}`}>
						<Image
							src={bannerUrl}
							alt={product.B2BProductName__c}
							width={258}
							height={275}
							priority
							className="w-full h-full object-cover"
						/>
					</div>
				)}
				{bannerUrlMobile && (
					<div className="w-full flex lg:hidden">
						<Image
							src={bannerUrlMobile}
							alt={product.B2BProductName__c}
							width={258}
							height={275}
							priority
							className="w-full h-full object-cover"
						/>
					</div>
				)}
				<div className="grid grid-row-2 lg:flex flex-row w-full gap-3 lg:gap-6 px-[16px] md:px-[60px] lg:px-4 items-center justify-center py-[40px] bg-[#1a1a1a]">

					<div className="grid grid-cols-2 lg:flex flex-row gap-6">
						<InfoCard
							src="/icons/car_white_ico.svg"
							title="Aplicação"
							desc={product.ProductApplication__c ?? ""}
							isPremium={isPremium}
						/>
						<InfoCard
							src="/icons/sheet_white_ico.svg"
							title="Tecnologia"
							desc={product.IndustryClassifications__c ?? ""}
							isPremium={isPremium}
						/>
					</div>

					<div className="grid grid-cols-2 lg:flex flex-row gap-6">
						<InfoCard
							src="/icons/oil_white_ico.svg"
							title="Viscosidade"
							desc={product.Viscosity__c?.toUpperCase() ?? ""}
							isPremium={isPremium}
						/>
						<InfoCard
							src="/icons/oil_white_ico.svg"
							title="Tamanhos disponíveis"
							desc={availableSizes}
							isPremium={isPremium}
						/>
					</div>

				</div>
			</div>
		</section>
	);
}