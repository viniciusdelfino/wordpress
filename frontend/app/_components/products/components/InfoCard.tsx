import React from "react"
import Image from "next/image"

interface InfoCardProps {
    src: string;
    title: string;
    desc: string;
    isPremium?: boolean;
}

export default function InfoCard({ src, title, desc, isPremium }: InfoCardProps) {
	return (
		<>
			<div className={`${isPremium ? "hidden" : "flex"} flex-col gap-2 md:flex-row md:h-[73px] md:w-full border border-blue-950/60 rounded-lg my-2 justify-center md:justify-start md:px-2 py-4 md:py-3 pr-2 pl-2`}>
				<span className="flex gap-4">
					<Image
						src={src}
						alt="img1"
						width={32}
						height={32}
						className="mx-2"
					/>
				</span>
				<span>
					<h3 className="font-semibold text-lg text-blue-950">{title}</h3>
					<p className="text-gray-600 text-sm uppercase">{desc}</p>
				</span>
			</div>
			<div className={isPremium ? "flex flex-col gap-2 md:flex-row md:h-[73px] md:w-[314px] lg:w-[300px] bg-[#0f1113] border border-zinc-600 rounded-lg my-2 justify-center md:justify-start md:px-2 py-4 md:py-3 pr-2 pl-4" : "hidden"}>
				<span className="flex gap-4">
					<Image
						src={src}
						alt="img1"
						width={32}
						height={32}
						className="mx-2"
					/>
				</span>
				<span>
					<h3 className="font-semibold text-lg text-neutral-50">{title}</h3>
					<p className="text-zinc-400 text-sm">{desc}</p>
				</span>
			</div>
		</>
	)
}
