interface DescriptionBlockProps {
  desc?: string;
}

export default function DescriptionBlock({ desc }: DescriptionBlockProps) {
  if (!desc) {
    return null;
  }

  return (
    <article className="description-block">
      <div
        className="prose prose-p:text-sm prose-p:m-0 text-low-dark-blue prose-img:rounded-lg prose-img:h-[20.5rem] prose-img:my-12 prose-img:object-cover"
        dangerouslySetInnerHTML={{ __html: desc }}
      />
    </article>
  );
}
