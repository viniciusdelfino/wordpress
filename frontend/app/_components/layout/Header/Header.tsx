"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { wordpressAPI } from "@/app/lib/wordpress-api";
import { MenuItem } from "@/app/types/settings";
import Button from "../../ui/Button/Button";
import TopHeader from "./TopHeader";
import Menu from "../../menu/Menu";
import MenuChildren from "../../menu/MenuChildren";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface HeaderProps {
  menuName?: string;
  topMenuName?: string;
  showVehicleCheck?: boolean;
  className?: string;
}

export default function Header({
  menuName = "menu-principal",
  topMenuName = "top-header",
  className = "",
}: HeaderProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [topMenuItems, setTopMenuItems] = useState<MenuItem[]>([]);
  const [siteInfo, setSiteInfo] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [userOpenedDesktopMenu, setUserOpenedDesktopMenu] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsSearching(false);
  }, [pathname, searchParams]);

  function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();

    if (!query.trim()) return;

    setIsSearching(true);
    router.push(`/busca?q=${query}`);
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > 150) {
        setIsScrolled(true);
      } else if (currentScroll < 80) {
        setIsScrolled(false);
        setIsDesktopMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDesktopMenuToggle = () => {
    setIsDesktopMenuOpen((prev) => {
      const newState = !prev;
      setUserOpenedDesktopMenu(newState);
      return newState;
    });
  };

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;

    if (isMobileMenuOpen && isMobile) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "";
    }
    return () => {
      document.body.style.overflowY = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuData, topMenuData, siteData, segmentData] = await Promise.all([
          wordpressAPI.getMenuByName(menuName),
          wordpressAPI.getMenuByName(topMenuName),
          wordpressAPI.getSiteInfo(),
          wordpressAPI.getProductSegments(),
        ]);

        const segments = Array.isArray(segmentData)
          ? segmentData
          : Array.isArray((segmentData as any)?.data)
            ? (segmentData as any).data
            : [];

        const normalizeSegmentValue = (value?: string): string | undefined => {
          if (!value) return undefined;
          const normalized = decodeURIComponent(value)
            .toLowerCase()
            .replace(/^\/+|\/+$/g, "")
            .trim();

          return normalized || undefined;
        };

        const extractFirstPathSegment = (path?: string): string | undefined => {
          if (!path) return undefined;

          const cleanPath = path
            .split("?")[0]
            .split("#")[0]
            .replace(/^\/+/, "");

          const first = cleanPath.split("/")[0];
          return normalizeSegmentValue(first);
        };

        const segmentAliasMap = new Map<string, string>();

        segments.forEach((segment: any) => {
          const canonicalSlug =
            normalizeSegmentValue(segment?.frontend_slug) ||
            normalizeSegmentValue(segment?.route_slug) ||
            normalizeSegmentValue(segment?.slug) ||
            extractFirstPathSegment(segment?.url || segment?.path || segment?.link);

          const rawSlug = normalizeSegmentValue(segment?.slug);

          if (canonicalSlug) {
            segmentAliasMap.set(canonicalSlug, canonicalSlug);
          }

          if (rawSlug && canonicalSlug) {
            segmentAliasMap.set(rawSlug, canonicalSlug);
          }
        });

        const normalizeSegment = (segment?: string): string | undefined => {
          const normalized = normalizeSegmentValue(segment);
          if (!normalized) return undefined;

          return segmentAliasMap.get(normalized) || normalized;
        };

        const getSegmentFromPath = (
          path?: string,
        ): string | undefined => {
          if (!path) return undefined;
          const firstSegment = path
            .split("?")[0]
            .split("#")[0]
            .replace(/^\/+/, "")
            .split("/")[0]
            ?.toLowerCase();

          return normalizeSegment(firstSegment);
        };

        const getImageUrl = (imageField: any): string | undefined => {
          if (!imageField) return undefined;
          if (typeof imageField === "string") return imageField;
          if (typeof imageField === "object" && typeof imageField.url === "string") {
            return imageField.url;
          }
          return undefined;
        };

        const formatUrl = (
          rawUrl: string | undefined,
          parentSegment?: string,
        ): string => {
          if (
            !rawUrl ||
            rawUrl === "#" ||
            rawUrl.startsWith("mailto:") ||
            rawUrl.startsWith("tel:")
          ) {
            return rawUrl || "#";
          }

          let normalizedUrl = rawUrl.trim();

          if (normalizedUrl.startsWith("localhost:")) {
            normalizedUrl = `http://${normalizedUrl}`;
          }

          let pathname = normalizedUrl;
          let search = "";
          let hash = "";

          try {
            const parsedUrl = new URL(normalizedUrl, "http://localhost");
            pathname = parsedUrl.pathname;
            search = parsedUrl.search;
            hash = parsedUrl.hash;
          } catch {
            pathname = normalizedUrl;
          }

          let cleanPath = pathname
            .replace(/^\/+/, "/")
            .replace(/^\/moove\/backend/i, "")
            .replace(/^\/backend/i, "")
            .replace(/\/+/g, "/");

          if (!cleanPath.startsWith("/") && !cleanPath.startsWith("#")) {
            cleanPath = `/${cleanPath}`;
          }

          // Mapeamento de taxonomias editoriais para rotas do Blog.
          // Específico primeiro para evitar match parcial pelo genérico.
          cleanPath = cleanPath
            .replace(/\/editorial\/mobil-industria\//gi, "/blog/mobil-industrial/")
            .replace(/\/editorial\/guia-do-oleo\//gi, "/blog/guia-do-oleo/")
            .replace(/\/editorial\//gi, "/blog/");

          const normalizedParentSegment = normalizeSegment(parentSegment);

          if (normalizedParentSegment && /^\/aplicacoes\//i.test(cleanPath)) {
            cleanPath = cleanPath.replace(
              /^\/aplicacoes\/(.+)$/i,
              `/${normalizedParentSegment}/$1`,
            );
          }

          return `${cleanPath}${search}${hash}`;
        };

        // Processa recursivamente os itens do menu mantendo contexto do segmento pai.
        const processMenu = (
          items: any[],
          parentSegment?: string,
        ): MenuItem[] => {
          if (!items || !Array.isArray(items)) return [];

          return items.map((item) => {
            const formattedPath = formatUrl(item.path || item.url, parentSegment);
            const formattedUrl = formatUrl(item.url || item.path, parentSegment);

            // Normaliza o repetidor related_images (verifica top-level e acf.related_images)
            const rawRelatedImages = Array.isArray(item.related_images)
              ? item.related_images
              : Array.isArray(item.acf?.related_images)
                ? item.acf.related_images
                : null;

            const relatedImages = rawRelatedImages
              ? rawRelatedImages.map((ri: any) => {
                  const imgUrl = getImageUrl(ri.menu_image);
                  const rawLink = ri?.link;
                  const normalizedLink =
                    typeof rawLink === "string"
                      ? rawLink
                      : typeof rawLink?.url === "string"
                        ? rawLink.url
                        : "";

                  return {
                    menu_image: imgUrl
                      ? {
                          url: imgUrl,
                          alt: typeof ri.menu_image === "object" ? ri.menu_image?.alt || "" : "",
                          width: typeof ri.menu_image === "object" ? ri.menu_image?.width || 400 : 400,
                          height: typeof ri.menu_image === "object" ? ri.menu_image?.height || 125 : 125,
                        }
                      : null,
                    add_label: Boolean(ri.add_label),
                    label: ri.label || "",
                    link: normalizedLink,
                  };
                })
              : undefined;

            const currentSegment =
              getSegmentFromPath(formattedPath) ||
              getSegmentFromPath(formattedUrl) ||
              normalizeSegment(parentSegment);

            return {
              ...item,
              url: formattedUrl,
              path: formattedPath,
              related_images: relatedImages,
              children: item.children
                ? processMenu(item.children, currentSegment)
                : undefined,
            };
          });
        };

        setMenuItems(processMenu(menuData));
        setTopMenuItems(processMenu(topMenuData));
        setSiteInfo(siteData);
      } catch (error) {
        console.error("Error fetching header data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [menuName, topMenuName]);

  if (loading) {
    return (
      <header className={`sticky top-0 z-50 w-full flex flex-col ${className}`}>
        <div className="hidden lg:block h-9 w-full bg-dark-blue animate-pulse"></div>
        <div className="w-full border-b border-gray-200 bg-white">
          <div className="container px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="hidden md:flex gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-6 w-20 bg-gray-200 rounded animate-pulse"
                  ></div>
                ))}
              </div>
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`sticky top-0 z-50 w-full flex flex-col ${className}`}>
      <TopHeader isScrolled={isScrolled} />
      <div
        className={`w-full transition-colors duration-500 relative bg-white`}
      >
        <div className={`container mx-auto ${isMobileMenuOpen ? "bg-white" : ""}`}>
          <div className="flex flex-wrap items-center justify-between lg:justify-start gap-y-4 py-4 lg:flex-nowrap">
            {/* Logo & Menu Wrapper */}
            <div
              className={`flex items-center lg:pr-8 min-[1340px]:lg:pr-[15px] ${isMobileMenuOpen ? "w-full justify-between order-1" : "gap-x-2 order-1 lg:order-1"} shrink-0`}
            >
              {/* Menu Icon */}
              <div
                className={`lg:hidden shrink-0 ${isMobileMenuOpen ? "order-2" : "order-1"} ${activeSubmenu ? "hidden" : "flex"}`}
              >
                <button
                  onClick={() => {
                    setIsMobileMenuOpen((prev) => !prev);
                    if (isMobileMenuOpen) setActiveSubmenu(null);
                  }}
                >
                  {isMobileMenuOpen ? (
                    <Image
                      src="/icons/close.svg"
                      width={15}
                      height={20}
                      alt="Fechar menu"
                    />
                  ) : (
                    <Image
                      src="/icons/menu.svg"
                      width={22}
                      height={12}
                      alt="Fechar menu"
                    />
                  )}
                </button>
              </div>

              {/* Menu Sanduíche - Desktop */}
              <div
                className={`shrink-0 items-center hidden ${isScrolled ? "lg:order-1 lg:flex" : ""}`}
              >
                <button
                  className="cursor-pointer"
                  onClick={handleDesktopMenuToggle}
                >
                  {isDesktopMenuOpen ? (
                    <Image
                      src="/icons/close.svg"
                      width={20}
                      height={12}
                      alt="Fechar menu"
                    />
                  ) : (
                    <Image
                      src="/icons/menu.svg"
                      width={22}
                      height={12}
                      alt="Fechar menu"
                    />
                  )}
                </button>
              </div>

              <div
                className={`shrink-0 ${isMobileMenuOpen ? "order-1" : "order-2"} ${activeSubmenu ? "hidden lg:block" : ""}`}
              >
                <Link href="/">
                  {siteInfo?.logo ? (
                    <Image
                      src={siteInfo.logo.url}
                      width={siteInfo.logo.width}
                      height={siteInfo.logo.height}
                      alt={siteInfo.logo.alt || siteInfo.name || "Moove"}
                      className="h-[1.5rem] lg:h-[36px] w-[115px] sm:w-[142px] lg:w-[214px] object-contain"
                    />
                  ) : (
                    <span className="text-xl font-bold">
                      {siteInfo?.name || "Moove"}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            <div
              className={`search-form-header order-last w-full lg:flex-1 lg:w-auto lg:order-3 lg:pr-6 min-[1340px]:lg:pr-[38px] ${isMobileMenuOpen ? "hidden lg:block" : ""}`}
            >

              <form className="flex w-full rounded-lg border border-gray overflow-hidden h-[42px] lg:w-full min-[1340px]:lg:w-[504px] items-center pr-2 lg:pr-1" onSubmit={handleSearch}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por produto, matéria..."
                  className="flex-1 px-4 outline-none placeholder:text-medium-gray placeholder:text-sm"
                />
                <Button
                  type="submit"
                  color="dark-blue"
                  // Troca o ícone ou desabilita o botão
                  icon={isSearching ? undefined : "/icons/search.svg"}
                  iconPosition="left"
                  iconSize={18}
                  disabled={isSearching}
                  className="px-4 text-sm h-[2.125rem] min-w-[90px] flex items-center justify-center"
                >
                  {isSearching ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Buscar"
                  )}
                </Button>
              </form>

            </div>

            <div className={`order-3 hidden md:block lg:order-4 ${isMobileMenuOpen ? "w-full" : " "} shrink-0 lg:pr-4 min-[1340px]:lg:pr-[16px]`}>
              <Link
                href={siteInfo?.options?.header?.button_smart_mobil?.url || "#"}
                target={
                  siteInfo?.options?.header?.button_smart_mobil?.target || ""
                }
                className="cursor-pointer border border-dark-blue w-full px-2 text-base lg:w-auto lg:px-4 min-[1340px]:lg:w-[226px] min-[1340px]:lg:px-2 rounded-sm flex items-center justify-center gap-x-2 h-10 text-dark-blue"
              >
                <Image
                  src="/icons/smart-change-2.svg"
                  width={18}
                  height={18}
                  alt="Troca Inteligente"
                />
                {siteInfo?.options?.header?.button_smart_mobil?.title ||
                  "Troca Inteligente Mobil™ "}
              </Link>
            </div>

            <div
              className={`find-oil order-3 md:order-4 lg:order-5 lg:w-auto shrink-0 transition-all duration-500 ease-in-out flex items-center justfy-center ${isMobileMenuOpen ? "w-full" : ""
                } ${activeSubmenu ? "hidden lg:flex" : ""}`}
            >
              <Link
                href={siteInfo?.options?.header?.button_find_oil?.url || "#"}
                target={
                  siteInfo?.options?.header?.button_find_oil?.target || ""
                }
                className={`button-link ${isMobileMenuOpen ? "w-full" : ""}`}
              >
                <Button
                  color="red"
                  icon="/icons/oil-top.png"
                  iconPosition="left"
                  iconSize={18}
                  className={`cursor-pointer text-sm md:text-base px-2 sm:px-4 md:px-0 ${isMobileMenuOpen ? "h-[43px]" : "h-[34px]"} md:h-[40px] flex items-center justify-center gap-2 rounded-md font-medium w-full whitespace-nowrap md:min-w-[12.625rem] px-[0.4375rem] sm:px-2 md:px-4`}
                >
              
                  Encontre o Óleo Ideal
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Navegação Mobile */}
        {menuItems.length > 0 && (
          <div
            className={`lg:hidden absolute left-0 right-0 w-full h-[calc(100vh-100%)] bg-white z-50 overflow-hidden transition-transform duration-500 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} ${activeSubmenu ? "top-0" : "top-full"}`}
          >
            <Menu
              items={menuItems}
              topItems={topMenuItems}
              isSubmenuActive={!!activeSubmenu}
              onSubmenuSelect={(id) => setActiveSubmenu(id)}
              onClose={() => setIsMobileMenuOpen(false)}
            />

            <MenuChildren
              isOpen={!!activeSubmenu}
              title={
                menuItems.find((i: any) => (i.id || i.ID) === activeSubmenu)
                  ?.title || ""
              }
              items={
                menuItems.find((i: any) => (i.id || i.ID) === activeSubmenu)
                  ?.children || []
              }
              related_images={
                menuItems.find((i: any) => (i.id || i.ID) === activeSubmenu)
                  ?.related_images
              }
              onBack={() => setActiveSubmenu(null)}
              onClose={() => {
                setIsMobileMenuOpen(false);
                setActiveSubmenu(null);
              }}
            />
          </div>
        )}
      </div>

      {/* Desktop Menu */}
      <div
        className={`hidden lg:block w-full bg-neutral border-b border-gray-200 transition-all duration-300 overflow-hidden ${!isScrolled || isDesktopMenuOpen
          ? "max-h-20 opacity-100"
          : "max-h-0 opacity-0 pointer-events-none"
          }`}
      >
        <div className="container">
          <nav className="flex gap-8 justify-between min-h-10">
            {menuItems.map((item: any) => (
              <div
                key={item.id || item.ID}
                className="group flex items-center"
                onMouseEnter={() => setHoveredItem(item.id || item.ID)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href={item.path || item.url}
                  className={`flex items-center gap-x-4 font-semibold text-base whitespace-nowrap ${hoveredItem === (item.id || item.ID) ? "text-dark-blue" : "text-low-dark-blue"}`}
                >
                  {item.title}
                  {item.children && item.children.length > 0 && (
                    <Image
                      src="/icons/arrow-down.svg"
                      width={10}
                      height={6}
                      alt=""
                      className={`transition-transform duration-300 ${hoveredItem === (item.id || item.ID) ? "rotate-180" : ""
                        }`}
                    />
                  )}
                </Link>

                {/* Submenu Overlay */}
                {item.children &&
                  item.children.length > 0 &&
                  hoveredItem === (item.id || item.ID ) && (
                    <div className="absolute left-0 top-full w-full bg-white border-t border-gray-100 shadow-lg pt-5 lg:pt-4 z-50 h-[332px] -mt-[1px] overflow-hidden">
                      <div className="container flex gap-8 lg:justify-between">
                        <div className={item.children.length <= 3
                          ? "flex flex-col gap-y-2 py-5 max-h-[320px] max-w-[42rem] overflow-y-auto custom-scroll pr-4"
                          : "grid grid-cols-2 lg:gap-x-4 gap-y-4 py-5 content-start max-h-[320px] max-w-[42rem] overflow-y-auto custom-scroll pr-4"
                        }>
                          {item.children.map((child: any) => (
                            <Link
                              key={child.id || child.ID}
                              href={child.path || child.url}
                              className="flex flex-col p-2 hover:bg-transparent-gray transition-colors duration-300 rounded-lg lg:max-w-[328px]"
                            >
                              <span className="font-semibold text-dark-blue">
                                {child.title}
                              </span>
                              {child.description && (
                                <span className="text-sm text-dark-gray">
                                  {child.description}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                        {item.related_images && item.related_images.length > 0 ? (
                          <div className={`flex flex-col gap-4 ${item.related_images.length === 1 ? "w-1/4 shrink-0 lg:w-auto" : ""}`}>
                            {item.related_images.map((ri: any, idx: number) => (
                              <div
                                key={idx}
                                className={`relative overflow-hidden rounded-lg lg:min-w-[24.25rem] ${item.related_images.length > 1 ? "h-[125px]" : "h-auto lg:h-[300px]"}`}
                              >
                                {ri.menu_image?.url && (
                                  ri?.link ? (
                                    <Link href={ri.link} className="block cursor-pointer h-full relative">
                                      <Image
                                        src={ri.menu_image.url}
                                        width={ri.menu_image.width || 400}
                                        height={ri.menu_image.height || (item.related_images.length > 1 ? 125 : 400)}
                                        alt={ri.menu_image.alt || item?.title}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 linear-gradient-bg-3 pointer-events-none" />
                                      {ri.add_label && ri.label && (
                                        <div className="absolute bottom-0 left-0 w-full flex items-center justify-between p-4 text-white text-xl z-10 pointer-events-none">
                                          <span>{ri.label}</span>
                                          <Image
                                            src="/icons/plus.svg"
                                            width={32}
                                            height={32}
                                            alt=""
                                          />
                                        </div>
                                      )}
                                    </Link>
                                  ) : (
                                    <div className="h-full relative">
                                      <Image
                                        src={ri.menu_image.url}
                                        width={ri.menu_image.width || 400}
                                        height={ri.menu_image.height || (item.related_images.length > 1 ? 125 : 400)}
                                        alt={ri.menu_image.alt || item?.title}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 linear-gradient-bg-3 pointer-events-none" />
                                      {ri.add_label && ri.label && (
                                        <div className="absolute bottom-0 left-0 w-full flex items-center justify-between p-4 text-white text-xl z-10 pointer-events-none">
                                          <span>{ri.label}</span>
                                          <Image
                                            src="/icons/plus.svg"
                                            width={32}
                                            height={32}
                                            alt=""
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          item?.menu_image && (
                            <div className="w-1/4 shrink-0 lg:w-auto">
                              <Image
                                src={item?.menu_image}
                                width={400}
                                height={400}
                                alt={item?.title}
                                className="w-full h-auto object-cover rounded-lg lg:min-w-[24.25rem] lg:h-[18.75rem]"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
