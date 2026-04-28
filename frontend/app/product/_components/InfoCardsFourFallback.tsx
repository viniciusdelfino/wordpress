'use client';

import InfoCardsFour from "@/app/_components/blocks/InfoCardsFour";

const FALLBACK_CARDS = [
  {
    image: { url: "/images/produtos-para-motos.jpg", alt: "Onde Comprar" },
    title_desc: "<h3>Onde Comprar</h3><p>Encontre o produto Mobil mais próximo de você.</p>",
    link: { title: "Encontrar loja", url: "/onde-comprar", target: "_self" },
  },
  {
    image: { url: "/images/encontre-o-distribuidor.jpg", alt: "Distribuidor" },
    title_desc: "<h3>Distribuidor</h3><p>Conheça nossa rede oficial de distribuidores autorizados.</p>",
    link: { title: "Ver distribuidores", url: "/distribuidores", target: "_self" },
  },
  {
    image: { url: "/images/oleo-ideal.jpg", alt: "Óleo Ideal" },
    title_desc: "<h3>Óleo Ideal</h3><p>Descubra qual lubrificante é o certo para o seu veículo.</p>",
    link: { title: "Descobrir agora", url: "/encontre-seu-oleo", target: "_self" },
  },
  {
    image: {
      url: "/images/refining-gold-metallurgy-precious-metals-generative-ai.jpg",
      alt: "Conteúdos",
    },
    title_desc: "<h3>Conteúdos</h3><p>Dicas e informações técnicas para cuidar melhor do seu motor.</p>",
    link: { title: "Ver conteúdos", url: "/conteudos", target: "_self" },
  },
];

export default function InfoCardsFourFallback() {
  return <InfoCardsFour card={FALLBACK_CARDS} />;
}
