import React from "react";

import Image from "next/image";

export default function NoResultsBlog() {
    return (
        <div className="w-full flex flex-col gap-6 items-center justify-center p-[16px]">
            <Image src="/images/no_results_ico.svg" alt="no retults" width={80} height={80} />
            <span className="flex flex-col gap-3 items-ceter text-center">
                <h3 className="text-xl lg:text-3xl text-[#374151] font-semibold">Não encontramos conteúdos</h3>
                <p className="text-base md:text-lg">Você pode tentar outra combinação de filtros ou navegar por segmentos</p>
            </span>
        </div>
    )
}