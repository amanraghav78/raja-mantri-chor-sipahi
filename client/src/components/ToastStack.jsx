import { useEffect, useState } from "react";
import { subscribeToast } from "../toast.js";

// Two at a time is plenty. Four players joining at once would otherwise
// stack a wall of notices over the coin, which is the screen that matters most.
const MAX_VISIBLE = 2;

export default function ToastStack() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribeToast((toast) => {
      setToasts((t) => [...t, toast].slice(-MAX_VISIBLE));
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== toast.id));
      }, 3200);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
