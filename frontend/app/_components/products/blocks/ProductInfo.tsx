"use client";

import Image from "next/image";
import Galery from "../components/Galery";
import InfoCard from "../components/InfoCard";
import InfoList from "../components/InfoList";
import VideoPlayer from "../components/VideoPlayer";
import { GroupedProduct } from "../types/generalProductType";

const MOCK_IMAGES = [
	{
		alt: "imagem 1",
		src: "/images/image-2.png",
		fit: "contain"
	},
	{
		alt: "imagem 2",
		src: "/images/mobil1.png",
		fit: "cover"
	},
];

const MOCK_VIDEOS = [
	{
		type: "video/mp4",
		src: "/images/mobil1.mp4",
		thumb: "/images/thumb.png"
	}
];

interface Props {
	isPremium?: boolean;
	product: GroupedProduct;
}

export default function InfoProd({ product, isPremium }: Props) {
	const MlHidden = product.acf?.comprar_ml;
	const images: { src: string; alt: string; fit: string }[] = product.DisplayUrl
		? [{ src: product.DisplayUrl, alt: product.B2BProductName__c, fit:product.B2BProductName__c }]
		: MOCK_IMAGES;
	const videos: any[] = MOCK_VIDEOS;

	const sfPacking: string =
		(product as any).extended_data?.sf?.Packing__c ??
		(product as any).Packing__c ??
		"";
	const packingsFromVariations = product.variations
		.map((v) => v.packing)
		.filter(Boolean) as string[];
	const availableSizes = sfPacking || [...new Set(packingsFromVariations)].join(", ");

	const splitByComma = (str: string) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];

	const splitBenefits = (str: string) => str ? str.split(/;|\n/).map(s => s.replace(/•/g, '').trim()).filter(Boolean) : [];

	const approvalsList = splitByComma(product.Approvals__c);
	const meetsExceedsList = splitByComma(product.MeetsOrExceeds__c);
	const benefitsList = splitBenefits(product.Benefits__c);

	return (
		<section className={`product-info ${isPremium ? "md:py-[32px]" : "md:py-10"}`}>
			<div className="flex flex-col px-4 md:px-[60px] lg:px-4 lg:flex-row md:justify-center gap-2 lg:gap-4">
				{/* Imagem mobile */}
				<div className={`flex w-full justify-center lg:hidden ${isPremium ? "hidden" : ""}`}>
					{images.length ? (
						<Image
							src={images[0].src}
							alt={images[0].alt || product.B2BProductName__c}
							width={258}
							height={275}
							priority
						/>
					) : null}
				</div>

				{/* Imagem premium */}
				<div className={`${isPremium ? "flex" : "hidden"} flex-col w-full lg:w-[514px] gap-4 md:pb-4 items-center justify-center lg:sticky top-24 self-start`}>
					<div className="w-full h-[400px] lg:h-[514px] lg:w-[514px] rounded-lg overflow-hidden">
						{images.length > 1 ? (
							<Image
								src={images[1].src}
								alt={images[1].alt || product.B2BProductName__c}
								width={514}
								height={514}
								priority
								className="w-full h-full object-cover"
							/>
						) : null}
					</div>
				</div>

				{/* Galeria */}
				<Galery image_from={images} video_from={videos} isPremium={isPremium ? "lg:hidden" : ""} />

				{/* Conteúdo */}
				<article className="flex flex-col lg:w-[730px] px-2 md:px-6 py-4 w-full gap-6 bg-slate-50 rounded-2xl">
					{/* Bloco 1 */}
					<div className={`items-start w-full gap-4 ${isPremium ? "hidden" : ""}`}>
						<h1 className="text-[32px] text-blue-950 font-semibold">
							{product.B2BProductName__c}
						</h1>

						<div className="grid grid-cols-2 w-full gap-4">
							<div className="grid grid-rows-2">
								<InfoCard src="/icons/car_ico.svg" title="Aplicação" desc={product.ProductApplication__c} isPremium={isPremium} />
								<InfoCard src="/icons/oil_ico.svg" title="Viscosidade" desc={product.Viscosity__c?.toUpperCase() ?? ''} isPremium={isPremium} />
							</div>
							<div className="grid grid-rows-2">
								<InfoCard src="/icons/sheet_ico.svg" title="Tecnologia" desc={product.IndustryClassifications__c} isPremium={isPremium} />
								<InfoCard src="/icons/oil_ico.svg" title="Tamanhos disponíveis" desc={availableSizes} isPremium={isPremium} />
							</div>
						</div>

						<div className="flex">
							<div className="flex gap-2 p-2">
								<Image src={"/icons/download_ico.svg"} alt="download" width={18} height={16.5} />
								<a href="#"><p className="font-semibold text-sm md:text-base underline text-blue-950">Ficha Técnica</p></a>
							</div>
							<div className="flex gap-2 p-2">
								<Image src={"/icons/download_ico.svg"} alt="download" width={18} height={16.5} />
								<a href="#"><p className="font-semibold text-sm md:text-base underline text-blue-950">Ficha de Segurança</p></a>
							</div>
						</div>
					</div>

					{/* Bloco 2 */}
					<div className="flex flex-col gap-4">
						<h2 className="text-xl text-blue-950 md:text-[28px] font-semibold">
							Sobre o {product.B2BProductName__c}
						</h2>
						<p className="text-gray-600 text-base">{product.Description}</p>

						<div className="grid grid-cols-2 gap-2">
							<InfoList content={approvalsList} list_title="Aprovações" />
							<InfoList content={meetsExceedsList} list_title="Atende ou excede" />
						</div>
					</div>

					{/* Bloco 3 */}
					<div className="flex flex-col gap-4"> {/* Este é o pai que comanda a ordem dos dois abaixo */}

						{/* Grupo de Benefícios */}
						<div className={`flex flex-col gap-2 lg:order-1 ${isPremium ? "order-2" : "order-1"}`}>
							<p className="text-xl md:text-[28px] text-blue-950 font-semibold">
								Benefícios do {product.B2BProductName__c}
							</p>

							<ul className="flex flex-col gap-4">
								{benefitsList.map((benefit, index) => (
									<li key={index} className="flex gap-4 px-4 py-2 bg-slate-200 rounded-sm items-center">
										<Image src={"/icons/check_2.svg"} alt="benefit" width={20} height={20} />
										<p className="text-base text-blue-950">{benefit}</p>
									</li>
								))}
							</ul>
						</div>

						{/* Grupo de Botões de Compra */}
						<div className={`flex flex-col gap-2 lg:order-2 gap-4 ${isPremium ? "order-1" : "order-2"}`}>
							<span className={`${!MlHidden ? "hidden" : "flex"} flex-col gap-2`}>
								<p className="text-blue-950 text-sm md:text-base">
									Compre no varejo pelo Mercado Livre:
								</p>
								<button className="flex flex-row gap-2 w-full justify-center text-center py-2 border border-blue-950 hover:bg-blue-950 text-blue-950 hover:text-white rounded-sm">
									<Image src="/icons/ml_ico.svg" alt="ml" width={20} height={20} />
									<p className="text-sm md:text-base">Comprar agora no Mercado Livre</p>
								</button>
							</span>
							<span className={`${!MlHidden ? "hidden" : "flex"} flex-row gap-2 items-center justify-center`}>
								<hr className="w-full border-[1px] border-gray-200" />
								<p className="text-sm text-gray-600">ou</p>
								<hr className="w-full border-[1px] border-gray-200" />
							</span>
							<span className="flex flex-col gap-2">
								<p className="text-blue-950 text-sm md:text-base">
									Você é um CNPJ? Compre agora de um distribuidor oficial:
								</p>
								<button className="flex flex-row gap-2 w-full justify-center py-2 bg-red text-white border border-red rounded-sm">
									<Image src="/icons/tool_svg.svg" alt="tool" width={20} height={20} />
									<p className="text-sm md:text-base">Comprar agora com CNPJ</p>
								</button>
							</span>
							<span className={`${isPremium ? "flex" : "hidden"}`}>
								<p className="text-base lg:text-lg">Escolha um lubrificante desenvolvido para quem busca proteção máxima, tecnologia avançada e confiança, garantindo o melhor cuidado para o seu motor em qualquer situação.</p>
							</span>
						</div>

					</div>

					{/* Bloco 4 */}
					<div className={`lg:hidden ${isPremium ? "flex" : "hidden"} flex-col w-full rounded-lg items-center justify-center`}>
						<div className="flex w-full max-h-[682.67px] items-center justify-center" style={{ clipPath: "polygon(0 0, 85% 0, 100% 10%, 100% 100%, 0 100%)" }}>
							<VideoPlayer
								src={videos[0].src}
								thumb={videos[0].thumb}
								videoType={videos[0].type}
							/>
						</div>

					</div>
				</article>
			</div>
		</section>
	);
}
