import DOMPurify from "isomorphic-dompurify";

const ALLOWED_SCRIPT_SRC = /^https:\/\/cdn\.jsdelivr\.net\//;

const SANITIZE_CONFIG = {
  ADD_TAGS: [
    "canvas",
    "iframe",
    "script",
    "input",
    "label",
    "div",
    "p",
    "h2",
    "h3",
    "span",
    "b",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  ADD_ATTR: [
    "id",
    "class",
    "style",
    "width",
    "height",
    "src",
    "sandbox",
    "loading",
    "data-chart",
    "aria-label",
    "role",
    "type",
    "min",
    "step",
    "value",
    "inputmode",
    "for",
  ],
  ALLOW_DATA_ATTR: true,
  FORBID_TAGS: ["object", "embed", "form", "button"],
};

export type BlogHtmlParts = {
  html: string;
  styles: string[];
  inlineScripts: string[];
};

/** Split trusted admin HTML into body markup, CSS blocks, and inline script bodies. */
export function splitBlogHtmlParts(raw: string): BlogHtmlParts {
  const styles: string[] = [];
  let html = raw.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_full, body: string) => {
    const trimmed = body.trim();
    if (trimmed) styles.push(trimmed);
    return "";
  });

  const inlineScripts: string[] = [];
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (_full, attrs: string, body: string) => {
    const srcMatch = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(attrs);
    const src = srcMatch?.[1] ?? "";
    if (src && ALLOWED_SCRIPT_SRC.test(src)) {
      return `<script src="${src}"></script>`;
    }
    const trimmed = body.trim();
    if (trimmed) inlineScripts.push(trimmed);
    return "";
  });

  return { html, styles, inlineScripts };
}

/** Sanitize admin-authored HTML. External Chart.js via jsDelivr only; inline scripts run client-side. */
export function sanitizeBlogHtml(raw: string): string {
  if (!raw.trim()) return "";
  const { html } = splitBlogHtmlParts(raw);
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}

export function extractBlogHtmlStyles(raw: string): string[] {
  return splitBlogHtmlParts(raw).styles;
}

export function extractBlogHtmlInlineScripts(raw: string): string[] {
  return splitBlogHtmlParts(raw).inlineScripts;
}
