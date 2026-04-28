import React from "react";

import Image from "next/image";

interface InfoListProps {
    list_title: string;
    content?: string[];
}

export default function InfoList({ list_title, content }: InfoListProps) {
    if (!content || content.length === 0) {
        return null;
    }
    return (
        <div className="flex flex-col gap-2">
            <p className="font-semibold text-xl text-blue-950">{list_title}</p>
            <ul className="flex flex-col gap-4">
                {content.map((item, index) => (
                    <li key={index} className="flex gap-2 items-center">
                        <Image src="/icons/check_2.svg" alt="check" width={20} height={20} />
                        <p className="text-sm md:text-base text-slate-800">{item}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}