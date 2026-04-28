interface DescTableItem {
  especificacao?: string;
  aplicacao?: string;
  recomendacao_mobil?: string;
}

interface DescTableBlockProps {
  content?: {
    text?: string;
    itens_list?: DescTableItem[];
  };
}

export default function DescTableBlock({ content }: DescTableBlockProps) {
  const tableItems = Array.isArray(content?.itens_list) ? content.itens_list : [];

  if (!content?.text && tableItems.length === 0) {
    return null;
  }

  return (
    <article className="desc-table-block">
      {content?.text && (
        <div
          className="prose-headings:text-dark-blue prose-headings:text-xl md:prose-headings:text-[1.375rem] lg:prose-headings:text-2xl prose-headings:font-semibold prose-headings:pb-4 prose-headings:mb-6 prose-headings:border-b prose-headings:border-[#F3F4F6] prose-p:text-sm md:prose-p:text-base mb-6"
          dangerouslySetInnerHTML={{ __html: content.text }}
        />
      )}

      {tableItems.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F9FAFB]">
              <tr className="border-b border-[#E5E7EB]">
                <th className="px-4 py-[0.875rem] text-base font-semibold text-dark-blue">Especificação</th>
                <th className="px-4 py-[0.875rem] text-base font-semibold text-dark-blue">Aplicação</th>
                <th className="px-4 py-[0.875rem] text-base font-semibold text-dark-blue">Recomendação Mobil</th>
              </tr>
            </thead>
            <tbody>
              {tableItems.map((item, index) => (
                <tr key={`${item?.especificacao || "item"}-${index}`} className="border-t border-[#F9FAFB]">
                  <td className="px-4 py-3 text-sm text-low-dark-blue">{item?.especificacao || "-"}</td>
                  <td className="px-4 py-3 text-sm text-low-dark-blue">{item?.aplicacao || "-"}</td>
                  <td className="px-4 py-3 text-sm text-low-dark-blue">{item?.recomendacao_mobil || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
