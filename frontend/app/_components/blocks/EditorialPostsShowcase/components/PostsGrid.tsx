"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import PostCard from "./PostCard";
import type { EbookDownloadData } from "./PostCard";
import EbookDownloadModal from "@/app/_components/features/EbookDownloadModal/EbookDownloadModal";
import type { ContentTypeOption, SortOption } from "../utils/postsFiltering";

type FormVariant = "industria" | "guia-oleo-frotas";

function resolveFormVariantFromPost(post: any): FormVariant {
  const termGroups = post?._embedded?.["wp:term"] || [];
  const flatTerms = Array.isArray(termGroups) ? termGroups.flat() : [];

  const allTermSlugs = flatTerms.map((t: any) => t?.slug?.toLowerCase()).filter(Boolean);
  const allTermNames = flatTerms.map((t: any) => t?.name?.toLowerCase()).filter(Boolean);

  const guiaOleoFrotasSlugs = ["guia-do-oleo", "mobil-frotas"];

  const hasGuiaOrFrotas =
    allTermSlugs.some((s: string) => guiaOleoFrotasSlugs.includes(s)) ||
    allTermNames.some((n: string) => guiaOleoFrotasSlugs.includes(n));

  if (hasGuiaOrFrotas) return "guia-oleo-frotas";

  // segmento_industrial, "mobil-industria", "conteudo" or anything else → industria
  return "industria";
}

interface PostsGridProps {
  posts: any[];
  emptyMessage?: string;
  useTabLayout?: boolean;
  activeContentType?: ContentTypeOption;
  sortBy?: SortOption;
  onContentTypeChange?: (contentType: ContentTypeOption) => void;
  onSortByChange?: (sortBy: SortOption) => void;
}

export default function PostsGrid({
  posts,
  emptyMessage = "Nenhum post encontrado.",
  useTabLayout = false,
  activeContentType = "todos",
  sortBy = "recente",
  onContentTypeChange,
  onSortByChange,
}: PostsGridProps) {
  const [localContentType, setLocalContentType] = useState<ContentTypeOption>(activeContentType);
  const [localSortBy, setLocalSortBy] = useState<SortOption>(sortBy);
  const hasPosts = Array.isArray(posts) && posts.length > 0;

  // Ebook modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    ebookName: string;
    ebookUrl: string;
    variant: FormVariant;
  } | null>(null);

  const handleDownloadClick = useCallback((data: EbookDownloadData) => {
    const variant = resolveFormVariantFromPost(data.post);
    setModalData({
      ebookName: data.fileName,
      ebookUrl: data.downloadUrl,
      variant,
    });
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setModalData(null);
  }, []);

  const renderEmptyState = (message: string) => (
    <div className="flex flex-col items-center justify-center rounded-lg px-6 py-10 text-center md:px-8 md:py-12">
      <Image
        src="/icons/not-found-icon.svg"
        alt="Nenhum conteúdo encontrado"
        width={72}
        height={72}
        className="mb-6"
      />
      <h3 className="mb-3 text-xl font-semibold text-low-dark-blue lg:text-3xl">
        Não encontramos conteúdos
      </h3>
      <p className="text-base text-low-dark-blue md:text-lg">
        {message}
      </p>
    </div>
  );

  const handleContentTypeChange = (newType: ContentTypeOption) => {
    setLocalContentType(newType);
    onContentTypeChange?.(newType);
  };

  const handleSortByChange = (newSort: SortOption) => {
    setLocalSortBy(newSort);
    onSortByChange?.(newSort);
  };

  if (!useTabLayout && !hasPosts) {
    return renderEmptyState(emptyMessage);
  }

  if (useTabLayout) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center md:justify-between shadow-[0_4px_8px_0_rgba(0,22,43,0.04)] lg:px-6 lg:py-4">
          <div className="flex rounded-sm border border-[#E5E7EB] lg:gap-x-[0.4375rem]">
            {(["todos", "artigo", "ebook"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleContentTypeChange(tab)}
                className={`px-2 py-2 text-base text-dark-blue min-w-[7.5rem] md:min-w-[13.5rem] lg:min-w-[9.375rem] min-h-10 font-medium transition-colors cursor-pointer ${
                  localContentType === tab
                    ? "bg-dark-blue text-white rounded-sm font-semibold"
                    : ""
                }`}
              >
                {tab === "todos" && "Todos"}
                {tab === "artigo" && "Artigos"}
                {tab === "ebook" && "E-books"}
              </button>
            ))}
          </div>
          <div className="rounded border border-light-gray px-3 py-[0.5625rem] text-sm text-low-dark-blue focus:border-dark-blue focus:outline-none min-h-10 w-full lg:w-fit lg:min-w-[19.875rem] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Image src="/icons/sort-icon.svg" alt="Ordenar por" width={13} height={10} />
              <span className="gray-medium-2 text-sm md:text-base whitespace-nowrap">Ordenar por:</span>
              <select
                value={localSortBy}
                onChange={(e) => handleSortByChange(e.target.value as SortOption)}
                className="appearance-none bg-transparent outline-none cursor-pointer min-w-0"
              >
                <option value="recente" className="text-[#1F2937]">Mais Recente</option>
                <option value="antigo" className="text-[#1F2937]">Mais Antigo</option>
                <option value="a-z">A - Z</option>
              </select>
            </div>
            <Image
              src="/icons/arrow-down.svg"
              alt="Seta"
              width={12}
              height={12}
              className="pointer-events-none flex-shrink-0"
            />
          </div>
        </div>

        {hasPosts ? (
          <section className="post-grid">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
              {posts.map((post) => (
                <div key={post.id} className="h-full lg:col-span-4">
                  <PostCard
                    post={post}
                    featured={false}
                    showDownloadButton={true}
                    onDownloadClick={handleDownloadClick}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : (
          renderEmptyState(emptyMessage)
        )}
      </div>
    );
  }

  return (
    <>
      <section className="post-grid">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {posts.map((post) => (
            <div key={post.id} className="h-full lg:col-span-4">
              <PostCard
                post={post}
                featured={false}
                showDownloadButton={true}
                onDownloadClick={handleDownloadClick}
              />
            </div>
          ))}
        </div>
      </section>

      {!hasPosts && renderEmptyState(emptyMessage)}

      {modalData && (
        <EbookDownloadModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          ebookName={modalData.ebookName}
          ebookUrl={modalData.ebookUrl}
          variant={modalData.variant}
        />
      )}
    </>
  );
}
