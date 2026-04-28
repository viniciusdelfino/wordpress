import Image from "next/image";
import Link from "next/link";

const STATIC_POSTS = [
  {
    id: 1,
    title: "Como escolher o óleo ideal para motores turbo",
    excerpt: "Motores turbo exigem lubrificantes com maior resistência térmica e proteção contra depósitos. Saiba quais características considerar na hora da escolha.",
    category: "Manutenção",
    reading_time: "5 min de leitura",
    link: "/conteudos",
    image: "/images/oleo-ideal.jpg",
  },
  {
    id: 2,
    title: "Viscosidade do óleo: o que significam os números?",
    excerpt: "Entenda o que significam as classificações SAE como 5W-30 e 10W-40 e como escolher a viscosidade correta para o seu motor e clima.",
    category: "Técnico",
    reading_time: "4 min de leitura",
    link: "/conteudos",
    image: "/images/refining-gold-metallurgy-precious-metals-generative-ai.jpg",
  },
  {
    id: 3,
    title: "Intervalo de troca de óleo: mitos e verdades",
    excerpt: "Trocar o óleo antes do prazo é necessário? Descubra os fatores que realmente influenciam o intervalo de troca e como preservar o seu motor.",
    category: "Novidades",
    reading_time: "6 min de leitura",
    link: "/conteudos",
    image: "/images/produtos-para-motos.jpg",
  },
];

export default function ContentsFallback() {
  return (
    <section className="w-full pb-[3.75rem] md:pb-[5.625rem] lg:pb-[3.75rem] pt-8 md:pt-10 lg:pt-15 bg-neutral-2 contents-block-fallback">
      <div className="container mx-auto px-4">
        <div className="mb-6 md:mb-8 lg:mb-10">
          <h2 className="text-dark-blue font-semibold text-2xl md:text-3xl lg:text-[32px] leading-tight mb-4">
            Conteúdos relacionados
          </h2>
          <p className="text-low-dark-blue text-base lg:text-lg max-w-3xl">
            Dicas e informações técnicas para tirar o máximo do seu lubrificante.
          </p>
        </div>

        <div className="lg:hidden flex flex-col gap-4">
          {STATIC_POSTS.map((post) => (
            <StaticPostCard key={post.id} post={post} />
          ))}
        </div>

        <Link
          href="/conteudos"
          className="hidden lg:flex mx-auto mt-6 w-fit min-w-[17.125rem] items-center justify-center gap-2 rounded-sm bg-red text-white font-medium text-base h-[2.5rem] transition hover:opacity-90"
        >
          Ver todos os conteúdos
        </Link>
        <Link
          href="/conteudos"
          className="lg:hidden flex mx-auto mt-4 w-full items-center justify-center gap-2 rounded-sm bg-red text-white font-medium text-sm h-[2.5rem] transition hover:opacity-90"
        >
          Ver todos os conteúdos
        </Link>
      </div>
    </section>
  );
}

function StaticPostCard({ post }: { post: (typeof STATIC_POSTS)[number] }) {
  return (
    <div className="w-full h-full border border-dark-blue rounded-sm flex flex-col bg-white overflow-hidden">
      <div className="relative w-full aspect-[343/165] overflow-hidden rounded-t-sm">
        <Image src={post.image} alt={post.title} fill className="object-cover" />
      </div>
      <div className="flex flex-col flex-1 py-[2.0625rem] px-4 lg:px-[2.0625rem] gap-y-6">
        <div className="flex items-center gap-x-2">
          <Image src="/icons/doc.svg" alt="Ícone Documento" width={16} height={16} />
          <span className="text-red text-xs font-semibold uppercase tracking-wide">
            {post.category}
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-y-2">
          <h3 className="text-dark-blue text-xl font-semibold leading-tight">{post.title}</h3>
          <p className="text-low-dark-blue text-sm md:text-base font-normal leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-low-dark-blue text-sm">{post.reading_time}</span>
          <Link href={post.link} className="hover:opacity-70 transition-opacity">
            <Image src="/icons/arrow-right.svg" alt="Ler mais" width={16} height={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
