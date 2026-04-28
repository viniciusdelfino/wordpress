"use client";

import React, { useEffect, useState } from "react";
import { wordpressAPI } from "@/app/lib/wordpress-api";
import Image from "next/image";

export const Loading = () => {
  const [siteInfo, setSiteInfo] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteData] = await Promise.all([wordpressAPI.getSiteInfo()]);
        setSiteInfo(siteData);
      } catch (error) {
        console.error("Error fetching header data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[60vh] py-12 bg-gray-100">
        <div className="animate-pulse flex flex-col items-center justify-center space-y-4">
          {siteInfo?.logo ? (
            <Image
              src={siteInfo.logo.url}
              width={siteInfo.logo.width}
              height={siteInfo.logo.height}
              alt={siteInfo.logo.alt || siteInfo.name || "Moove"}
              className="h-10 w-[8.125rem] md:w-[9.25rem] xxl:w-auto object-contain"
            />
          ) : (
            <Image
              src="/images/logo-moove.png"
              alt="Carregando..."
              width={147}
              height={40}
              className="h-10 w-auto object-contain opacity-90 p-2"
            />
          )}
        </div>
      </div>
    );
  }

  return null;
};
