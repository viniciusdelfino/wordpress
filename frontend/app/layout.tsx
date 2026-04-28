import type { Metadata } from "next";
import "./main.css";
import { wordpressAPI } from "./lib/wordpress-api";
import Header from "./_components/layout/Header/Header";
import Footer from "./_components/layout/Footer/Footer";
import CookieBanner from "./_components/layout/CookieBanner";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const siteInfo = await wordpressAPI.getSiteInfo();
  return {
    description: siteInfo?.description || "",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <head></head>
      <body className="font-emprint" suppressHydrationWarning>
        <Suspense fallback={<div className="w-full"/>}>
          <Header />
        </Suspense>
        <main>
          {children}
          <CookieBanner />
        </main>
        <Footer />
      </body>
    </html>
  );
}
