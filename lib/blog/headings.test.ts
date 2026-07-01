import { describe, expect, it } from "vitest";

import { extractHeadings, slugifyHeading, stripHeadingMarkdown } from "./headings";

describe("stripHeadingMarkdown", () => {
  it("removes bold, code, and links", () => {
    expect(stripHeadingMarkdown("**Bold** and `code` [link](https://x.com)")).toBe(
      "Bold and code link",
    );
  });
});

describe("slugifyHeading", () => {
  it("lowercases and hyphenates latin text", () => {
    expect(slugifyHeading("Hello World")).toBe("hello-world");
  });

  it("preserves CJK characters", () => {
    expect(slugifyHeading("期权基础")).toBe("期权基础");
  });
});

describe("extractHeadings", () => {
  it("extracts h2–h4 in order with ids", () => {
    const md = `# Title ignored
## First Section
### Sub A
## Second Section
#### Detail
`;
    expect(extractHeadings(md)).toEqual([
      { level: 2, text: "First Section", id: "first-section" },
      { level: 3, text: "Sub A", id: "sub-a" },
      { level: 2, text: "Second Section", id: "second-section" },
      { level: 4, text: "Detail", id: "detail" },
    ]);
  });

  it("deduplicates slug ids", () => {
    const md = `## Overview
## Overview
### Overview
`;
    const headings = extractHeadings(md);
    expect(headings.map((h) => h.id)).toEqual(["overview", "overview-2", "overview-3"]);
  });

  it("returns empty array when no headings", () => {
    expect(extractHeadings("Just a paragraph.\n\nNo headings here.")).toEqual([]);
  });
});
