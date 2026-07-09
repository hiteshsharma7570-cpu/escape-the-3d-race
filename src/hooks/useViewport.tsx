import { useEffect, useState } from "react";

export interface ViewportInfo {
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
  isMobile: boolean;
  isShort: boolean; // phone landscape / short viewports
}

function read(): ViewportInfo {
  if (typeof window === "undefined") {
    return { width: 1024, height: 768, orientation: "landscape", isMobile: false, isShort: false };
  }
  // visualViewport tracks the visible area minus browser chrome (URL bar, keyboard).
  const vv = window.visualViewport;
  const width = Math.round(vv?.width ?? window.innerWidth);
  const height = Math.round(vv?.height ?? window.innerHeight);
  return {
    width,
    height,
    orientation: width >= height ? "landscape" : "portrait",
    isMobile: width < 768,
    isShort: height < 560,
  };
}

/**
 * Reactive viewport hook. Updates on resize, orientation change, and
 * visualViewport changes (browser URL/toolbar appearing or disappearing,
 * on-screen keyboard, etc). One source of truth for layout math.
 */
export function useViewport(): ViewportInfo {
  const [vp, setVp] = useState<ViewportInfo>(() => read());

  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      // Coalesce bursts of resize events (mobile URL bar animates in/out) into
      // a single state update per frame.
      raf = requestAnimationFrame(() => setVp(read()));
    };
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, []);

  return vp;
}