"use client";

import { useState, useCallback, useMemo } from "react";
import FeaturedPosts from "./components/FeaturedPosts";
import PostsFilter from "./components/PostsFilter";
import PostsGrid from "./components/PostsGrid";
import LoadMoreButton from "./components/LoadMoreButton";
import {
  filterAndSortPosts,
  separateFeaturedPosts,
  paginatePosts,
  getAvailableSubjects,
} from "./utils/postsFiltering";
import type {
  SortOption,
  ContentTypeOption,
  FilterStrategy,
  FilterStrategyConfig,
} from "./utils/postsFiltering";

interface EditorialPostsShowcaseProps {
  posts: any[];
  title?: string;
  description?: string;
  postsPerPage?: number;
  defaultSort?: SortOption;
  enableFilters?: boolean;
  filter_strategy?: FilterStrategy;
  editorial_parent_name?: string;
}

export default function EditorialPostsShowcase({
  posts = [],
  title = "Últimos Artigos",
  description,
  postsPerPage = 9,
  defaultSort = "recente",
  enableFilters = true,
  filter_strategy = "editorial_children",
  editorial_parent_name,
}: EditorialPostsShowcaseProps) {
  const [subject, setSubject] = useState("todos");
  const [contentType, setContentType] = useState<ContentTypeOption>("todos");
  const [sortBy, setSortBy] = useState<SortOption>(defaultSort);
  const [currentPage, setCurrentPage] = useState(1);

  const filterStrategyConfig = useMemo<FilterStrategyConfig>(() => {
    return {
      strategy: filter_strategy,
      editorialTermName: editorial_parent_name,
    };
  }, [filter_strategy, editorial_parent_name]);

  const subjectOptions = useMemo(
    () => getAvailableSubjects(posts, filterStrategyConfig),
    [posts, filterStrategyConfig]
  );

  // Filtrar e ordenar posts
  const filteredPosts = useMemo(() => {
    return filterAndSortPosts(
      posts,
      {
        subject,
        contentType,
        sortBy,
      },
      filterStrategyConfig
    );
  }, [posts, subject, contentType, sortBy, filterStrategyConfig]);

  // Separar destaque e resto
  const { featured: featuredPosts, remaining: remainingPosts } = useMemo(() => {
    return separateFeaturedPosts(filteredPosts);
  }, [filteredPosts]);

  // Paginar posts restantes
  const paginatedPosts = useMemo(() => {
    return paginatePosts(remainingPosts, postsPerPage, currentPage);
  }, [remainingPosts, postsPerPage, currentPage]);

  // Total de páginas
  const totalPages = Math.ceil(remainingPosts.length / postsPerPage);
  const hasMore = currentPage < totalPages;

  const handleFilterChange = useCallback(
    (filters: {
      subject: string;
      contentType: ContentTypeOption;
      sortBy: SortOption;
    }) => {
      setSubject(filters.subject);
      setContentType(filters.contentType);
      setSortBy(filters.sortBy);
      setCurrentPage(1); // Reset para primeira página na busca
    },
    []
  );

  const handleLoadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  return (
    <section className="py-6 md:py-8 lg:py-10 editorial-posts-showcase">
      <div className="container">

        {/* Destaque (4 primeiros posts) */}
        {featuredPosts.length > 0 && (
          <FeaturedPosts posts={featuredPosts} />
        )}

        <h3>{title}</h3>
        {description && <p className="mt-2 mb-4 text-medium-gray">{description}</p>}

        {/* Filtros */}
        {enableFilters && (
          <PostsFilter
            subjects={subjectOptions}
            filterStrategy={filterStrategyConfig}
            onFilterChange={handleFilterChange}
          />
        )}

        {/* Grid de Posts com Paginação */}
        <PostsGrid
          posts={paginatedPosts}
          emptyMessage="Nenhum post encontrado com os filtros selecionados."
        />

        {/* Botão Ver Mais */}
        <LoadMoreButton
          hasMore={hasMore}
          onClick={handleLoadMore}
          isLoading={false}
        />

        {/* Indicador de Resultados */}
        {filteredPosts.length > 0 && (
          <div className="text-center mt-6 md:mt-8 text-sm text-gray">
            <p>
              Mostrando {Math.min(featuredPosts.length + paginatedPosts.length, filteredPosts.length)} de{" "}
              {filteredPosts.length} posts
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
