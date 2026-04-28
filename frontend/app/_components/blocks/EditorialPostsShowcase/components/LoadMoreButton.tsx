"use client";

interface LoadMoreButtonProps {
  isLoading?: boolean;
  hasMore: boolean;
  onClick: () => void;
}

export default function LoadMoreButton({
  isLoading = false,
  hasMore,
  onClick,
}: LoadMoreButtonProps) {
  if (!hasMore) {
    return null;
  }

  return (
    <div className="flex justify-center mt-8 md:mt-10 lg:mt-12">
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`px-8 md:px-12 py-3 md:py-4 font-semibold text-base md:text-lg rounded-lg transition-all ${
          isLoading
            ? "bg-light-gray text-gray cursor-not-allowed opacity-50"
            : "bg-red text-white hover:bg-red/90 active:scale-95"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Carregando...
          </span>
        ) : (
          "Ver Mais Posts"
        )}
      </button>
    </div>
  );
}
