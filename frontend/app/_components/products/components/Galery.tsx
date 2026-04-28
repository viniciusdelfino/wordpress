import React, { useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import ImageNav from "./ImageNav";
import VideoPlayer from "./VideoPlayer";

interface ImageSource {
	src: string;
	alt: string;
	fit: string;
}

interface VideoSource {
	src: string;
	thumb: string;
	type?: string;
}

interface GaleryProps {
	image_from?: ImageSource[];
	video_from?: VideoSource[];
	isPremium?: string;
}

interface ImageMedia {
	type: 'image';
	src: string;
	alt: string;
	fit: string;
}

interface VideoMedia {
	type: 'video';
	src: string;
	thumb: string;
	videoType: string;
}

interface GaleryProps {
	image_from?: ImageSource[];
	video_from?: VideoSource[];
	isPremium?: string;
}

type MediaItem = ImageMedia | VideoMedia;

export default function Galery({ image_from = [], video_from = [], isPremium }: GaleryProps) {
	const [index, setIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const videoRef = useRef<HTMLVideoElement | null>(null);

	const media: MediaItem[] = useMemo(() => {
		const items: MediaItem[] = [];

		if (video_from?.length) {
			items.push({
				type: "video",
				src: video_from[0].src,
				thumb: video_from[0].thumb,
				videoType: video_from[0].type || "video/mp4",
			});
		}

		image_from.forEach((img) =>
			items.push({ type: "image", src: img.src, alt: img.alt, fit: img.fit })
		);

		return items;
	}, [image_from, video_from]);

	const current = media[index];

	// teclado ← →
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") next();
			if (e.key === "ArrowLeft") prev();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [media.length]);

	const next = () => {
		videoRef.current?.pause();
		setIsPlaying(false);
		setIndex((i) => (i + 1) % media.length);
	};

	const prev = () => {
		videoRef.current?.pause();
		setIsPlaying(false);
		setIndex((i) => (i - 1 + media.length) % media.length);
	};

	return (
		<div className={`hidden ${isPremium} lg:block w-[514px] gap-4 sticky top-24 self-start`}>
			{/* Mídia principal */}
			<div className="w-[514px] h-[514px] rounded-lg overflow-hidden">
				{current?.type === "image" && (
					<Image
						src={current.src}
						alt={current.alt}
						width={514}
						height={514}
						className={`w-full h-full ${current.fit === "cover" ? "object-cover" : "object-contain"} cursor-pointer`}
					/>
				)}

				{current?.type === "video" && (
					<VideoPlayer
						src={current.src}
						thumb={current.thumb}
						videoType={current.videoType}
					/>
				)}
			</div>

			{/* Navegação + thumbs */}
			<div className="flex pt-4 justify-center items-center gap-2">
				<button onClick={prev} className="cursor-pointer">
					<ImageNav src="/icons/arrow-left-blue.svg" />
				</button>

				<div className="flex gap-4">
					{media.map((item, i) => (
						<button
							key={i}
							onClick={() => {
								videoRef.current?.pause();
								setIsPlaying(false);
								setIndex(i);
							}}
							className={`w-[5rem] h-[5rem] border-2 rounded-md overflow-hidden relative cursor-pointer ${i === index ? "border-blue-950" : "border-[#9CA3AF]"}`}>
							{item.type === "image" ? (
								<Image
									src={item.src}
									alt={item.alt}
									width={80}
									height={80}
									className={`w-full h-full ${item.fit === "cover" ? "object-cover" : "object-contain"} cursor-pointer`}
								/>
							) : (
								<>
									<Image
										src={item.thumb}
										alt="video thumb"
										width={80}
										height={80}
										className="w-full h-full object-cover"
									/>
									<div className="absolute inset-0 flex items-center justify-center">
										<Image
											src="/icons/liquid-glass-button.png"
											alt="Play"
											width={30}
											height={30}
										/>
									</div>
								</>

							)}
						</button>
					))}
				</div>

				<button onClick={next} className="cursor-pointer">
					<ImageNav src="/icons/arrow-rigth-blue.svg" />
				</button>
			</div>
		</div>
	);
}