import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";

interface FiveCroreCertificateProps {
  open: boolean;
  playerName: string;
  turnCount?: number;
  onClose: () => void;
  onPlayAgain: () => void;
}

// Deterministic certificate ID from name + timestamp
const buildCertId = (name: string) => {
  const ts = Date.now().toString(36).toUpperCase();
  const slug = (name || "PLAYER")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 4)
    .padEnd(4, "X");
  let hash = 0;
  const seed = `${name}-${ts}`;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const checksum = hash.toString(36).toUpperCase().slice(0, 4).padStart(4, "0");
  return `ERR-${slug}-${ts.slice(-5)}-${checksum}`;
};

export const FiveCroreCertificate = ({
  open,
  playerName,
  turnCount,
  onClose,
  onPlayAgain,
}: FiveCroreCertificateProps) => {
  // Freeze the cert ID + issued-at on open
  const [issuedAt, setIssuedAt] = useState<Date>(() => new Date());
  const [certId, setCertId] = useState<string>(() => buildCertId(playerName));
  const [confettiBurst, setConfettiBurst] = useState(false);

  useEffect(() => {
    if (open) {
      const now = new Date();
      setIssuedAt(now);
      setCertId(buildCertId(playerName));
      setConfettiBurst(true);
      const t = setTimeout(() => setConfettiBurst(false), 2200);
      return () => clearTimeout(t);
    }
  }, [open, playerName]);

  const dateStr = useMemo(
    () =>
      issuedAt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [issuedAt]
  );
  const timeStr = useMemo(
    () =>
      issuedAt.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [issuedAt]
  );

  const turnsLine =
    turnCount && turnCount > 0
      ? `Achieved in ${turnCount} turn${turnCount === 1 ? "" : "s"} of strategic play.`
      : `Awarded for reaching the pinnacle of financial freedom.`;

  const handleDownload = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();

    // Deep emerald → navy gradient (approximated with horizontal bands)
    const bands = 60;
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1);
      // from (6,40,40) emerald → (10,14,46) deep navy
      const r = Math.round(6 + (10 - 6) * t);
      const g = Math.round(40 + (14 - 40) * t);
      const b = Math.round(40 + (46 - 40) * t);
      doc.setFillColor(r, g, b);
      doc.rect(0, (h / bands) * i, w, h / bands + 1, "F");
    }

    // Faint rupee watermark pattern
    doc.setFont("times", "bold");
    doc.setTextColor(255, 215, 0);
    (doc as unknown as { setGState?: (g: unknown) => void }).setGState?.(
      (doc as unknown as { GState: new (o: { opacity: number }) => unknown }).GState
        ? new (doc as unknown as { GState: new (o: { opacity: number }) => unknown }).GState({
            opacity: 0.05,
          })
        : undefined
    );
    doc.setFontSize(40);
    for (let y = 60; y < h; y += 70) {
      for (let x = 40; x < w; x += 90) {
        doc.text("\u20B9", x, y);
      }
    }
    (doc as unknown as { setGState?: (g: unknown) => void }).setGState?.(
      (doc as unknown as { GState: new (o: { opacity: number }) => unknown }).GState
        ? new (doc as unknown as { GState: new (o: { opacity: number }) => unknown }).GState({
            opacity: 1,
          })
        : undefined
    );

    // Ornate double border (gold foil)
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(5);
    doc.rect(20, 20, w - 40, h - 40);
    doc.setLineWidth(1);
    doc.rect(32, 32, w - 64, h - 64);
    doc.setLineWidth(0.5);
    doc.rect(38, 38, w - 76, h - 76);

    // Corner ornaments
    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.setTextColor(212, 175, 55);
    doc.text("\u2756", 46, 60);
    doc.text("\u2756", w - 50, 60);
    doc.text("\u2756", 46, h - 46);
    doc.text("\u2756", w - 50, h - 46);

    // Header
    doc.setFont("times", "bold");
    doc.setFontSize(13);
    doc.setTextColor(212, 175, 55);
    doc.text("\u2726  ESCAPE THE RAT RACE  \u2726", w / 2, 80, { align: "center" });

    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.setTextColor(220, 220, 230);
    doc.text("Certificate of Financial Freedom", w / 2, 100, { align: "center" });

    // Recipient
    doc.setFont("times", "italic");
    doc.setFontSize(12);
    doc.setTextColor(200, 200, 220);
    doc.text("This is to certify that", w / 2, 140, { align: "center" });

    doc.setFont("times", "bold");
    doc.setFontSize(36);
    doc.setTextColor(255, 223, 100);
    doc.text(playerName, w / 2, 185, { align: "center" });

    // Underline
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1);
    const nameW = doc.getTextWidth(playerName);
    doc.line(w / 2 - nameW / 2 - 10, 195, w / 2 + nameW / 2 + 10, 195);

    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.setTextColor(220, 220, 230);
    doc.text(
      "has demonstrated exceptional financial acumen and disciplined wealth building,",
      w / 2,
      218,
      { align: "center" }
    );
    doc.text("and has successfully accumulated", w / 2, 234, { align: "center" });

    // Amount
    doc.setFont("times", "bold");
    doc.setFontSize(44);
    doc.setTextColor(255, 215, 0);
    doc.text("Rs. 5,00,00,000", w / 2, 285, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(220, 220, 230);
    doc.text("FIVE CRORE RUPEES IN CASH", w / 2, 308, { align: "center" });

    // Personal line
    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.setTextColor(200, 215, 230);
    doc.text(turnsLine, w / 2, 335, { align: "center" });

    // Decorative divider
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.7);
    doc.line(w / 2 - 140, 352, w / 2 - 30, 352);
    doc.line(w / 2 + 30, 352, w / 2 + 140, 352);
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(212, 175, 55);
    doc.text("\u2605", w / 2, 357, { align: "center" });

    // Wax seal (right)
    const sealX = w - 110;
    const sealY = h - 130;
    doc.setFillColor(140, 20, 30);
    doc.circle(sealX, sealY, 36, "F");
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1.5);
    doc.circle(sealX, sealY, 36);
    doc.setLineWidth(0.5);
    doc.circle(sealX, sealY, 30);
    doc.setFont("times", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 215, 0);
    doc.text("OFFICIALLY", sealX, sealY - 8, { align: "center" });
    doc.setFontSize(11);
    doc.text("\u2605", sealX, sealY + 4, { align: "center" });
    doc.setFontSize(8);
    doc.text("CERTIFIED", sealX, sealY + 16, { align: "center" });

    // Signature line (left)
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.8);
    doc.line(70, h - 110, 240, h - 110);
    doc.setFont("times", "italic");
    doc.setFontSize(14);
    doc.setTextColor(255, 215, 0);
    doc.text("Game Master", 70, h - 115);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 220);
    doc.text("Escape the Rat Race", 70, h - 96);

    // Footer: cert ID + date/time
    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 220);
    doc.text(`Certificate ID:  ${certId}`, 70, h - 60);
    doc.text(`Issued:  ${dateStr}  ${timeStr}`, 70, h - 46);

    doc.setFont("times", "italic");
    doc.setFontSize(9);
    doc.setTextColor(180, 195, 215);
    doc.text(
      '"Financial freedom is not about having money — it\'s about having choices."',
      w / 2,
      h - 28,
      { align: "center" }
    );

    doc.save(`${playerName}-5cr-certificate.pdf`);
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(
        `🏆 ${playerName} just accumulated ₹5 Crore in Escape the Rat Race! Certificate #${certId}`
      );
      toast.success("Achievement copied to clipboard!");
    } catch {
      toast.error("Could not copy.");
    }
  };

  // Confetti pieces
  const confetti = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.4 + Math.random() * 1.2,
        rotate: Math.random() * 360,
        color: ["#FFD700", "#FFA500", "#FF6B6B", "#9DE0AD", "#56C7E5"][i % 5],
      })),
    [open]
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 border-0 bg-transparent shadow-none overflow-visible">
        {/* Confetti burst */}
        <AnimatePresence>
          {confettiBurst && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {confetti.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ y: -20, opacity: 0, rotate: 0 }}
                  animate={{ y: 600, opacity: [0, 1, 1, 0], rotate: p.rotate }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
                  className="absolute w-2 h-3 rounded-sm"
                  style={{ left: `${p.left}%`, top: 0, background: p.color }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          className="relative p-10 text-center overflow-hidden rounded-lg"
          style={{
            background:
              "radial-gradient(circle at 30% 0%, rgba(16,80,72,0.95) 0%, rgba(8,18,46,0.98) 70%)",
            border: "5px double #D4AF37",
            fontFamily: "Georgia, serif",
            color: "#FFF8DC",
            boxShadow:
              "0 0 60px rgba(212,175,55,0.35), inset 0 0 80px rgba(0,0,0,0.5)",
          }}
        >
          {/* Inner gold border */}
          <div
            className="absolute inset-3 pointer-events-none rounded"
            style={{ border: "1px solid rgba(212,175,55,0.55)" }}
          />
          <div
            className="absolute inset-5 pointer-events-none rounded"
            style={{ border: "0.5px solid rgba(212,175,55,0.3)" }}
          />

          {/* Rupee pattern watermark */}
          <div
            className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-[0.05]"
            aria-hidden
          >
            <div
              className="absolute inset-0 flex flex-wrap content-start gap-6 p-6 text-yellow-300 text-3xl font-bold"
            >
              {Array.from({ length: 80 }).map((_, i) => (
                <span key={i}>₹</span>
              ))}
            </div>
          </div>

          {/* Animated gold shimmer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.6, delay: 0.2, ease: "easeInOut" }}
            className="absolute inset-y-0 w-1/3 pointer-events-none"
            style={{
              background:
                "linear-gradient(120deg, transparent, rgba(255,215,0,0.18), transparent)",
            }}
          />

          {/* Corner ornaments */}
          <div className="absolute top-4 left-6 text-yellow-400 text-2xl">❖</div>
          <div className="absolute top-4 right-6 text-yellow-400 text-2xl">❖</div>
          <div className="absolute bottom-4 left-6 text-yellow-400 text-2xl">❖</div>
          <div className="absolute bottom-4 right-6 text-yellow-400 text-2xl">❖</div>

          <div className="relative">
            <p className="text-yellow-400 tracking-[0.35em] text-xs font-bold mb-1">
              ✦  ESCAPE THE RAT RACE  ✦
            </p>
            <p className="text-[11px] text-yellow-100/70 italic mb-5">
              Certificate of Financial Freedom
            </p>

            <p className="text-xs text-yellow-100/70 italic mb-1">This is to certify that</p>
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-5xl font-extrabold mb-2"
              style={{
                color: "#FFD96B",
                textShadow: "0 0 24px rgba(255,215,0,0.45)",
                letterSpacing: "0.02em",
              }}
            >
              {playerName}
            </motion.h1>
            <div className="h-px bg-yellow-500/50 mx-auto max-w-xs mb-4" />

            <p className="text-[13px] text-yellow-100/90 max-w-xl mx-auto mb-2">
              has demonstrated exceptional financial acumen and disciplined wealth building,
            </p>
            <p className="text-sm text-yellow-200 italic mb-2">and has successfully accumulated</p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-5xl font-extrabold mb-1"
              style={{ color: "#FFD700", textShadow: "0 0 28px rgba(255,215,0,0.7)" }}
            >
              ₹5,00,00,000
            </motion.p>
            <p className="text-[11px] tracking-[0.45em] text-yellow-100/80 mb-3">
              FIVE CRORE RUPEES IN CASH
            </p>

            <p className="text-xs italic text-emerald-200/90 mb-5">{turnsLine}</p>

            {/* Decorative star divider */}
            <div className="flex items-center justify-center gap-2 mb-5 text-yellow-400/80">
              <div className="h-px w-24 bg-yellow-500/40" />
              <span>★</span>
              <div className="h-px w-24 bg-yellow-500/40" />
            </div>

            {/* Signature + Wax Seal */}
            <div className="flex justify-between items-end px-2 mt-3">
              <div className="text-left">
                <p
                  className="text-lg text-yellow-300 italic"
                  style={{ fontFamily: "'Brush Script MT', cursive" }}
                >
                  Game Master
                </p>
                <div className="border-t border-yellow-500/60 pt-1 w-44 text-[10px] text-yellow-100/70">
                  Escape the Rat Race
                </div>
              </div>

              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: -12 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 12 }}
                className="relative w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, #c8253a 0%, #7a0f1d 70%, #4a0a14 100%)",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.6), inset 0 0 12px rgba(0,0,0,0.4), 0 0 18px rgba(212,175,55,0.4)",
                  border: "2px solid #D4AF37",
                }}
              >
                <div
                  className="absolute inset-1 rounded-full"
                  style={{ border: "1px dashed rgba(255,215,0,0.6)" }}
                />
                <Trophy className="w-8 h-8 text-yellow-300 drop-shadow" />
              </motion.div>
            </div>

            {/* Cert ID + date */}
            <div className="mt-6 flex justify-between items-center text-[10px] font-mono text-yellow-100/70 px-2">
              <span>ID: {certId}</span>
              <span>
                {dateStr} · {timeStr}
              </span>
            </div>

            <p className="text-[10px] italic text-yellow-100/50 mt-4">
              "Financial freedom is not about having money — it's about having choices."
            </p>
          </div>
        </motion.div>

        <div className="flex gap-2 justify-center mt-4 flex-wrap">
          <Button
            onClick={handleDownload}
            className="gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
          >
            <Download className="w-4 h-4" /> Download Certificate
          </Button>
          <Button variant="outline" onClick={share} className="gap-2">
            <Share2 className="w-4 h-4" /> Share 🎉
          </Button>
          <Button variant="outline" onClick={onPlayAgain} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Play Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
