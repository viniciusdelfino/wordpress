// Helpers do funil
const getPostCategoryIds = (categories: any[] = []) => {
  return categories.map(cat =>
    typeof cat === "object" ? cat.id : cat
  );
};

const matchByACF = (post: any, catID: number[]) => {
  if (catID.length === 0) return false;
  return getPostCategoryIds(post.categories).some(id =>
    catID.includes(id)
  );
};

const matchByCategorySlug = (post: any, urlSegment: string): boolean => {
  return post.categories?.some((cat: any) => {
    const slug = typeof cat === "object" ? cat.slug : "";
    return slug && urlSegment.includes(slug.toLowerCase());
  });     
};

export const helpers = {
    getPostCategoryIds,
    matchByACF,
    matchByCategorySlug,
}