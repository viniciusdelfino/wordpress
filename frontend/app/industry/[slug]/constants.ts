export const DEFAULT_SEC_HERO = {
  title: "Um setor do tamanho do Brasil",
  description:
    "O setor de navegação, em um país com 7.491 quilômetros de litoral e 48 mil quilômetros de rios aptos para transporte é naturalmente enorme e diversificado",
  image: {
    url: "/images/navio-2-3.jpg",
    alt: "Setor Industrial Mobil",
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
        "<h2>O maior catálogo de óleos do mercado!</h2><p>Apresentamos soluções inovadoras e sustentáveis que potencializam seu desempenho, minimizam o impacto ambiental e ajudam você a atingir suas metas.</p>",
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

export const DEFAULT_KNOW_OUR_TOOLS: {
  desc: string;
  list: {
    image: { url: string; alt: string; width: number; height: number };
    title: string;
    desc: string;
    list_2: { text: string }[];
    button: { title: string; url: string; target: string };
  }[];
} = {
  desc: "<h2>Conheça nossas ferramentas e serviços exclusivos.</h2><p>Produtos Mobil™ se renovam a cada dia, acompanhando a evolução dos motores e equipamentos industriais para garantir o máximo desempenho e proteção em qualquer operação.</p>",
  list: [
    {
      image: { url: "/images/solucoes-para-industria.jpg", alt: "Soluções por Indústria", width: 400, height: 350 },
      title: "Soluções por Indústria",
      desc: "<h3>Soluções por Indústria</h3><p>Portfólio completo de lubrificantes desenvolvidos para as demandas específicas de cada setor industrial.</p>",
      list_2: [
        { text: "Alimentos e Bebidas" },
        { text: "Cimento" },
        { text: "Açúcar e Etanol" },
        { text: "Geração de energia" },
        { text: "Siderurgia" },
        { text: "Óleo e gás" },
        { text: "Metal mecânica" },
        { text: "Mineração" },
      ],
      button: { title: "Ver conteudos", url: "/blog", target: "_self" },
    },
    {
      image: { url: "/images/frente-conheca.jpg", alt: "Calculadores de Eficiência", width: 400, height: 350 },
      title: "Calculadores de Eficiência",
      desc: "<h3>Calculadores de Eficiência</h3><p>Utilize ferramentas técnicas desenvolvidas para simular ganhos de eficiência, economia de energia e performance operacional com aplicações industriais.</p>",
      list_2: [
        { text: "Para Engrenagens" },
        { text: "Para compressores de ar" },
        { text: "Para Rolamentos" },
        { text: "Para sistemas hidráulicos" },
        { text: "Para rolamentos de motor elétrico" },
      ],
      button: { title: "Ver soluções", url: "/calculadoras", target: "_self" },
    },
    {
      image: { url: "/images/frente-conheca-2.jpg", alt: "Moove Engineering Solutions", width: 400, height: 350 },
      title: "Moove Engineering Solutions",
      desc: "<h3>Moove Engineering Solutions</h3><p>Conte com a expertise de nosso time de engenharia especializado para extrair toda a eficiência dos lubrificantes Mobil.</p>",
      list_2: [
        { text: "Para Engrenagens" },
        { text: "Para compressores de ar" },
        { text: "Para Rolamentos" },
        { text: "Para sistemas hidráulicos" },
        { text: "Para rolamentos de motor elétrico" },
      ],
      button: { title: "Ver soluções", url: "#", target: "_self" },
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
