"use client";

import { useEffect, useRef, useState } from "react";

interface TableOfContentsItem {
  id: string;
  title: string;
}

interface TableOfContentsBlockProps {
  items?: TableOfContentsItem[];
}

export default function TableOfContentsBlock({ items = [] }: TableOfContentsBlockProps) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!items.length) return;

    const headingEls = items
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!headingEls.length) return;

    // Track which headings are currently intersecting
    const visible = new Map<string, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.boundingClientRect.top);
          } else {
            visible.delete(entry.target.id);
          }
        });

        if (visible.size > 0) {
          // Pick the topmost visible heading
          const topmost = [...visible.entries()].sort((a, b) => a[1] - b[1])[0][0];
          setActiveId(topmost);
        }
      },
      {
        rootMargin: "0px 0px -70% 0px",
        threshold: 0,
      },
    );

    headingEls.forEach((el) => observerRef.current!.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [items]);

  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <aside className="sticky top-28 table-of-contents-block max-h-[calc(100vh-8rem)] overflow-y-auto">
      <h3 className="text-dark-blue font-semibold text-lg mb-4">Índice</h3>
      <nav className="space-y-[0.625rem]">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={[
                "block text-sm line-clamp-2 pl-3 border-l-[3px] transition-all duration-300",
                isActive
                  ? "border-red font-semibold text-dark-blue"
                  : "border-transparent text-low-dark-blue",
              ].join(" ")}
            >
              {item.title}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
