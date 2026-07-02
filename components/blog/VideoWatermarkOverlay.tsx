"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/lib/auth-context";
import type { AuthUser } from "@/lib/auth-context";

type WatermarkStyle = {
  top: string;
  left: string;
  rotate: number;
  opacity: number;
};

type VideoWatermarkOverlayProps = {
  playing: boolean;
};

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function watermarkLabel(user: AuthUser | null): string {
  if (!user) return "访客";
  if (user.email) return user.email;
  if (user.id) return `ID:${user.id.slice(0, 8)}`;
  return "访客";
}

export default function VideoWatermarkOverlay({ playing }: VideoWatermarkOverlayProps) {
  const { user } = useAuth();
  const [style, setStyle] = useState<WatermarkStyle>({
    top: "20%",
    left: "30%",
    rotate: 0,
    opacity: 0.2,
  });

  const reposition = useCallback(() => {
    setStyle({
      top: `${randomBetween(8, 72)}%`,
      left: `${randomBetween(8, 62)}%`,
      rotate: randomBetween(-12, 12),
      opacity: randomBetween(0.15, 0.25),
    });
  }, []);

  useEffect(() => {
    if (!playing) return;

    reposition();
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        reposition();
        scheduleNext();
      }, randomBetween(8000, 15000));
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [playing, reposition]);

  if (!playing) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <span
        className="absolute select-none whitespace-nowrap font-mono text-[11px] text-white mix-blend-difference"
        style={{
          top: style.top,
          left: style.left,
          opacity: style.opacity,
          transform: `rotate(${style.rotate}deg)`,
        }}
      >
        {watermarkLabel(user)}
      </span>
    </div>
  );
}
