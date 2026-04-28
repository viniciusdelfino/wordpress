import { slugify } from "@/app/blog/utils";

interface DescriptionCompleteBlockProps {
  title?: string;
  desc?: string;
  indice?: boolean;
  blockId?: string;
}

export default function DescriptionCompleteBlock({
  title,
  desc,
  indice = false,
  blockId,
}: DescriptionCompleteBlockProps) {
  const titleId = blockId || (title ? slugify(title) : "");

  if (!title && !desc) {
    return null;
  }

  const titleElement = title ? (
    <h2 className="text-dark-blue text-xl md:text-[1.375rem] lg:text-2xl font-semibold pb-4 mb-6 border-b border-[#F3F4F6]" id={titleId}>
      {indice ? (
        <a href={`#${titleId}`}>
          {title}
        </a>
      ) : (
        title
      )}
    </h2>
  ) : null;

  return (
    <article className="description-complete-block">
      {titleElement}
      {desc && (
        <div
          className="prose-p:text-sm md:prose-p:text-base prose-p:text-low-dark-blue"
          dangerouslySetInnerHTML={{ __html: desc }}
        />
      )}
    </article>
  );
}
