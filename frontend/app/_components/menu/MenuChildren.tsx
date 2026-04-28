"use client";

import Image from "next/image";
import Link from "next/link";

interface RelatedImage {
  menu_image: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  } | null;
  add_label?: boolean;
  label?: string;
  link?: string;
}

interface MenuChildrenProps {
  isOpen: boolean;
  title: string;
  related_images?: RelatedImage[];
  items: any[];
  onBack: () => void;
  onClose: () => void;
}

export default function MenuChildren({
  isOpen,
  title,
  related_images,
  items,
  onBack,
  onClose,
}: MenuChildrenProps) {
  return (
    <div
      className={`menu-children absolute inset-0 w-full h-full bg-white overflow-y-auto transition-transform duration-500 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
        }`}
    >
      {isOpen && (
        <div className="flex flex-col min-h-full bg-white px-4 pb-2 px-[16px] md:px-[60px]">
          <div className="flex items-center justify-between pt-4 sticky top-0 pb-[24px]">
            <button
              onClick={onBack}
              className="flex items-center text-xl font-medium text-gray-600 hover:text-red-600"
            >
              <Image
                src="/icons/arrow-left-2.svg"
                width={16}
                height={16}
                alt="Fechar menu"
              />
              <span className="font-semibold text-gray-900 ml-2">{title}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <Image
                src="/icons/close.svg"
                width={12}
                height={14}
                alt="Fechar menu"
              />
            </button>
          </div>
          <nav className="flex flex-col p-2 gap-y-6 overflow-y-auto custom-scroll max-h-[60vh]">
            {items.map((child: any) => (
              <div key={child.id || child.ID}>
                <Link
                  href={child.path || child.url}
                  className="block font-semibold text-dark-blue"
                  onClick={onClose}
                >
                  {child.title}
                </Link>

                {child.description && (
                  <p className="text-sm text-dark-gray">
                    {child.description}
                  </p>
                )}
              </div>
            ))}
          </nav>

          {related_images && related_images.length > 0 && (
            <div className="w-full flex flex-col gap-4 mt-4">
              {related_images.map((ri, index) => {
                const isMultiple = related_images.length > 1;

                return (
                  <div
                    key={index}
                    className={`relative overflow-hidden ${isMultiple ? "rounded-xl" : "rounded-lg"} ${related_images.length > 1 ? "h-[125px]" : "h-auto lg:h-[300px]"}`}
                  >
                    {ri.menu_image?.url && (
                      ri.link ? (
                        <Link href={ri.link} className="block h-full relative" onClick={onClose}>
                          <Image
                            src={ri.menu_image.url}
                            width={ri.menu_image.width || 400}
                            height={ri.menu_image.height || (isMultiple ? 125 : 244)}
                            alt={ri.menu_image.alt || title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 linear-gradient-bg-3 pointer-events-none" />
                          {ri.add_label && ri.label && (
                            <div className="absolute bottom-0 left-0 w-full flex items-center justify-between p-4 text-white text-xl z-10 pointer-events-none">
                              <span>{ri.label}</span>
                              <Image src="/icons/plus.svg" width={32} height={32} alt="" />
                            </div>
                          )}
                        </Link>
                      ) : (
                        <div className="h-full relative">
                          <Image
                            src={ri.menu_image.url}
                            width={ri.menu_image.width || 400}
                            height={ri.menu_image.height || (isMultiple ? 125 : 244)}
                            alt={ri.menu_image.alt || title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 linear-gradient-bg-3 pointer-events-none" />
                          {ri.add_label && ri.label && (
                            <div className="absolute bottom-0 left-0 w-full flex items-center justify-between p-4 text-white text-xl z-10 pointer-events-none">
                              <span>{ri.label}</span>
                              <Image src="/icons/plus.svg" width={32} height={32} alt="" />
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
