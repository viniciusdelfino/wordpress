"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

interface VideoPlayerProps {
    src: string;
    thumb: string;
    videoType?: string;
    className?: string;
}

export default function VideoPlayer({ 
    src, 
    thumb, 
    videoType = "video/mp4", 
    className = "" 
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    };

    return (
        <div className={`relative w-full h-full rounded-lg overflow-hidden ${className}`}>
            {/* Overlay de Play (Só aparece se não estiver tocando) */}
            {!isPlaying && (
                <div
                    className="absolute inset-0 bg-blue-950/60 flex items-center justify-center cursor-pointer z-10"
                    onClick={() => videoRef.current?.play()}
                >
                    <Image
                        src="/icons/liquid-glass-button.png"
                        alt="Play"
                        width={92}
                        height={92}
                    />
                </div>
            )}

            <video
                ref={videoRef}
                key={src} // Força o reload do vídeo se o SRC mudar
                poster={thumb}
                className="w-full h-full object-cover cursor-pointer"
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
            >
                <source src={src} type={videoType} />
                Seu navegador não suporta vídeos.
            </video>
        </div>
    );
}