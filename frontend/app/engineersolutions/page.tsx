import { wordpressAPI } from '@/app/lib/wordpress-api';
import BlockRenderer from '@/app/_components/BlockRenderer';
import Breadcrumb from '@/app/_components/ui/Breadcrumb/Breadcrumb';
import { extractHeroBlocks } from '@/app/lib/breadcrumb-utils';
import EngineerMediaHero from '@/app/_components/blocks/EngineerMediaHero';
import EngineerTrustCards from '@/app/_components/blocks/EngineerTrustCards';
import EngineerPortfolioTabs from '@/app/_components/blocks/EngineerPortfolioTabs';

// Mock data used for preview/dev when WP page is not yet created
const MOCK_TRUST_CARDS = {
  main_title_tcards: 'Soluções e Performance',
  main_description_tcards: 'Conte com a expertise de nosso time de engenharia especializado para extrair toda a eficiência dos lubrificantes Mobil™, trazendo inteligência para a tomada de decisão.',
  cards_tcards: [
    {
      icon_tcards: { url: '/icons/icon-engineer-tech.svg', alt: 'Ícone tecnologia' },
      title_tcards: 'Sinergia entre Tecnologia e Suporte',
      description_tcards: 'Unimos produtos de alta performance à expertise de nossa engenharia para entregar soluções completas e personalizadas.',
    },
    {
      icon_tcards: { url: '/icons/icon-engineer-safety.svg', alt: 'Ícone segurança' },
      title_tcards: 'Mais Segurança e Maior Produtividade',
      description_tcards: 'Operações mais seguras através de lubrificantes que protegem seus ativos e garantem a integridade dos processos.',
    },
    {
      icon_tcards: { url: '/icons/icon-engineer-eco.svg', alt: 'Ícone sustentabilidade' },
      title_tcards: 'Menos Impacto Ambiental',
      description_tcards: 'Foco em sustentabilidade com tecnologias que reduzem o desperdício e promovem o uso consciente de recursos.',
    },
  ],
};

const MOCK_SECTION_BULLETS = [
  { text: 'Execução Moove: Nossos distribuidores exclusivos realizam a coleta técnica e a interpretação dos dados diretamente na sua planta.' },
  { text: 'Custo de Implementação Zero: Não requer que sua empresa invista em equipamentos próprios ou treinamento de equipe interna.' },
  { text: 'Expertise Nacional: Presença de especialistas em todo o território para um atendimento ágil e diferenciado.' },
];

const MOCK_TABS_DATA = {
  title_tab: 'Conheça nosso portfólio de serviços',
  tabs: [
    {
      label: 'Análise de vibração',
      content_sections: [
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=580&h=376&fit=crop', alt: 'Análise de vibração' },
          title_content: 'Análise de vibração',
          description_tab: 'Solução de monitoramento para identificar desvios e reduzir as paradas não programadas. O nosso serviço de análise de vibração tem 2 modelos de negócio, no primeiro a coleta e interpretação é feita por especialistas com ampla experiência na análise de vibração e na lubrificação de máquinas, no segundo o cliente fica com o equipamento, coleta os dados e os especialistas da Moove realizam a interpretação de forma remota.',
          bullets_tab: [],
        },
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=580&h=376&fit=crop', alt: 'Especializada' },
          title_content: 'Análise de Vibração Especializada',
          description_tab: 'Suporte presencial completo com especialistas em campo.',
          bullets_tab: MOCK_SECTION_BULLETS,
        },
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=580&h=376&fit=crop', alt: 'HaaS' },
          title_content: 'Análise de Vibração HaaS (Hardware as a Service)',
          description_tab: 'Modelo por assinatura com monitoramento 24/7 e gestão remota.',
          bullets_tab: [
            { text: 'Equipamento no Cliente: A tecnologia permanece na sua indústria sob sua responsabilidade, garantindo total autonomia e disponibilidade.' },
            { text: 'Coleta Interna e Análise Remota: Sua equipe realiza a coleta de forma simples e os especialistas da Moove interpretam os dados à distância.' },
            { text: 'Segurança e Agilidade: Elimina o trânsito de terceiros em áreas sensíveis e permite o uso contínuo da ferramenta conforme a sua demanda.' },
          ],
        },
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=580&h=376&fit=crop', alt: 'Como funciona' },
          title_content: 'Como funciona',
          description_tab: 'Nossas soluções de análise de vibração contemplam uma jornada completa, garantindo que o dado coletado se transforme em ação:',
          bullets_tab: [
            { text: 'Mapeamento Estratégico: Identificação dos pontos críticos e definição da melhor modalidade para sua planta.' },
            { text: 'Captura de Dados: Coleta precisa das vibrações, seja pela nossa equipe ou pela sua inspeção interna.' },
            { text: 'Análise de Especialistas: Interpretação profunda realizada por engenheiros Moove especialistas em lubrificação.' },
            { text: 'Ação Preventiva: Entrega de relatórios com recomendações claras para evitar falhas e reduzir custos.' },
          ],
        },
      ],
    },
    {
      label: 'Data analytics',
      content_sections: [
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=580&h=376&fit=crop', alt: 'Data analytics' },
          title_content: 'Data Analytics Industrial',
          description_tab: 'Transforme dados operacionais em inteligência estratégica para maximizar a eficiência e reduzir custos de manutenção com análises preditivas avançadas.',
          bullets_tab: [],
        },
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=580&h=376&fit=crop', alt: 'Dashboard analytics' },
          title_content: 'Dashboard de Monitoramento',
          description_tab: 'Visualize em tempo real o desempenho dos seus equipamentos e tome decisões baseadas em dados concretos.',
          bullets_tab: [
            { text: 'KPIs personalizados: Defina métricas específicas para o seu processo produtivo e acompanhe tendências.' },
            { text: 'Alertas automáticos: Receba notificações instantâneas quando parâmetros críticos saem do range ideal.' },
            { text: 'Relatórios executivos: Geração automática de relatórios gerenciais com insights acionáveis.' },
          ],
        },
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=580&h=376&fit=crop', alt: 'Machine learning' },
          title_content: 'Manutenção Preditiva com IA',
          description_tab: 'Algoritmos de machine learning que identificam padrões de falha antes que eles aconteçam.',
          bullets_tab: [
            { text: 'Modelos preditivos treinados com dados históricos da sua planta e benchmarks do setor industrial.' },
            { text: 'Integração com sistemas CMMS: Compatível com os principais sistemas de gestão de manutenção do mercado.' },
            { text: 'ROI comprovado: Redução média de 30% nos custos de manutenção corretiva nos primeiros 12 meses.' },
          ],
        },
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=580&h=376&fit=crop', alt: 'Implantação' },
          title_content: 'Processo de Implantação',
          description_tab: 'Da coleta de dados à tomada de decisão, conduzimos todas as etapas com suporte especializado.',
          bullets_tab: [
            { text: 'Diagnóstico inicial: Mapeamento dos sistemas e fontes de dados disponíveis na sua operação.' },
            { text: 'Integração de dados: Conexão segura com PLCs, SCADA, sensores IoT e sistemas ERP existentes.' },
            { text: 'Treinamento e capacitação: Formação da equipe para uso autônomo da plataforma após implantação.' },
            { text: 'Suporte contínuo: Acompanhamento permanente da equipe Moove para evolução das análises.' },
          ],
        },
      ],
    },
    {
      label: 'Eficiência energética',
      content_sections: [
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=580&h=376&fit=crop', alt: 'Eficiência energética' },
          title_content: 'Eficiência Energética Industrial',
          description_tab: 'Reduza o consumo energético da sua planta com lubrificantes de alta performance e tecnologias de monitoramento que identificam desperdícios e otimizam processos.',
          bullets_tab: [],
        },
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=580&h=376&fit=crop', alt: 'Auditoria' },
          title_content: 'Auditoria de Consumo Energético',
          description_tab: 'Diagnóstico completo do consumo de energia em equipamentos rotativos e sistemas de lubrificação.',
          bullets_tab: [
            { text: 'Mapeamento de perdas: Identificação de equipamentos com consumo acima do esperado por atrito excessivo.' },
            { text: 'Análise de viscosidade: Avaliação do grau de viscosidade ideal para minimizar o consumo energético.' },
            { text: 'Relatório de oportunidades: Priorização das ações com maior potencial de economia por custo-benefício.' },
          ],
        },
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=580&h=376&fit=crop', alt: 'Otimização' },
          title_content: 'Otimização de Processos',
          description_tab: 'Implementação de melhorias técnicas para maximizar a eficiência energética da operação.',
          bullets_tab: [
            { text: 'Lubrificantes sintéticos: Produtos de alta performance que reduzem o coeficiente de atrito em até 25%.' },
            { text: 'Frequência de relubrificação: Adequação dos intervalos para evitar sobrelubrificação e sub-lubrificação.' },
            { text: 'Monitoramento contínuo: Acompanhamento em tempo real do consumo após as intervenções realizadas.' },
          ],
        },
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=580&h=376&fit=crop', alt: 'Resultados' },
          title_content: 'Resultados e Certificações',
          description_tab: 'Comprovação dos ganhos obtidos e suporte para certificações de eficiência energética.',
          bullets_tab: [
            { text: 'Medição e verificação: Protocolo M&V para comprovação técnica das economias obtidas.' },
            { text: 'Relatórios ISO 50001: Documentação compatível com os requisitos da norma de gestão de energia.' },
            { text: 'Cases de sucesso: Histórico de projetos com redução média de 15-20% no consumo energético.' },
            { text: 'Selo de eficiência: Apoio na obtenção de certificações e selos de eficiência energética setoriais.' },
          ],
        },
      ],
    },
    {
      label: 'Controle de contaminantes',
      content_sections: [
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=580&h=376&fit=crop', alt: 'Contaminantes' },
          title_content: 'Controle de Contaminantes em Fluidos',
          description_tab: 'Programa completo de gestão da contaminação em sistemas hidráulicos, de lubrificação e de resfriamento, garantindo a vida útil máxima dos componentes.',
          bullets_tab: [],
        },
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=580&h=376&fit=crop', alt: 'Análise de óleo' },
          title_content: 'Análise de Óleo e Diagnóstico',
          description_tab: 'Programa de monitoramento por análise periódica de amostras de óleo lubrificante.',
          bullets_tab: [
            { text: 'Contagem de partículas: Análise granulométrica conforme normas ISO 4406 e NAS 1638.' },
            { text: 'Identificação de desgaste: Detecção de metais de desgaste que indicam falhas incipientes em componentes.' },
            { text: 'Análise de água: Detecção de umidade por Karl Fischer, cromatografia ou Dean-Stark conforme aplicação.' },
          ],
        },
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=580&h=376&fit=crop', alt: 'Filtração' },
          title_content: 'Sistemas de Filtração e Descontaminação',
          description_tab: 'Soluções técnicas para remoção de contaminantes e restauração da qualidade do fluido.',
          bullets_tab: [
            { text: 'Filtração de alta eficiência: Sistemas beta ≥200 para partículas sólidas em circuitos críticos.' },
            { text: 'Desidratação a vácuo: Remoção de água livre e dissolvida em sistemas de alta criticidade.' },
            { text: 'Flushing técnico: Limpeza de sistemas novos ou após contaminação severa antes da partida.' },
          ],
        },
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=580&h=376&fit=crop', alt: 'Procedimentos' },
          title_content: 'Procedimentos e Melhores Práticas',
          description_tab: 'Desenvolvimento e implementação de procedimentos para prevenção de contaminação.',
          bullets_tab: [
            { text: 'Armazenamento adequado: Protocolos para recebimento, armazenamento e manuseio de lubrificantes.' },
            { text: 'Transferência controlada: Equipamentos dedicados para evitar contaminação cruzada durante abastecimento.' },
            { text: 'Treinamento de equipe: Capacitação técnica sobre fontes de contaminação e métodos de controle.' },
            { text: 'Indicadores de qualidade: Definição de ISO target codes para cada sistema e monitoramento contínuo.' },
          ],
        },
      ],
    },
    {
      label: 'Detecção de vazamento',
      content_sections: [
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=580&h=376&fit=crop', alt: 'Vazamento' },
          title_content: 'Detecção e Controle de Vazamentos',
          description_tab: 'Serviço especializado na identificação, quantificação e eliminação de vazamentos em sistemas industriais, reduzindo custos operacionais e impacto ambiental.',
          bullets_tab: [],
        },
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=580&h=376&fit=crop', alt: 'Inspeção' },
          title_content: 'Inspeção Técnica Especializada',
          description_tab: 'Levantamento completo dos pontos de vazamento com tecnologias avançadas de detecção.',
          bullets_tab: [
            { text: 'Câmera termográfica: Detecção de vazamentos de vapor, gás e fluidos por variação de temperatura.' },
            { text: 'Ultrassom industrial: Localização precisa de micro-vazamentos em tubulações pressurizadas e vedações.' },
            { text: 'Fluorescência UV: Aplicação de traçadores para mapeamento de rotas de contaminação por lubrificantes.' },
          ],
        },
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=580&h=376&fit=crop', alt: 'Soluções' },
          title_content: 'Soluções de Vedação e Reparo',
          description_tab: 'Intervenções técnicas para eliminação permanente dos pontos de vazamento identificados.',
          bullets_tab: [
            { text: 'Aditivos selantes: Produtos específicos para vedação de micro-porosidades em cárteres e caixas de engrenagens.' },
            { text: 'Vedações de alta performance: Especificação de retentores e O-rings compatíveis com o fluido e as condições operacionais.' },
            { text: 'Reparo sem parada: Técnicas de reparo a frio que permitem a correção com o equipamento em operação.' },
          ],
        },
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=580&h=376&fit=crop', alt: 'Programa' },
          title_content: 'Programa de Gestão de Vazamentos',
          description_tab: 'Implementação de rotinas permanentes para controle e prevenção de novos vazamentos.',
          bullets_tab: [
            { text: 'Inventário de vazamentos: Cadastro georreferenciado de todos os pontos com priorização por criticidade.' },
            { text: 'Plano de ação: Cronograma de eliminação com definição de responsáveis e prazos por setor.' },
            { text: 'Indicadores de desempenho: Controle do volume de perda e redução de custos ao longo do programa.' },
            { text: 'Conformidade ambiental: Documentação para atendimento às normas de controle de efluentes e emissões.' },
          ],
        },
      ],
    },
    {
      label: 'Escaneamento 3D',
      content_sections: [
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=580&h=376&fit=crop', alt: 'Escaneamento 3D' },
          title_content: 'Escaneamento 3D Industrial',
          description_tab: 'Tecnologia de ponta para levantamento dimensional preciso de instalações industriais, viabilizando projetos de retrofit, manutenção preditiva e engenharia reversa com alta fidelidade.',
          bullets_tab: [],
        },
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=580&h=376&fit=crop', alt: 'Laser scan' },
          title_content: 'Laser Scan de Alta Precisão',
          description_tab: 'Captura tridimensional de ativos e instalações com tolerância milimétrica.',
          bullets_tab: [
            { text: 'Precisão submilimétrica: Captura de nuvem de pontos com até 0,3mm de precisão dimensional.' },
            { text: 'Cobertura total: Mapeamento completo de tubulações, estruturas, equipamentos e conexões.' },
            { text: 'Exportação universal: Arquivos compatíveis com AutoCAD, SolidWorks, Revit e principais softwares CAD.' },
          ],
        },
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=580&h=376&fit=crop', alt: 'Modelagem' },
          title_content: 'Modelagem e Engenharia Reversa',
          description_tab: 'Transformação da nuvem de pontos em modelos BIM e CAD editáveis para projetos de modernização.',
          bullets_tab: [
            { text: 'As-built digital: Documentação precisa do estado atual das instalações para projetos de ampliação e revamp.' },
            { text: 'Detecção de interferências: Identificação de conflitos entre novas instalações e estruturas existentes.' },
            { text: 'Biblioteca de componentes: Criação de modelos 3D parametrizados de equipamentos para manutenção futura.' },
          ],
        },
        {
          image_tab: { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=580&h=376&fit=crop', alt: 'Aplicações' },
          title_content: 'Aplicações e Benefícios',
          description_tab: 'Casos de uso que demonstram o valor do escaneamento 3D na indústria.',
          bullets_tab: [
            { text: 'Planejamento de paradas: Visualização prévia de todas as intervenções para otimizar o tempo de manutenção.' },
            { text: 'Treinamento virtual: Criação de ambientes de realidade virtual para capacitação de operadores e mecânicos.' },
            { text: 'Gestão patrimonial: Inventário digital preciso de todos os ativos físicos da planta industrial.' },
            { text: 'Análise de riscos: Identificação de áreas de acesso restrito e planejamento seguro de intervenções.' },
          ],
        },
      ],
    },
  ],
};

const MOCK_MEDIA_HERO = { media_type_mediahero: 'video' as const, video_url_mediahero: '/videos/cover_video.mp4' };

/** Substitui blocos sem conteúdo pelos dados mockados correspondentes. */
function resolveEngBlocks(blocks: any[]) {
  return blocks.map(block => {
    const d = block.data ?? {};

    if (block.type === 'eng_media_hero') {
      const isEmpty = !d.video_url && !d.image?.url;
      if (isEmpty) return { ...block, data: { acf_fc_layout: 'eng_media_hero', ...MOCK_MEDIA_HERO } };
    }

    if (block.type === 'eng_trust_cards') {
      const hasCards = Array.isArray(d.cards) && d.cards.length > 0;
      const isEmpty = !d.title && !hasCards;
      if (isEmpty) return { ...block, data: { acf_fc_layout: 'eng_trust_cards', ...MOCK_TRUST_CARDS } };
    }

    if (block.type === 'eng_portfolio_tabs') {
      const hasTabs = Array.isArray(d.tabs) && d.tabs.length > 0;
      const isEmpty = !d.title && !hasTabs;
      if (isEmpty) return { ...block, data: { acf_fc_layout: 'eng_portfolio_tabs', ...MOCK_TABS_DATA } };
    }

    return block;
  });
}

export default async function EngineerSolutionsPage() {
  let blocks: any[] = [];

  try {
    const pageData = await wordpressAPI.getPage('engineersolutions');
    if (pageData?.blocks) {
      blocks = pageData.blocks;
    }
  } catch {
    // page not yet created in WP — render with mock data below
  }

  // If no WP blocks at all, render full mock layout.
  // TODO: mock data uses legacy field names; either rename to match the *_tcards/_tab/_mediahero
  // suffixed props the components now expect, or remove this fallback entirely.
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Engineer Solutions" },
  ];

  if (!blocks.length) {
    return (
      <main>
        <EngineerMediaHero {...(MOCK_MEDIA_HERO as any)} />
        <Breadcrumb items={breadcrumbItems} />
        <EngineerTrustCards {...(MOCK_TRUST_CARDS as any)} />
        <EngineerPortfolioTabs {...(MOCK_TABS_DATA as any)} />
      </main>
    );
  }

  const resolved = resolveEngBlocks(blocks);
  const { heroBlocks, remainingBlocks } = extractHeroBlocks(resolved);

  return (
    <main>
      {heroBlocks.length > 0 && <BlockRenderer blocks={heroBlocks} />}
      <Breadcrumb items={breadcrumbItems} />
      {remainingBlocks.length > 0 && <BlockRenderer blocks={remainingBlocks} />}
    </main>
  );
}
