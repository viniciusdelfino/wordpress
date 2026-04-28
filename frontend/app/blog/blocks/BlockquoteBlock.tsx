interface BlockquoteBlockProps {
  text?: string;
}

export default function BlockquoteBlock({ text }: BlockquoteBlockProps) {
  if (!text) {
    return null;
  }

  return (
    <div className="blockquote-block rounded-r-xl border-l-8 border-red p-6 mb-12">
      <blockquote>
        <div
          className="prose max-w-none text-low-dark-blue prose-p:my-0 prose-strong:font-bold prose-p:before:content-['']"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </blockquote>
    </div>
  );
}
