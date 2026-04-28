'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { wordpressAPI } from '@/app/lib/wordpress-api';
import { MenuItem } from '@/app/types/settings';

export default function TopHeader({isScrolled} : {isScrolled : boolean}) {
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchMenu = async () => {
      const data = await wordpressAPI.getMenuByName('top-header');
      setItems(data);
    };
    fetchMenu();
  }, []);

  if (items.length === 0) return null;

  return (
    <div className={`hidden lg:block bg-dark-blue text-white overflow-hidden transition-all duration-500 ease-in-out ${isScrolled ? 'h-0 opacity-0' : 'h-10 opacity-100'}`}>
      <div className="container py-2">
        <ul className="flex justify-end">
          {items.map((item, index) => {
            const iconUrl = (item as any).icon;
            return (
              <li key={index} className="border-r border-white/25 px-3 last:border-r-0">
                <Link href={item.url} className="flex items-center gap-2 text-base">
                  {iconUrl && (
                    <Image 
                      src={iconUrl} 
                      width={14} 
                      height={14} 
                      alt="" 
                      className="object-contain"
                    />
                  )}
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
