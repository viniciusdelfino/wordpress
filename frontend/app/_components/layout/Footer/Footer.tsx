"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { wordpressAPI } from "@/app/lib/wordpress-api";
import { MenuItem } from "@/app/types/settings";

export default function Footer() {
  const [mobilMenu, setMobilMenu] = useState<MenuItem[]>([]);
  const [institucionalMenu, setInstitucionalMenu] = useState<MenuItem[]>([]);
  const [siteInfo, setSiteInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mobilData, institucionalData, siteData] = await Promise.all([
          wordpressAPI.getMenuByName("mobil-no-brasil-rodape"),
          wordpressAPI.getMenuByName("institucional-rodape"),
          wordpressAPI.getSiteInfo(),
        ]);

        setMobilMenu(mobilData);
        setInstitucionalMenu(institucionalData);
        setSiteInfo(siteData);
      } catch (error) {
        console.error("Error fetching footer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <footer className="bg-dark-blue text-neutral relative mt-12 min-h-[400px]">
        <div className="container pt-20">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 w-1/4"></div>
            <div className="h-4 bg-gray-700 w-1/2"></div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-dark-blue text-neutral relative pb-6">
      <button
        onClick={scrollToTop}
        className={`fixed right-8 bottom-20 -translate-y-[1.25rem] z-40 bg-neutral rounded-full p-3 shadow-lg hover:bg-opacity-90 transition-all duration-300 w-16 h-16 flex justify-center items-center cursor-pointer ${
          showScrollTop ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        aria-label="Voltar ao topo"
      >
        <Image
          src="/icons/scroll-top.svg"
          width={12}
          height={18}
          alt="Scroll Top"
        />
      </button>

      <div className="absolute left-1/2 -translate-x-1/2 -top-0 -translate-y-[0.4rem] z-10">
        <Image
          src="/icons/oil_bottle.svg"
          width={130}
          height={45}
          alt="Rocket"
          className="object-contain"
        />
      </div>

      <div className="container pt-20">
        <div className="flex flex-col gap-y-6 md:gap-y-16 lg:grid lg:grid-cols-12 lg:justify-between lg:gap-x-10">
          <Link href="/" className="my-6 flex flex-col gap-y-6 lg:col-span-4 lg:mt-0">
            {siteInfo?.options?.footer?.logo_footer ? (
               <Image
                  src={siteInfo.options.footer.logo_footer.url}
                  alt={siteInfo.options.footer.logo_footer.alt}
                  width="240"
                  height="40"
            />
            ) : (
                  <span className="text-xl font-bold">
                    {"Logo Moove"}
                  </span>
                )}
            <p className="text-sm lg:max-w-sm">
              {siteInfo?.options?.footer?.desc_institucional}
            </p>
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 lg:gap-x-8 lg:col-span-6">
            {mobilMenu.length > 0 && (
              <div className="flex flex-col gap-y-6">
                <h3 className="font-semibold text-base lg:text-lg">Mobil no Brasil</h3>
                <ul className="flex flex-col gap-y-6">
                  {mobilMenu.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.path || item.url}
                        className="text-base lg:text-[1.0625rem] hover:border-b border-neutral"
                        target={item.target === '_blank' ? '_blank' : undefined}
                        rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {institucionalMenu.length > 0 && (
              <div className="flex flex-col gap-y-6">
                <h3 className="font-semibold text-base lg:text-lg">Institucional</h3>
                <ul className="flex flex-col gap-y-6">
                  {institucionalMenu.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.path || item.url}
                        className="hover:opacity-80 transition-opacity text-base lg:text-lg"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-y-6 lg:col-span-2 xxl:-ml-[1.4375rem]">
            <h4 className="font-semibold text-base lg:text-lg">Redes sociais</h4>
            <div className="flex gap-x-4">
              <a
                href={siteInfo?.options?.social_networks?.instagram?.url}
                target="_blank"
                rel="noopener noreferrer"
                className=""
              >
                <Image
                  src="/icons/instagram.svg"
                  width={24}
                  height={24}
                  alt="Moove"
                  className="w-6 h-6 object-contain max-w-fit"
                />
              </a>
              <a
                href={siteInfo?.options?.social_networks?.youtube?.url}
                target="_blank"
                rel="noopener noreferrer"                
              >
                <Image src="/icons/youtube.svg" width={32} height={24} alt="Moove" className="w-8 h-6 object-contain max-w-fit" />
              </a>
              <a
                href={siteInfo?.options?.social_networks?.facebook?.url}
                target="_blank"
                rel="noopener noreferrer"                
              >
                <Image
                  src="/icons/facebook.svg"
                  width={24}
                  height={24}
                  alt="Moove" 
                  className="w-6 h-6 object-contain max-w-fit"
                />
              </a>
              <a
                href={siteInfo?.options?.social_networks?.linkedin?.url}
                target="_blank"
                rel="noopener noreferrer"                
              >
                <Image
                  src="/icons/linkedin.svg"
                  width={24}
                  height={24}
                  alt="Moove" 
                  className="w-6 h-6 object-contain max-w-fit"
                />
              </a>
              <a
                href={siteInfo?.options?.social_networks?.tiktok?.url}
                target="_blank"
                rel="noopener noreferrer"                
              >
                <Image src="/icons/tiktok.svg" width={24} height={24} alt="Moove" className="w-6 h-6 object-contain max-w-fit" />
              </a>
            </div>
          </div>

        </div>

        <div className="border-t md:mt-8 md:mb-4 lg:mb-8 mt-6">
          <p className="pt-4 text-xs text-justify text-end text-transparent-gray-3">
            © {new Date().getFullYear()} {siteInfo?.options?.footer?.rights_reserved}
          </p> 
        </div>
        <Link
          href="https://pt.cadastra.com/"
          target="_blank"
          className="flex flex-row justify-end items-center gap-x-2 mt-4 lg:mt-6"
        >
          Developed by{" "}
          <Image
            src="/images/cadastra.svg"
            alt="Cadastra"
            width="80"
            height="12"
          />
        </Link>
      </div>
    </footer>
  );
}
