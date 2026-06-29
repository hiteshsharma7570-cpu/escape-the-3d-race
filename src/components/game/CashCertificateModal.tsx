import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, Download } from "lucide-react";
import jsPDF from "jspdf";

interface CashCertificateModalProps {
  open: boolean;
  onClose: () => void;
  playerName: string;
  cash: number;
}

export const CashCertificateModal = ({ open, onClose, playerName, cash }: CashCertificateModalProps) => {
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleDownload = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(255, 251, 235);
    doc.rect(0, 0, pageW, pageH, "F");

    // Outer double border
    doc.setDrawColor(180, 130, 30);
    doc.setLineWidth(4);
    doc.rect(20, 20, pageW - 40, pageH - 40);
    doc.setLineWidth(1);
    doc.rect(30, 30, pageW - 60, pageH - 60);

    // Corner ornaments
    doc.setLineWidth(3);
    const corner = 36;
    [[40, 40, 1, 1], [pageW - 40, 40, -1, 1], [40, pageH - 40, 1, -1], [pageW - 40, pageH - 40, -1, -1]]
      .forEach(([x, y, sx, sy]) => {
        doc.line(x, y, x + corner * sx, y);
        doc.line(x, y, x, y + corner * sy);
      });

    // Header label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(146, 64, 14);
    doc.text("MILESTONE BADGE  ·  STEP 1 OF 10", pageW / 2, 110, { align: "center", charSpace: 4 });

    // Title
    doc.setFont("times", "bold");
    doc.setFontSize(36);
    doc.setTextColor(120, 53, 15);
    doc.text("First Crore Milestone", pageW / 2, 155, { align: "center" });

    doc.setFont("times", "italic");
    doc.setFontSize(14);
    doc.setTextColor(146, 64, 14);
    doc.text("A badge of progress — not the final win", pageW / 2, 180, { align: "center" });

    // Body
    doc.setFont("times", "normal");
    doc.setFontSize(14);
    doc.setTextColor(60, 30, 5);
    doc.text("This certificate is proudly presented to", pageW / 2, 220, { align: "center" });

    doc.setFont("times", "bold");
    doc.setFontSize(28);
    doc.text(playerName, pageW / 2, 260, { align: "center" });
    // underline
    const nameW = doc.getTextWidth(playerName);
    doc.setLineWidth(1.5);
    doc.line(pageW / 2 - nameW / 2, 268, pageW / 2 + nameW / 2, 268);

    doc.setFont("times", "normal");
    doc.setFontSize(13);
    const desc = `for reaching the first milestone of Rs. 1 Crore in cash on hand. This is the first of ten —\nkeep building toward Rs. 10 Crore to fully escape the rat race.`;
    doc.text(desc, pageW / 2, 305, { align: "center" });

    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.setTextColor(120, 53, 15);
    doc.text(`Rs. ${cash.toLocaleString("en-IN")}`, pageW / 2, 365, { align: "center" });

    // Footer signatures
    doc.setLineWidth(1);
    doc.setDrawColor(120, 53, 15);
    doc.line(80, pageH - 90, 240, pageH - 90);
    doc.line(pageW - 240, pageH - 90, pageW - 80, pageH - 90);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(146, 64, 14);
    doc.text("Date", 80, pageH - 75);
    doc.text("Issued by", pageW - 240, pageH - 75);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(60, 30, 5);
    doc.text(dateStr, 80, pageH - 58);
    doc.text("The Rat Race Game", pageW - 240, pageH - 58);

    doc.save(`${playerName}-crorepati-certificate.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
        <div
          className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-amber-100 dark:via-yellow-100 dark:to-amber-200 p-10 text-center border-8 border-double border-amber-600"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {/* Corner ornaments */}
          <div className="absolute top-3 left-3 w-12 h-12 border-l-4 border-t-4 border-amber-700" />
          <div className="absolute top-3 right-3 w-12 h-12 border-r-4 border-t-4 border-amber-700" />
          <div className="absolute bottom-3 left-3 w-12 h-12 border-l-4 border-b-4 border-amber-700" />
          <div className="absolute bottom-3 right-3 w-12 h-12 border-r-4 border-b-4 border-amber-700" />

          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <Award className="w-12 h-12 text-white" />
            </div>
          </div>

          <p className="text-sm tracking-[0.4em] text-amber-800 mb-2">MILESTONE BADGE · STEP 1 OF 10</p>
          <h1 className="text-4xl font-bold text-amber-900 mb-1">First Crore Milestone 🥉</h1>
          <p className="text-amber-800 italic mb-6">A badge of progress — not the final win</p>

          <p className="text-base text-amber-900 mb-2">This certificate is proudly presented to</p>
          <p className="text-3xl font-bold text-amber-950 mb-6 underline decoration-amber-700 decoration-2 underline-offset-8">
            {playerName}
          </p>

          <p className="text-base text-amber-900 leading-relaxed max-w-lg mx-auto mb-6">
            for reaching the <strong>first ₹1 Crore</strong> in cash on hand. This is the
            first of ten — keep going to earn the gold <strong>₹10 Crore "Escape the Rat Race"</strong> certificate.
          </p>

          <p className="text-2xl font-bold text-amber-900 mb-6">
            ₹{cash.toLocaleString("en-IN")}
          </p>

          <div className="flex justify-between items-end px-8 mt-8">
            <div className="text-left">
              <div className="border-t-2 border-amber-800 pt-1 w-40">
                <p className="text-xs text-amber-800">Date</p>
                <p className="text-sm font-semibold text-amber-900">{dateStr}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="border-t-2 border-amber-800 pt-1 w-40">
                <p className="text-xs text-amber-800">Issued by</p>
                <p className="text-sm font-semibold text-amber-900">The Rat Race Game</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-center p-4 bg-background">
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Download Certificate
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};