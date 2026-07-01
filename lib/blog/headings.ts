export type TocHeading = {
  level: 2 | 3 | 4;
  text: string;
  id: string;
};

const HEADING_LINE_RE = /^(#{2,4})\s+(.+)$/;

/** Strip inline markdown formatting from heading text for display and slugging. */
export function stripHeadingMarkdown(raw: string): string {
  return raw
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

/** Convert heading text to a URL-safe slug. */
export function slugifyHeading(text: string): string {
  const stripped = stripHeadingMarkdown(text);
  const slug = stripped
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return slug || "section";
}

function uniqueSlug(base: string, used: Map<string, number>): string {
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  if (count === 0) return base;
  return `${base}-${count + 1}`;
}

/** Extract h2–h4 headings from markdown in document order with stable anchor ids. */
export function extractHeadings(markdown: string): TocHeading[] {
  const usedSlugs = new Map<string, number>();
  const headings: TocHeading[] = [];

  for (const line of markdown.split("\n")) {
    const match = HEADING_LINE_RE.exec(line.trim());
    if (!match) continue;

    const level = match[1].length as 2 | 3 | 4;
    const text = stripHeadingMarkdown(match[2]);
    if (!text) continue;

    const baseSlug = slugifyHeading(text);
    const id = uniqueSlug(baseSlug, usedSlugs);
    headings.push({ level, text, id });
  }

  return headings;
}
