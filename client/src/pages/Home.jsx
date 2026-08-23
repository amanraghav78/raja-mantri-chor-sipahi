import { useState } from "react";
import { AlertCircle, HelpCircle, Moon, Sun, Loader2 } from "lucide-react";

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
    if (!/^[A-Z0-9]{4,6}$/.test(room))
      return setLocalError("Room codes are 5 letters and numbers");
    onJoin(room, name);
  }

  const shownError = localError || error;

  return (
    <div className="screen center">
      <div className="card">
        <div className="brand">
          <div className="brand-crest">👑</div>
          <h1 className="title">Raja Mantri Chor Sipahi</h1>
          <div className="rule-line">
            <span style={{ fontSize: "0.7rem", letterSpacing: "0.2em" }}>4 PLAYERS</span>
          </div>
          <p className="subtitle">
            The classic party game. Deal the roles, find the Chor, crown a winner.
          </p>
        </div>

        <div className="tabs">
          <button
            className={`tab ${mode === "create" ? "tab-active" : ""}`}
            onClick={() => {
              setMode("create");
              setLocalError("");
            }}
            type="button"
          >
            Create Room
          </button>
          <button
            className={`tab ${mode === "join" ? "tab-active" : ""}`}
            onClick={() => {
              setMode("join");
              setLocalError("");
            }}
            type="button"
          >
            Join Room
          </button>
        </div>

        <form onSubmit={submit} className="form">
          <label className="field">
            <span>Your name</span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Aman"
              maxLength={16}
              autoComplete="nickname"
              required
            />
          </label>

          {mode === "join" && (
            <label className="field field-code">
              <span>Room code</span>
              <input
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
            <p className="error">
              <AlertCircle size={15} />
              {shownError}
            </p>
          )}

          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy && <Loader2 size={17} className="spin-icon" />}
            {mode === "create" ? "Create Room" : "Join Room"}
          </button>
        </form>

        <div className="share-row" style={{ marginTop: 18 }}>
          <button className="btn btn-ghost" type="button" onClick={onOpenHowTo}>
            <HelpCircle size={16} /> How to play
          </button>
          <button className="btn btn-ghost" type="button" onClick={onToggleTheme}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>
    </div>
  );
}
