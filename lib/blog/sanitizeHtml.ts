import DOMPurify from "isomorphic-dompurify";

const ALLOWED_SCRIPT_SRC = /^https:\/\/cdn\.jsdelivr\.net\//;

/** Sanitize admin-authored HTML. Allows Chart.js via jsDelivr; blocks inline scripts. */
export function sanitizeBlogHtml(raw: string): string {
  if (!raw.trim()) return "";

  DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    if (data.tagName !== "script" || !(node instanceof Element)) return;
    const src = node.getAttribute("src");
    if (!src || !ALLOWED_SCRIPT_SRC.test(src)) {
      node.parentNode?.removeChild(node);
    }
  });

  const cleaned = DOMPurify.sanitize(raw, {
    ADD_TAGS: ["canvas", "iframe", "script"],
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
    ],
    ALLOW_DATA_ATTR: true,
    FORBID_TAGS: ["object", "embed", "form", "input", "button"],
  });

  DOMPurify.removeHook("uponSanitizeElement");
  return cleaned;
}
