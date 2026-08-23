import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { pushToast } from "../toast.js";

export default function ShareRoom({ code }) {
  const [showQr, setShowQr] = useState(false);
  const canvasRef = useRef(null);
  const joinUrl = `${window.location.origin}/?code=${code}`;

  useEffect(() => {
    if (!showQr || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, joinUrl, {
      width: 200,
      margin: 1,
      color: { dark: "#12121a", light: "#f2f2f7" },
    });
  }, [showQr, joinUrl]);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join my Raja Mantri Chor Sipahi game", url: joinUrl });
      } catch {
        // user cancelled the share sheet — nothing to do
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(joinUrl);
      pushToast("Join link copied!", "success");
    } catch {
      pushToast("Could not copy link", "warn");
    }
  }

  return (
    <div className="share-room">
      <div className="share-actions">
        <button className="btn btn-outline" type="button" onClick={share}>
          {navigator.share ? "Share link" : "Copy link"}
        </button>
        <button className="btn btn-outline" type="button" onClick={() => setShowQr((v) => !v)}>
          {showQr ? "Hide QR" : "Show QR"}
        </button>
      </div>
      {showQr && (
        <div className="qr-wrap">
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
}
