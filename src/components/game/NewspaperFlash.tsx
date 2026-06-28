import { useEffect, useMemo, useRef, useState } from "react";
import { X, Bookmark, BookmarkCheck } from "lucide-react";
import type { NewspaperHeadline } from "@/data/newspapers";
import { cn } from "@/lib/utils";

interface NewspaperFlashProps {
  headline: NewspaperHeadline | null;
  durationMs?: number;
  onDismiss: () => void;
  onReadLater?: (h: NewspaperHeadline) => void;
  isSavedForLater?: boolean;
}

const SECTION_COLORS: Record<string, string> = {
  Markets: "bg-blue-600 text-white",
  Tax: "bg-red-600 text-white",
  Economy: "bg-amber-600 text-white",
  Startups: "bg-purple-600 text-white",
  "Real Estate": "bg-emerald-600 text-white",
  Crypto: "bg-orange-600 text-white",
  Policy: "bg-indigo-600 text-white",
  Commodities: "bg-yellow-600 text-white",
  Insurance: "bg-cyan-700 text-white",
  "Mutual Funds": "bg-teal-600 text-white",
  Banking: "bg-rose-600 text-white",
  Budget: "bg-fuchsia-600 text-white",
  Infrastructure: "bg-slate-700 text-white",
  Regulation: "bg-zinc-700 text-white",
  Corporate: "bg-violet-600 text-white",
  Energy: "bg-orange-700 text-white",
  Global: "bg-sky-700 text-white",
  Health: "bg-pink-600 text-white",
  Jobs: "bg-stone-600 text-white",
  Fintech: "bg-blue-700 text-white",
};

const SENTIMENT_STRIP: Record<NewspaperHeadline["sentiment"], { label: string; classes: string }> = {
  positive: { label: "Markets Favorable", classes: "bg-green-600 text-white" },
  negative: { label: "Caution Advised",  classes: "bg-red-600 text-white" },
  warning:  { label: "Watch Out",         classes: "bg-orange-500 text-white" },
  neutral:  { label: "Steady As She Goes", classes: "bg-gray-500 text-white" },
};

const todayString = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const NewspaperFlash = ({
  headline,
  durationMs = 4000,
  onDismiss,
  onReadLater,
  isSavedForLater,
}: NewspaperFlashProps) => {
  const [visible, setVisible] = useState(false);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideOutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable per-show edition number
  const edition = useMemo(
    () => (headline ? Math.floor(Math.random() * 999) + 1 : 0),
    [headline?.id],
  );

  const beginDismiss = () => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
    setVisible(false);
    slideOutTimer.current = setTimeout(() => {
      onDismiss();
    }, 320);
  };

  useEffect(() => {
    if (!headline) {
      setVisible(false);
      return;
    }
    // slide in next frame
    const raf = requestAnimationFrame(() => setVisible(true));
    dismissTimer.current = setTimeout(beginDismiss, durationMs);
    return () => {
      cancelAnimationFrame(raf);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      if (slideOutTimer.current) clearTimeout(slideOutTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headline?.id]);

  if (!headline) return null;

  const sectionClasses = SECTION_COLORS[headline.section] || "bg-slate-600 text-white";
  const strip = SENTIMENT_STRIP[headline.sentiment];

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-[60] flex justify-center pointer-events-none",
      )}
      aria-live="polite"
    >
      <div
        className={cn(
          "pointer-events-auto w-full max-w-3xl mx-2 mt-2 rounded-md border border-black/70 shadow-2xl",
          "transition-transform duration-300 ease-out",
          visible ? "translate-y-0" : "-translate-y-[110%]",
        )}
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          color: "#111",
          background:
            "repeating-linear-gradient(0deg, #fdfdf0 0px, #fdfdf0 2px, #f7f4e0 3px, #fdfdf0 4px)",
        }}
      >
        {/* Masthead */}
        <div className="flex items-center justify-between px-4 py-2 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>📰</span>
            <span className="text-xl font-extrabold tracking-tight uppercase leading-none">
              {headline.paperName}
            </span>
          </div>
          <div className="text-[11px] text-black/70 italic flex flex-col items-end leading-tight">
            <span>{todayString()}</span>
            <span>Edition #{edition} · Morning</span>
          </div>
          <button
            type="button"
            onClick={beginDismiss}
            aria-label="Dismiss newspaper"
            className="ml-2 rounded-full p-1 hover:bg-black/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Headline */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider",
                sectionClasses,
              )}
            >
              {headline.section}
            </span>
            <span className="text-[10px] uppercase text-black/60 tracking-widest">
              Breaking
            </span>
          </div>
          <h2
            className="font-black leading-tight"
            style={{ fontSize: 22, fontFamily: "Georgia, serif" }}
          >
            {headline.headline}
          </h2>
          <p
            className="italic text-gray-700 mt-1"
            style={{ fontSize: 14, fontFamily: "Georgia, serif" }}
          >
            {headline.subheadline}
          </p>
        </div>

        {/* Bottom strip */}
        <div className="flex items-stretch border-t border-black">
          <div className={cn("flex-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-center", strip.classes)}>
            {strip.label}
          </div>
          {onReadLater && (
            <button
              type="button"
              onClick={() => onReadLater(headline)}
              className="px-3 py-1.5 text-xs font-semibold bg-black/85 text-white hover:bg-black flex items-center gap-1"
            >
              {isSavedForLater ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5" /> Saved
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" /> Read Later
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewspaperFlash;