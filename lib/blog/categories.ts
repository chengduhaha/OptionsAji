export function blogCategoryLabel(t: (key: string) => string, category: string): string {
  const key = `blog.documents.categories.${category}`;
  const translated = t(key);
  return translated === key ? category : translated;
}

export function blogCategoryHint(t: (key: string) => string, category: string): string | undefined {
  const key = `blog.documents.categoryHints.${category}`;
  const translated = t(key);
  return translated === key ? undefined : translated;
}
