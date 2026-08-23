import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Share2, Copy, QrCode } from "lucide-react";
import { pushToast } from "../toast.js";

export default function ShareRoom({ code }) {
  const [showQr, setShowQr] = useState(false);
  const canvasRef = useRef(null);
  const joinUrl = `${window.location.origin}/?code=${code}`;
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  useEffect(() => {
    if (!showQr || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, joinUrl, {
      width: 188,
      margin: 1,
      color: { dark: "#0f0f12", light: "#ffffff" },
    });
  }, [showQr, joinUrl]);

  async function share() {
    if (canShare) {
      try {
        await navigator.share({
          title: "Raja Mantri Chor Sipahi",
          text: `Join my court — room ${code}`,
          url: joinUrl,
        });
      } catch {
        // share sheet dismissed
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(joinUrl);
      pushToast("Join link copied", "success");
    } catch {
      pushToast(`Share this code: ${code}`, "info");
    }
  }

  return (
    <div className="stack">
      <div className="share-row">
        <button className="btn btn-quiet" type="button" onClick={share}>
          {canShare ? <Share2 size={17} /> : <Copy size={17} />}
          {canShare ? "Share" : "Copy"}
        </button>
        <button className="btn btn-quiet" type="button" onClick={() => setShowQr((v) => !v)}>
          <QrCode size={17} />
          {showQr ? "Hide QR" : "QR"}
        </button>
      </div>
      {showQr && (
        <div className="qr-frame">
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
}
