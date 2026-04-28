"use client";

import React from "react";
import Image from "next/image";
import EbookDownloadModal from "./EbookDownloadModal";
import { useEbookModal } from "./useEbookModal";

type FormVariant = "industria" | "guia-oleo-frotas";

interface EbookDownloadButtonProps {
  ebookName: string;
  ebookUrl: string;
  variant: FormVariant;
}

export default function EbookDownloadButton({
  ebookName,
  ebookUrl,
  variant,
}: EbookDownloadButtonProps) {
  const { isOpen, open, close } = useEbookModal();

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex items-center gap-2 rounded-lg bg-red px-6 py-3 text-sm font-bold text-white hover:brightness-110 transition"
      >
        <Image
          src="/icons/download.svg"
          alt=""
          width={16}
          height={16}
          className="brightness-0 invert"
        />
        Baixar e-book
      </button>

      <EbookDownloadModal
        isOpen={isOpen}
        onClose={close}
        ebookName={ebookName}
        ebookUrl={ebookUrl}
        variant={variant}
      />
    </>
  );
}
