export const DEFAULT_SEC_HERO = {
  title: "Encontre o lubrificante ideal",
  description:
    "Conheça a linha completa de produtos Mobil desenvolvidos para oferecer máxima proteção e desempenho para o seu veículo.",
  image: {
    url: "/images/catalogo-oleos.jpg",
    alt: "Linha de produtos Mobil",
    width: 1440,
    height: 420,
  },
};

export const DEFAULT_TWO_BANNER: {
  list: {
    image: { url: string; alt: string };
    content: string;
    button: { title: string; url: string; target: string };
  }[];
} = {
  list: [
    {
      image: { url: "/images/catalogo-oleos.jpg", alt: "O maior catálogo de óleos do mercado!" },
      content:
        "<h2>O maior catálogo de óleos do mercado!</h2><p>Apresentamos soluções inovadoras que potencializam o desempenho e a proteção do seu veículo.</p>",
      button: { title: "Baixe nosso catálogo", url: "#", target: "_self" },
    },
    {
      image: { url: "/images/pededireto.jpg", alt: "Você é um CNPJ?" },
      content: "<h2>Você é um CNPJ?</h2><p>Compre agora de um distribuidor oficial:</p>",
      button: {
        title: "Comprar agora com CNPJ",
        url: "https://www.pededireto.com.br/",
        target: "_blank",
      },
    },
  ],
};

export const DEFAULT_CONTENTS = {
  title_desc:
    "<h2>Conteúdo</h2><p>Informação técnica e guias práticos para você tomar as melhores decisões</p>",
  button: { title: "Ver todos os conteúdos", url: "/blog", target: "_self" },
  selecao_categoria: "automatica" as const,
};

export const DEFAULT_INFO_CARDS: {
  image: { url: string; alt: string };
  title_desc: string;
  link: { title: string; url: string; target: string };
}[] = [
  {
    image: { url: "/images/produtos-para-motos.jpg", alt: "Onde Comprar" },
    title_desc: "<h3>Onde Comprar</h3><p>Encontre o ponto de venda Mobil mais próximo de você.</p>",
    link: { title: "Encontrar loja", url: "/onde-comprar", target: "_self" },
  },
  {
    image: { url: "/images/encontre-o-distribuidor.jpg", alt: "Distribuidor" },
    title_desc: "<h3>Distribuidor</h3><p>Conheça nossa rede oficial de distribuidores autorizados.</p>",
    link: { title: "Ver distribuidores", url: "/distribuidores", target: "_self" },
  },
];
