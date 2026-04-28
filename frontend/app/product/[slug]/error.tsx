"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold mb-4">
        Ocorreu um erro ao carregar o produto.
      </h2>

      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Tentar novamente
      </button>
    </div>
  );
}
