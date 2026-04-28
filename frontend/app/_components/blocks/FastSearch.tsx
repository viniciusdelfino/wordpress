import React from "react";
import Image from "next/image";
import Link from "next/link";

interface FastSearchProps {
  image?: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  image_mobile?: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  desc?: string;
  list?: {
    text: string;
  }[];
  quote?: string;
  botao?: {
    title: string;
    url: string;
    target: string;
  };
}

export default function FastSearch({
  image,
  image_mobile,
  desc,
  list,
  quote,
  botao,
}: FastSearchProps) {
  return (
    <section className="fast-search py-10 md:py-15 lg:py-20">
      <div className="container flex flex-col lg:flex-row lg:gap-x-12 gap-y-12">
        {image && (
          <>
            <div className="hidden md:block lg:hidden relative h-[26.875rem] w-full lg:w-[435px] mx-auto">
              <div className="absolute bottom-0 w-full h-[319px] bg-gradient-to-b from-[#001450] to-[#0C479D] rounded-2xl"></div>
              <Image
                src={image.url}
                alt={image.alt || ""}
                width={image.width}
                height={image.height}
                className="absolute bottom-0 left-0 w-full h-full object-contain"
              />
            </div>
            <div className="hidden lg:block relative w-[430px] h-[425px] shrink-0">
              <div className="absolute bottom-0 w-full h-[319px] bg-gradient-to-b from-[#001450] to-[#0C479D] rounded-2xl"></div>
              <Image
                src={image.url}
                alt={image.alt || ""}
                width={image.width}
                height={image.height}
                className="absolute bottom-0 left-0 w-full h-full object-contain"
              />
            </div>
          </>
        )}
        {image_mobile && (
          <div className="md:hidden">
            <Image
              src={image_mobile.url}
              alt={image_mobile.alt || ""}
              width={image_mobile.width}
              height={image_mobile.height}
              className="w-full object-contain h-[21.8125rem] md:h-[26.875rem]"
            />
          </div>
        )}
        <div className="flex flex-col gap-y-6 lg:justify-center lg:max-w-[48.5625rem]">
          {desc && (
            <div
              dangerouslySetInnerHTML={{ __html: desc }}
              className="prose-headings:text-2xl prose-headings:font-semibold prose-headings:text-dark-blue prose-headings:mb-[1.4375rem] md:prose-headings:text-[1.75rem] prose-p:text-base md:prose-p:text-lg prose-p:text-[#4D555B]"
            />
          )}

          {list && list.length > 0 && (
            <ul className="flex flex-col gap-y-4 text-[#333333] text-base md:text-lg">
              {list.map((item, index) => (
                <li key={index} className="flex flex-row items-center gap-x-2">
                  <Image
                    src="/icons/check_3.svg"
                    width={24}
                    height={24}
                    alt="Check"
                  />
                  {item.text}
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-y-4">
            {quote && <p className="text-[#4D555B] md:text-lg">{quote}</p>}
            {botao && (
              <Link
                href={botao.url}
                target={botao.target || "_self"}
                className="bg-red text-white text-sm md:text-base rounded-sm flex flex-row gap-x-2 items-center justify-center h-10 md:w-[20.375rem]"
              >
                <Image
                  src="/icons/whatsapp.svg"
                  width={18}
                  height={18}
                  alt="Check"
                />
                {botao.title}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
