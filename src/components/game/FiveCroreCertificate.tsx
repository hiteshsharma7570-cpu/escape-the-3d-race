import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface TenCroreCertificateProps {
  open: boolean;
  playerName: string;
  onClose: () => void;
  onPlayAgain: () => void;
}

export const TenCroreCertificate = ({
  open,
  playerName,
  onClose,
  onPlayAgain,
}: TenCroreCertificateProps) => {
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleDownload = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    doc.setFillColor(10, 10, 46);
    doc.rect(0, 0, w, h, "F");
    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(4);
    doc.rect(24, 24, w - 48, h - 48);
    doc.setLineWidth(1.5);
    doc.rect(36, 36, w - 72, h - 72);

    doc.setTextColor(255, 215, 0);
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("\u2726 CERTIFICATE OF ACHIEVEMENT \u2726", w / 2, 90, { align: "center" });

    doc.setFont("times", "italic");
    doc.setFontSize(12);
    doc.setTextColor(220, 220, 255);
    doc.text("This is to certify that", w / 2, 130, { align: "center" });

    doc.setFont("times", "bold");
    doc.setFontSize(34);
    doc.setTextColor(255, 215, 0);
    doc.text(playerName, w / 2, 175, { align: "center" });

    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.setTextColor(220, 220, 255);
    doc.text(
      "having demonstrated exceptional financial acumen,\nstrategic investment decisions, and disciplined wealth management,",
      w / 2,
      205,
      { align: "center" }
    );

    doc.setFontSize(13);
    doc.text("has successfully accumulated", w / 2, 250, { align: "center" });

    doc.setFont("times", "bold");
    doc.setFontSize(40);
    doc.setTextColor(255, 215, 0);
    doc.text("Rs. 10,00,00,000", w / 2, 300, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(220, 220, 255);
    doc.text("TEN CRORE RUPEES IN CASH", w / 2, 322, { align: "center" });

    doc.setDrawColor(255, 215, 0);
    doc.line(w / 2 - 120, 345, w / 2 + 120, 345);

    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 215, 0);
    doc.text("ESCAPE THE RAT RACE", w / 2, 370, { align: "center" });
    doc.text("OF FINANCIAL SIMULATION", w / 2, 390, { align: "center" });

    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(220, 220, 255);
    doc.text("Awarded upon reaching the pinnacle of financial freedom", w / 2, 412, { align: "center" });

    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.text(`Date: ${dateStr}`, 80, h - 70);
    doc.text("Certified \u2605", w - 80, h - 70, { align: "right" });

    doc.setFontSize(9);
    doc.setTextColor(200, 200, 220);
    doc.text(
      '"Financial freedom is not about having money — it\'s about having choices."',
      w / 2,
      h - 50,
      { align: "center" }
    );

    doc.save(`${playerName}-10cr-certificate.pdf`);
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(
        `🏆 ${playerName} just accumulated ₹10 Crore in Escape the Rat Race!`
      );
      toast.success("Achievement copied to clipboard!");
    } catch {
      toast.error("Could not copy.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-3xl p-0 border-0 bg-transparent shadow-none overflow-visible"
      >
        <div
          className="relative p-10 text-center"
          style={{
            background: "#0a0a2e",
            border: "4px double #FFD700",
            borderRadius: 8,
            fontFamily: "Georgia, serif",
            color: "#FFF8DC",
          }}
        >
          {/* Inner thick gold border */}
          <div
            className="absolute inset-3 pointer-events-none rounded"
            style={{ border: "2px solid #FFD700", opacity: 0.7 }}
          />
          {/* Watermark */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{ fontSize: 380, color: "#FFD700", opacity: 0.05, fontWeight: "bold" }}
          >
            ₹
          </div>
          {/* Corner ornaments */}
          <div className="absolute top-4 left-6 text-yellow-400 text-2xl">❧</div>
          <div className="absolute top-4 right-6 text-yellow-400 text-2xl">❧</div>
          <div className="absolute bottom-4 left-6 text-yellow-400 text-2xl">❦</div>
          <div className="absolute bottom-4 right-6 text-yellow-400 text-2xl">❦</div>

          <div className="relative">
            <p className="text-yellow-400 tracking-[0.3em] text-sm font-bold mb-1">
              ✦ CERTIFICATE OF ACHIEVEMENT ✦
            </p>
            <p className="text-xs text-yellow-100/70 italic mb-4">This is to certify that</p>
            <h1
              className="text-5xl font-extrabold mb-3"
              style={{ color: "#FFD700", textShadow: "0 0 20px rgba(255,215,0,0.4)" }}
            >
              {playerName}
            </h1>
            <p className="text-sm text-yellow-100/90 max-w-xl mx-auto mb-3">
              having demonstrated exceptional financial acumen, strategic investment decisions,
              and disciplined wealth management,
            </p>
            <p className="text-base text-yellow-200 italic mb-2">has successfully accumulated</p>
            <p
              className="text-5xl font-extrabold mb-1"
              style={{ color: "#FFD700", textShadow: "0 0 24px rgba(255,215,0,0.6)" }}
            >
              ₹10,00,00,000
            </p>
            <p className="text-xs tracking-[0.4em] text-yellow-100/80 mb-4">
              TEN CRORE RUPEES IN CASH
            </p>
            <div className="h-px bg-yellow-500/60 my-4 mx-auto max-w-md" />
            <h2 className="text-xl font-bold text-yellow-400 leading-tight">
              ESCAPE THE RAT RACE<br />
              <span className="text-base">OF FINANCIAL SIMULATION</span>
            </h2>
            <p className="text-xs italic text-yellow-100/70 mt-3 mb-6">
              Awarded upon reaching the pinnacle of financial freedom
            </p>

            <div className="flex justify-between items-end px-6 mt-4 text-xs text-yellow-100/80">
              <div>
                <div className="border-t border-yellow-500/60 pt-1 w-32">{dateStr}</div>
              </div>
              <div className="w-16 h-16 rounded-full border-2 border-yellow-400 flex items-center justify-center text-yellow-300 text-[10px] font-bold">
                CERTIFIED ★
              </div>
            </div>

            <p className="text-[11px] italic text-yellow-100/60 mt-6">
              "Financial freedom is not about having money — it's about having choices."
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-center mt-4 flex-wrap">
          <Button onClick={handleDownload} className="gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
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