import { wordpressAPI } from "./lib/wordpress-api";
import BlockRenderer from "./_components/BlockRenderer";
import Error404Block from "./_components/blocks/Error404Block";

export default async function NotFound() {
  const page = await wordpressAPI.getPage("erro-404");

  // Se a página existe no WordPress, renderiza os blocos
  if (page?.blocks && page.blocks.length > 0) {
    return <BlockRenderer blocks={page.blocks} />;
  }

  // Fallback mínimo se a página não existir no WP
  return <Error404Block />;
}
