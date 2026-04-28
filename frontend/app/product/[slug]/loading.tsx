export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 bg-gray-200 w-1/3 mb-6 rounded" />
      <div className="h-4 bg-gray-200 w-full mb-2 rounded" />
      <div className="h-4 bg-gray-200 w-2/3 rounded" />
    </div>
  );
}
