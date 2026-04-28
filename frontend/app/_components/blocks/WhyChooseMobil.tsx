import React from "react";
import Image from "next/image";

interface WhyChooseMobilProps {
  title?: string;
  list?: {
    icon: {
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    title: string;
    desc: string;
  }[];
}
 
export default function WhyChooseMobil({ title, list }: WhyChooseMobilProps) {
  return (
    <section className="why-choose-mobil py-10 md:py-12 lg:py-20">
      <div className="container grid grid-cols-12 gap-y-6 md:gap-y-8 lg:gap-y-10">
        <div className="col-span-12">
            {title && <h3 className="font-bold text-dark-blue text-2xl md:text-[28px] lg:text-[32px]">{title}</h3>}
        </div>

        {list && list.length > 0 && (
            <div className="col-span-12 grid grid-cols-12 md:grid-cols-8 lg:grid-cols-12 gap-y-6 md:gap-x-6">
                {list.map((item, index) => (
                    <div
                        key={index}
                        className={`col-span-12 ${
                          index === 2 ? "md:col-span-8" : "md:col-span-4"
                        } lg:col-span-4 border border-[#9CA3AF] rounded-lg p-4`}
                    >
                        <div className="flex flex-row items-center gap-x-4 lg:gap-x-6 mb-2 md:mb-6 ">
                            {item.icon && (
                                <Image
                                    src={item.icon.url}
                                    alt={item.icon.alt || ""}
                                    width={item.icon.width}
                                    height={item.icon.height}
                                    className="w-8 h-8 md:w-12 md:h-12 lg:w-[3.75rem] lg:h-[3.75rem]"
                                />
                            )}
                                {item.title && <h2 className="font-bold text-sm text-dark-blue md:text-base lg:text-[1.25rem]">{item.title}</h2>}
                        </div>
                        <div>
                            {item.desc && <p className="text-[#6D7280] leading-[1.625rem]">{item.desc}</p>}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
    </section>
  );
}