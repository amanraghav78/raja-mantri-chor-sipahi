import { useEffect, useState } from "react";
import { subscribeToast } from "../toast.js";

export default function ToastStack() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribeToast((toast) => {
      setToasts((t) => [...t, toast]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== toast.id));
      }, 3500);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
