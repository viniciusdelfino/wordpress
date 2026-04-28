import ProductCarousel from "./ProductCarousel";
import { wordpressAPI } from "../lib/wordpress-api";
import ProductGrid from "../_components/products/ProductGrid";
import Breadcrumb from "@/app/_components/ui/Breadcrumb/Breadcrumb";
import PostGrid from "./PostGrid";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function normalizeStr(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function hasValidPublicRoute(product: any): boolean {
    const slug = normalizeStr(product?.slug || "");
    const categorySlug = normalizeStr(product?.category_slug || "");

    // Produtos mapeados como "outros" no proxy costumam não ter rota pública e geram 404.
    if (!slug || categorySlug === "outros") return false;

    return true;
}

// Score products by relevance to the query
function scoreProduct(query: string, product: any): number {
    const normalizedQuery = normalizeStr(query);
    const title = normalizeStr(product.B2BProductName__c || product.title || "");
    const description = normalizeStr(product.Description || "");

    if (!normalizedQuery) return 0;

    const words = normalizedQuery.split(/\s+/).filter(Boolean);
    let score = 0;

    for (const word of words) {
        // Exact word match at start of title: +100
        if (title.startsWith(word)) score += 100;
        // Word match at start of any word in title: +50
        else if (new RegExp(`\\b${word}`).test(title)) score += 50;
        // Substring match in title: +25
        else if (title.includes(word)) score += 25;
        // Substring match in description: +10
        else if (description.includes(word)) score += 10;
    }

    return score;
}

// Intelligent search with partial matching and relevance scoring
function intelligentSearch(query: string, products: any[]): any[] {
        if (!query.trim()) {
            return (products || []).filter(hasValidPublicRoute);
        }

        const normalizedQuery = normalizeStr(query);
        const words = normalizedQuery.split(/\s+/).filter(Boolean);
        const routeableProducts = (products || []).filter(hasValidPublicRoute);

        const byStrength = routeableProducts.map((product) => {
            const title = normalizeStr(product.B2BProductName__c || product.title || "");
            const description = normalizeStr(product.Description || "");
            const haystack = `${title} ${description}`;
            const matchedWords = words.filter((word) => haystack.includes(word)).length;
            const hasExactPhrase = haystack.includes(normalizedQuery);

            return {
                product,
                matchedWords,
                hasExactPhrase,
                relevance: scoreProduct(query, product),
            };
        });

        // 1) Frase exata
        const exactPhrase = byStrength
            .filter((item) => item.hasExactPhrase)
            .sort((a, b) => b.relevance - a.relevance)
            .map((item) => item.product);

        // 2) Todos os termos
        const allTerms = byStrength
            .filter((item) => item.matchedWords === words.length)
            .sort((a, b) => b.relevance - a.relevance)
            .map((item) => item.product);

        // 3) Parcial (apenas se não houver resultados fortes)
        const partial = byStrength
            .filter((item) => item.matchedWords > 0)
            .sort((a, b) => {
                if (b.matchedWords !== a.matchedWords) return b.matchedWords - a.matchedWords;
                return b.relevance - a.relevance;
            })
            .map((item) => item.product);

        const strongMatches = [...exactPhrase, ...allTerms];
        const selected = strongMatches.length > 0 ? strongMatches : partial;

        // Remove duplicados preservando ordem
        const seen = new Set<string>();
        return selected.filter((p) => {
            const key = `${p?.slug || ""}::${p?.category_slug || ""}`;
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
}

export default async function SearchResultsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const page = await wordpressAPI.getPage("busca");
    const baseBlocks = Array.isArray(page?.blocks) ? page.blocks : [];
    const recentPostsBlock = baseBlocks.find(
        (block: any) => (block?.type || block?.acf_fc_layout) === "recent_posts"
    );
    const recentPostsData = recentPostsBlock?.data || recentPostsBlock || {
        title_desc:
            "<h2>Conteúdos</h2><p>Artigos técnicos, vídeos e materiais exclusivos</p>",
        button: { title: "Ver todos os conteúdos", url: "/conteudos", target: "_self" },
        selecao_categoria: "automatica",
        show_image: true,
    };
    const recentPostsTitleDesc =
        recentPostsData?.title_desc ||
        "<h2>Conteúdos</h2><p>Artigos técnicos, vídeos e materiais exclusivos</p>";
    const recentPostsButton =
        recentPostsData?.button || {
            title: "Ver todos os conteúdos",
            url: "/conteudos",
            target: "_self",
        };

    const { q } = await searchParams;
    const query = q || "";

    const { type: searchType, products: rawProducts, metadata } = await wordpressAPI.smartSearch(query);
    const posts = await wordpressAPI.getPostsByQuery(query);

    // Apply intelligent search with partial matching and relevance scoring
    let products = query
        ? intelligentSearch(query, rawProducts)
        : rawProducts;

    // If no results from smartSearch, try full catalog
    if (query && products.length === 0) {
        const allProducts = await wordpressAPI.getAllProducts();
        products = intelligentSearch(query, allProducts);
    }

    // Se não encontrar produtos, busca os recentes
    if (products.length === 0 && posts.length === 0) {
        const allForCarousel = await wordpressAPI.getAllProducts();
        // Filtra só os que têm rota pública válida (evita cards com 404)
        const recentProducts = allForCarousel.filter(
            (p: any) => p?.slug && normalizeStr(p?.category_slug || "") !== "outros"
        );
        const latestPosts = await wordpressAPI.getPostsByQuery("");

        return (
            <>
            <Breadcrumb
                items={[
                    { label: "Home", href: "/" },
                    { label: "Busca" },
                ]}
            />
            <section className="search-page px-4 py-8 flex flex-col container mx-auto">
                <div className="flex flex-col gap-2 items-start pb-[24px]">
                    <h1 className="text-xl font-semibold md:text-[28px] font-semibold text-dark-blue">Desculpe, não encontramos nenhum resultado para "{query}"</h1>
                    <p className="text-gray-600 text-sm md:text-base">Veja se digitou corretamente ou tente usar uma palavra diferente</p>
                </div>
                {recentProducts.length > 0 && (
                    <div className="block gap-4 items-start pb-[32px]">
                        <h2 className="text-xl md:text-2xl font-semibold text-dark-blue mb-4">Talvez possa te interessar</h2>
                        <ProductCarousel products={recentProducts} isHidden={false} />
                    </div>
                )}
                <PostGrid
                    posts={latestPosts}
                    titleDesc={recentPostsTitleDesc}
                    button={recentPostsButton}
                />
            </section>
            </>
        );
    }

    return (
        <>
        <Breadcrumb
            items={[
                { label: "Home", href: "/" },
                { label: "Busca" },
            ]}
        />
        <section className="search-page px-4 py-8 flex flex-col gap-10 container mx-auto">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold md:text-[28px] font-semibold text-dark-blue capitalize">
                        Resultados para: {query}
                    </h1>
                </div>
                <p className="text-dark-blue text-lg">
                    {products.length} produto{products.length !== 1 ? "s" : ""} encontrado{products.length !== 1 ? "s" : ""}
                </p>
                <ProductGrid products={products} />
            </div>
            <PostGrid
                posts={posts}
                titleDesc={recentPostsTitleDesc}
                button={recentPostsButton}
            />
        </section>
        </>
    );
}

