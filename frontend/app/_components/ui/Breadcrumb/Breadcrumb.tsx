import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={`pt-6 md:pt-8 lg:pt-10 pb-4 md:pb-6 lg:pb-8 ${className}`}>
      <div className="container">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-x-2">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-dark-blue transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-gray-600" : ""}>
                    {item.label}
                  </span>
                )}

                {!isLast && <span className="text-gray">/</span>}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}