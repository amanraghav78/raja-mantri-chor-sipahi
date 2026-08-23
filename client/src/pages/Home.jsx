import { useState } from "react";

export default function Home({ onCreate, onJoin, error }) {
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState("create"); // create | join

  function submit(e) {
    e.preventDefault();
    if (!nickname.trim()) return;
    if (mode === "create") {
      onCreate(nickname.trim());
    } else {
      if (!code.trim()) return;
      onJoin(code.trim().toUpperCase(), nickname.trim());
    }
  }

  return (
    <div className="screen center">
      <div className="card">
        <h1 className="title">
          Raja <span className="accent">Mantri</span> Chor Sipahi
        </h1>
        <p className="subtitle">Play the classic 4-player guessing game with friends, online.</p>

        <div className="tabs">
          <button
            className={`tab ${mode === "create" ? "tab-active" : ""}`}
            onClick={() => setMode("create")}
            type="button"
          >
            Create Room
          </button>
          <button
            className={`tab ${mode === "join" ? "tab-active" : ""}`}
            onClick={() => setMode("join")}
            type="button"
          >
            Join Room
          </button>
        </div>

        <form onSubmit={submit} className="form">
          <label className="field">
            <span>Your nickname</span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Aman"
              maxLength={20}
              required
            />
          </label>

          {mode === "join" && (
            <label className="field">
              <span>Room code</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. AB3XZ"
                maxLength={6}
                required
              />
            </label>
          )}

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn btn-primary">
            {mode === "create" ? "Create Room" : "Join Room"}
          </button>
        </form>
      </div>
    </div>
  );
}
