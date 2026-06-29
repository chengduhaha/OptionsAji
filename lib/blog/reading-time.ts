/** Rough reading time for mixed zh/en markdown (≈400 words per minute). */
export function estimateReadingMinutes(text: string): number {
  const stripped = text.replace(/[#*`_~\[\]()>-]/g, " ");
  const latinWords = stripped.match(/[a-zA-Z0-9]+/g)?.length ?? 0;
  const cjkChars = stripped.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  const effectiveWords = latinWords + cjkChars / 2;
  return Math.max(1, Math.ceil(effectiveWords / 400));
}
