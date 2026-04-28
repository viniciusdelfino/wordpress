export default function BlogPostLoading() {
  return (
    <main className="min-h-screen bg-white pb-16 md:pb-20 lg:pb-24">
      <section className="container pt-6 md:pt-8 lg:pt-10">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-3/4 rounded bg-neutral" />
          <div className="aspect-[16/9] w-full rounded bg-neutral" />
          <div className="h-6 w-full rounded bg-neutral" />
          <div className="h-6 w-full rounded bg-neutral" />
          <div className="h-6 w-5/6 rounded bg-neutral" />
        </div>
      </section>
    </main>
  );
}