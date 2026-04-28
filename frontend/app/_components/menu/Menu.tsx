"use client";

import Image from "next/image";
import Link from "next/link";

interface MenuProps {
  items: any[];
  topItems?: any[];
  isSubmenuActive: boolean;
  onSubmenuSelect: (id: number) => void;
  onClose: () => void;
}

export default function Menu({
  items,
  topItems,
  isSubmenuActive,
  onSubmenuSelect,
  onClose,
}: MenuProps) {
  return (
    <div
      className={`flex flex-col justify-between absolute inset-0 w-full h-full bg-white overflow-y-auto transition-transform duration-500 ease-in-out pt-8 ${
        isSubmenuActive ? "-translate-x-full" : "translate-x-0"
      }`}
    >
      <nav className="flex flex-col px-2 gap-y-12 pb-6 px-[16px] md:px-[60px]">
        {items.map((item: any) => (
          <div key={item.id || item.ID}>
            {item.children && item.children.length > 0 ? (
              <button
                onClick={() => onSubmenuSelect(item.id || item.ID)}
                className="flex items-center justify-between w-full text-dark-blue font-semibold"
              >
                {item.title}
                <svg
                  className="w-10 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ) : (
              <li className="list-none">
                <Link
                  href={item.path || item.url}
                  className="block py-4 text-dark-blue font-semibold"
                  onClick={onClose}
                >
                  {item.title}
                </Link>
              </li>
            )}
          </div>
        ))}
      </nav>
      {topItems && topItems.length > 0 && (
        <div className="flex flex-col p-4 bg-dark-blue gap-y-5 px-[16px] md:px-[60px]">
          {topItems.map((item: any) => {
            const iconUrl = (item as any).icon;
            return(
              <Link
                key={item.id || item.ID}
                href={item.path || item.url}
                className="flex gap-x-2 items-center justify-left w-full text-white text-base text-center"
                onClick={onClose}
              >
                {iconUrl && (
                  <Image
                    src={iconUrl}
                    width={18}
                    height={18}
                    alt=""
                    className="object-contain"
                  />
                )}
                {item.title}
              </Link>
            )
})}
        </div>
      )}
    </div>
  );
}
