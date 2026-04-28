export default function BlogCategoryLoading() {
  return (
    <main className="min-h-screen bg-white">
      <section className="container py-10 md:py-12 lg:py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-neutral" />
          <div className="h-12 w-full rounded bg-neutral" />
          <div className="h-64 w-full rounded bg-neutral" />
        </div>
      </section>
    </main>
  );
}