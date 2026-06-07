#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const scanRoots = ["app", "components", "lib", "hooks", "tests", "scripts"];
const bannedPhrases = [
  "交易信号",
  "信号推送",
  "套利机会",
  "制定操作策略",
  "跟单",
  "喊单",
  "稳赚",
  "保证收益",
  "帮你赚钱",
  "自动交易",
];

const ignoredDirectories = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
  ".git",
]);

const allowedExtensions = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".ts",
  ".tsx",
  ".md",
  ".mdx",
  ".html",
  ".json",
]);

const allowlist = new Map([
  [
    "scripts/check-compliance-copy.mjs",
    [
      // The scanner must define the exact banned phrase list it checks.
      ...bannedPhrases,
    ],
  ],
]);

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(dirPath, out = []) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) continue;
      await collectFiles(path.join(dirPath, entry.name), out);
      continue;
    }

    if (!entry.isFile()) continue;
    const fullPath = path.join(dirPath, entry.name);
    if (!allowedExtensions.has(path.extname(entry.name))) continue;
    out.push(fullPath);
  }
  return out;
}

function lineAndColumn(content, index) {
  const before = content.slice(0, index);
  const lines = before.split("\n");
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

const files = [];
for (const root of scanRoots) {
  const fullPath = path.join(repoRoot, root);
  if (await exists(fullPath)) {
    await collectFiles(fullPath, files);
  }
}

const findings = [];
for (const file of files) {
  const relativePath = path.relative(repoRoot, file).split(path.sep).join("/");
  const content = await fs.readFile(file, "utf8");
  const allowedForFile = allowlist.get(relativePath) ?? [];

  for (const phrase of bannedPhrases) {
    if (allowedForFile.includes(phrase)) continue;

    let index = content.indexOf(phrase);
    while (index !== -1) {
      const position = lineAndColumn(content, index);
      findings.push({ file: relativePath, phrase, ...position });
      index = content.indexOf(phrase, index + phrase.length);
    }
  }
}

if (findings.length > 0) {
  console.error("Compliance copy scan failed. Replace or narrowly allowlist these phrases:");
  for (const finding of findings) {
    console.error(
      `- ${finding.file}:${finding.line}:${finding.column} contains "${finding.phrase}"`,
    );
  }
  process.exit(1);
}

console.log("Compliance copy scan passed.");
