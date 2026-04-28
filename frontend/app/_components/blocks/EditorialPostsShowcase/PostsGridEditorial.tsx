"use client";

import { useState, useCallback, useMemo } from "react";
import PostsFilter from "./components/PostsFilter";
import PostsGrid from "./components/PostsGrid";
import LoadMoreButton from "./components/LoadMoreButton";
import {
  filterAndSortPosts,
  paginatePosts,
  getAvailableSubjects,
} from "./utils/postsFiltering";
import type {
  SortOption,
  ContentTypeOption,
  FilterStrategy,
  FilterStrategyConfig,
} from "./utils/postsFiltering";

interface PostsGridEditorialProps {
  posts?: any[];
  postsPerPage?: number;
  defaultSort?: SortOption;
  title?: string;
  description?: string;
  desc?: string;
  filter_strategy?: FilterStrategy;
  editorial_parent_name?: string;
  use_filter_layout?: boolean;
}

export default function PostsGridEditorial({
  posts = [],
  postsPerPage = 9,
  defaultSort = "recente",
  title,
  description,
  desc,
  filter_strategy = "editorial_children",
  editorial_parent_name,
  use_filter_layout = true,
}: PostsGridEditorialProps) {
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
    [posts, filterStrategyConfig],
  );

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

  const paginatedPosts = useMemo(() => {
    return paginatePosts(filteredPosts, postsPerPage, currentPage);
  }, [filteredPosts, postsPerPage, currentPage]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const hasMore = currentPage < totalPages;

  const handleFilterChange = useCallback(
    (newFilters: {
      subject: string;
      contentType: ContentTypeOption;
      sortBy: SortOption;
    }) => {
      setSubject(newFilters.subject);
      setContentType(newFilters.contentType);
      setSortBy(newFilters.sortBy);
      setCurrentPage(1);
    },
    [],
  );

  const handleLoadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const sectionDescription = desc || description || "";

  if (!use_filter_layout) {
    return (
      <section className="py-6 md:py-8 lg:py-10 posts-grid-editorial">
        <div className="container">
          <header className="mb-6 md:mb-8 lg:mb-10">
            {sectionDescription && (
              <div
                dangerouslySetInnerHTML={{ __html: sectionDescription }}
                className="prose-p:text-low-dark-blue lg:prose-p:text-lg"
              />
            )}
          </header>
          <PostsGrid
            posts={paginatedPosts}
            emptyMessage="Não encontramos conteúdos nesta aba no momento."
            useTabLayout={true}
            activeContentType={contentType}
            sortBy={sortBy}
            onContentTypeChange={(newType) => {
              setContentType(newType);
              setCurrentPage(1);
            }}
            onSortByChange={(newSort) => {
              setSortBy(newSort);
              setCurrentPage(1);
            }}
          />
          <LoadMoreButton
            hasMore={hasMore}
            onClick={handleLoadMore}
            isLoading={false}
          />
        </div>
      </section>
    );
  }

  return (
    <div className="py-6 md:py-8 lg:py-10 posts-grid-editorial">
      <div className="container">
        <header className="mb-6 md:mb-8 lg:mb-10">
          {sectionDescription && (
            <div
              dangerouslySetInnerHTML={{ __html: sectionDescription }}
              className="prose-p:text-low-dark-blue lg:prose-p:text-lg prose-headings:text-dark-blue prose-headings:text-2xl md:prose-headings:text-[1.75rem] lg:prose-headings:text-[2rem] prose-headings:font-semibold prose-headings:mb-2"
            />
          )}
        </header>
        <PostsFilter
          subjects={subjectOptions}
          filterStrategy={filterStrategyConfig}
          onFilterChange={handleFilterChange}
        />

        <PostsGrid
          posts={paginatedPosts}
          emptyMessage="Nenhum post encontrado com os filtros selecionados."
          useTabLayout={false}
        />

        <LoadMoreButton
          hasMore={hasMore}
          onClick={handleLoadMore}
          isLoading={false}
        />
      </div>
    </div>
  );
}
