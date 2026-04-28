import React from "react";

import Image from "next/image";

export default function ImageNav(props){
    return (
        <span className="flex border-[1px] border-gray-600 w-[40px] h-[40px] rounded-md justify-center items-center">
            <Image src={props.src} alt="arrow" width={16} height={16}/>
        </span>
    )
}
