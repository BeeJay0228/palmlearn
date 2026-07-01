"use client";

import { useState, useEffect } from "react";

interface ScrollState {
  scrollY: number;
  isScrolled: boolean;
  isAtTop: boolean;
  direction: "up" | "down";
}

export function useScroll(threshold = 10): ScrollState {
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollY: 0,
    isScrolled: false,
    isAtTop: true,
    direction: "down",
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? "down" : "up";

      setScrollState({
        scrollY: currentScrollY,
        isScrolled: currentScrollY > threshold,
        isAtTop: currentScrollY === 0,
        direction,
      });

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return scrollState;
}
