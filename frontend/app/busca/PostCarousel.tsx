'use client';

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { PostCard } from "../_components/blocks/Contents"; 

function usePostsCount() {
  const [count, setCount] = useState(3);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setCount(3); 
      } else if (window.innerWidth >= 768) {
        setCount(2); 
      } else {
        setCount(3); 
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return count;
}

export function PostCarousel({ posts }: { posts: any[] }) {
    const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLElement | null>(null);
    const [paginationEl, setPaginationEl] = useState<HTMLElement | null>(null);
    const count = usePostsCount();

    return (
        <div className="w-full">
            <div className="hidden md:flex flex-row gap-4">
                {posts.slice(0, count).map((post) => <PostCard post={post} key={post.id} />)}
            </div>
            
            <div className="w-full md:hidden">
                <Swiper
                    modules={[Pagination, Navigation]}
                    navigation={{ prevEl, nextEl }}
                    pagination={{
                        el: paginationEl,
                        clickable: true,
                        renderBullet: (index, className) => `<span class="${className} custom-bullet"></span>`,
                    }}
                    spaceBetween={16}
                    slidesPerView={1.1}
                    className="w-full"
                >
                    {posts.slice(0, 3).map((post) => (
                        <SwiperSlide key={post.id}>
                            <PostCard post={post} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                <div className="mt-6 flex items-center justify-center gap-x-4 relative z-10">
                    <button ref={setPrevEl} className="w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>

                    <div ref={setPaginationEl} className="!static !w-auto flex gap-x-2 items-center justify-center min-h-[12px]"></div>

                    <button ref={setNextEl} className="w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
