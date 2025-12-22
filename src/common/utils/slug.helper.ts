export const generateSlug = (title: string): string => {
  if (!title) return '';

  let slug = title.normalize('NFKC').toLowerCase().trim();

  const removeRegex = /[^\p{L}\p{N}\s-]+/gu;
  slug = slug.replace(removeRegex, '');

  slug = slug.replace(/[\s-]+/g, '-');

  slug = slug.replace(/^-+|-+$/g, '');

  return slug;
};
