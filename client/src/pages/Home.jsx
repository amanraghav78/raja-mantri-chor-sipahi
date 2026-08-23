import { useState } from "react";
import { AlertCircle, HelpCircle, Moon, Sun, Loader2 } from "lucide-react";
import { Mandala, PaisleyRule } from "../components/Ornament.jsx";

export default function Home({
  onCreate,
  onJoin,
  error,
  initialCode,
  busy,
  theme,
  onToggleTheme,
  onOpenHowTo,
}) {
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState(initialCode || "");
  const [mode, setMode] = useState(initialCode ? "join" : "create");
  const [localError, setLocalError] = useState("");

  function submit(e) {
    e.preventDefault();
    setLocalError("");

    const name = nickname.trim();
    if (name.length < 2) return setLocalError("Your name needs at least 2 characters");

    if (mode === "create") return onCreate(name);

    const room = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{4,6}$/.test(room)) return setLocalError("Room codes are 5 letters and numbers");
    onJoin(room, name);
  }

  function switchMode(next) {
    setMode(next);
    setLocalError("");
  }

  const shownError = localError || error;

  return (
    <div className="screen screen-center">
      <div className="shell stack-5">
        <header className="stack-2" style={{ alignItems: "center", textAlign: "center" }}>
          <div className="home-crest">
            <Mandala size={96} />
            <span className="home-crest-mark">♛</span>
          </div>
          <h1 className="wordmark metal-text">
            Raja Mantri
            <br />
            Chor Sipahi
          </h1>
          <PaisleyRule />
          <p className="lede" style={{ maxWidth: "30ch" }}>
            Deal the court. Unmask the thief. Claim the crown.
          </p>
        </header>

        <div className="panel panel-lit panel-pad stack">
          <div className="tabs" role="tablist">
            <button
              type="button"
              role="tab"
              className="tab"
              aria-selected={mode === "create"}
              onClick={() => switchMode("create")}
            >
              Create
            </button>
            <button
              type="button"
              role="tab"
              className="tab"
              aria-selected={mode === "join"}
              onClick={() => switchMode("join")}
            >
              Join
            </button>
          </div>

          <form onSubmit={submit} className="stack">
            <label className="field">
              <span className="field-label">Your name</span>
              <input
                className="input"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Aman"
                maxLength={16}
                autoComplete="nickname"
                required
              />
            </label>

            {mode === "join" && (
              <label className="field">
                <span className="field-label">Room code</span>
                <input
                  className="input input-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  placeholder="ABC12"
                  maxLength={6}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  required
                />
              </label>
            )}

            {shownError && (
              <p className="error-line">
                <AlertCircle size={15} />
                {shownError}
              </p>
            )}

            <button type="submit" className="btn btn-gold btn-full" disabled={busy}>
              {busy && <Loader2 size={18} className="spin-icon" />}
              {mode === "create" ? "Create Room" : "Join Room"}
            </button>
          </form>
        </div>

        <div className="share-row" style={{ justifyContent: "center" }}>
          <button className="link-btn" type="button" onClick={onOpenHowTo}>
            <HelpCircle size={16} /> How to play
          </button>
          <button className="link-btn" type="button" onClick={onToggleTheme}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>
    </div>
  );
}
