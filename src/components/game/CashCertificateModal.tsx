import { useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, Download } from "lucide-react";

interface CashCertificateModalProps {
  open: boolean;
  onClose: () => void;
  playerName: string;
  cash: number;
}

export const CashCertificateModal = ({ open, onClose, playerName, cash }: CashCertificateModalProps) => {
  const certRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!certRef.current) return;
    // Render the certificate as an SVG-based image via canvas
    const node = certRef.current;
    const width = node.offsetWidth * 2;
    const height = node.offsetHeight * 2;
    const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="transform: scale(2); transform-origin: top left; width: ${node.offsetWidth}px; height: ${node.offsetHeight}px;">${new XMLSerializer().serializeToString(node)}</div>
      </foreignObject>
    </svg>`;
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${playerName}-crorepati-certificate.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
        <div
          ref={certRef}
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

          <p className="text-sm tracking-[0.4em] text-amber-800 mb-2">CERTIFICATE OF ACHIEVEMENT</p>
          <h1 className="text-4xl font-bold text-amber-900 mb-1">Crorepati Club 🏆</h1>
          <p className="text-amber-800 italic mb-6">The Rat Race — Financial Milestone</p>

          <p className="text-base text-amber-900 mb-2">This certificate is proudly presented to</p>
          <p className="text-3xl font-bold text-amber-950 mb-6 underline decoration-amber-700 decoration-2 underline-offset-8">
            {playerName}
          </p>

          <p className="text-base text-amber-900 leading-relaxed max-w-lg mx-auto mb-6">
            for reaching the remarkable milestone of <strong>₹1 Crore</strong> in cash on hand,
            demonstrating outstanding financial discipline and investment acumen on the journey to escape the rat race.
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