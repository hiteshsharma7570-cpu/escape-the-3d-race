import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Newspaper, Check, X as XIcon, HelpCircle, Bookmark } from "lucide-react";
import type { NewspaperHeadline, TileHint } from "@/data/newspapers";

export interface ArchiveEntry {
  turn: number;
  headline: NewspaperHeadline;
  matched: boolean | null; // null = not yet evaluated
}

interface NewsArchiveProps {
  entries: ArchiveEntry[];
  readLater: NewspaperHeadline[];
}

const HINT_LABEL: Record<TileHint, string> = {
  market_boom: "Market Boom",
  market_crash: "Market Crash",
  opportunity_high: "Opportunity (High)",
  opportunity_low: "Opportunity (Low)",
  tax_incoming: "Tax Incoming",
  salary_up: "Salary Up",
  expense_incoming: "Expense Incoming",
  windfall: "Windfall",
  neutral: "Neutral",
};

export const NewsArchive = ({ entries, readLater }: NewsArchiveProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-card">
          <Newspaper className="w-4 h-4" />
          News Archive
          {entries.length > 0 && (
            <span className="text-[10px] rounded-full bg-primary text-primary-foreground px-1.5 py-0.5">
              {entries.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" /> News Archive
          </SheetTitle>
        </SheetHeader>

        {readLater.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
              <Bookmark className="w-3 h-3" /> Read Later
            </h4>
            <div className="space-y-2">
              {readLater.map((h) => (
                <div key={`rl-${h.id}`} className="rounded-md border border-border bg-card p-2">
                  <div className="text-sm font-semibold leading-tight">{h.headline}</div>
                  <div className="text-[11px] italic text-muted-foreground mt-0.5">{h.subheadline}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Front Pages You've Seen
          </h4>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No headlines yet. The newspaper appears before each dice roll.
            </p>
          ) : (
            <div className="space-y-2">
              {entries.map((e, i) => (
                <div
                  key={`${e.headline.id}-${i}`}
                  className="rounded-md border border-border bg-card p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-muted-foreground">
                      Turn {e.turn} · {e.headline.paperName}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${
                        e.matched === true
                          ? "bg-green-600 text-white"
                          : e.matched === false
                          ? "bg-red-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {e.matched === true ? (
                        <>
                          <Check className="w-3 h-3" /> Came true
                        </>
                      ) : e.matched === false ? (
                        <>
                          <XIcon className="w-3 h-3" /> Red herring
                        </>
                      ) : (
                        <>
                          <HelpCircle className="w-3 h-3" /> Pending
                        </>
                      )}
                    </span>
                  </div>
                  <div className="text-sm font-semibold leading-tight">{e.headline.headline}</div>
                  <div className="text-[11px] italic text-muted-foreground mt-0.5">
                    {e.headline.subheadline}
                  </div>
                  <div className="text-[10px] mt-1 text-primary font-medium">
                    Hint: {HINT_LABEL[e.headline.hint]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NewsArchive;