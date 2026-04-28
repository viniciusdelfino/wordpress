"use client";

import { useState } from "react";

interface PostShareButtonProps {
  title: string;
}

export default function PostShareButton({ title }: PostShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Keep silent to avoid noisy UX when user cancels native share.
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex min-w-8 h-8 w-8 items-center justify-center rounded-[0.625rem] border border-[#F3F4F6] text-low-dark-blue"
      aria-label="Compartilhar este conteúdo"
      title={copied ? "Link copiado" : "Compartilhar"}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.59 13.51 15.42 17.49" />
        <path d="M15.41 6.51 8.59 10.49" />
      </svg>
      <span className="sr-only">{copied ? "Link copiado" : "Compartilhar"}</span>
    </button>
  );
}
