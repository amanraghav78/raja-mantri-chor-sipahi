import { useState } from "react";
import { Settings as SettingsIcon, Volume2, Moon, Sun, Dice5, Repeat, Timer } from "lucide-react";
import Modal from "./Modal.jsx";

const AVATARS = ["🦁", "🐯", "🦅", "🐘", "🦚", "🐅", "🦌", "🐍", "🦂", "🐊"];
const ROUND_OPTIONS = [3, 5, 10];

function Switch({ on, onChange, label }) {
  return (
    <button
      type="button"
      className={`switch ${on ? "switch-on" : ""}`}
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      aria-label={label}
    />
  );
}

export default function SettingsPanel({
  onClose,
  muted,
  onToggleMute,
  theme,
  onToggleTheme,
  roomState,
  isHost,
  me,
  onUpdateSettings,
  onUpdatePlayer,
}) {
  const [nickname, setNickname] = useState(me?.nickname || "");
  const inLobby = roomState?.state === "lobby";
  const settings = roomState?.settings;
  const takenAvatars = new Set(
    (roomState?.players || []).filter((p) => p.id !== me?.id).map((p) => p.avatar)
  );

  function commitNickname() {
    const trimmed = nickname.trim();
    if (trimmed && trimmed !== me?.nickname) onUpdatePlayer({ nickname: trimmed });
    else setNickname(me?.nickname || "");
  }

  return (
    <Modal title="Settings" icon={SettingsIcon} onClose={onClose}>
      {/* ---- Per-player, applies only to this device ---- */}
      <div className="setting-group">
        <div className="setting-head">
          <span className="setting-label">
            <Volume2 size={17} /> Sound &amp; vibration
          </span>
          <Switch on={!muted} onChange={onToggleMute} label="Sound effects" />
        </div>
        <p className="setting-desc">Reveal chimes, result stings and haptic taps.</p>
      </div>

      <div className="setting-group">
        <div className="setting-head">
          <span className="setting-label">
            {theme === "dark" ? <Moon size={17} /> : <Sun size={17} />} Dark theme
          </span>
          <Switch on={theme === "dark"} onChange={onToggleTheme} label="Dark theme" />
        </div>
        <p className="setting-desc">Easier on the eyes for late-night games.</p>
      </div>

      {roomState && (
        <>
          <div className="setting-group">
            <span className="setting-label">Your name</span>
            <input
              className="field-inline"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onBlur={commitNickname}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              maxLength={16}
              style={{
                width: "100%",
                marginTop: 8,
                padding: "11px 13px",
                borderRadius: 12,
                border: "1.5px solid var(--border)",
                background: "var(--surface-2)",
                color: "var(--text)",
                fontFamily: "inherit",
                fontSize: "1rem",
              }}
            />
          </div>

          <div className="setting-group">
            <span className="setting-label">Your avatar</span>
            <div className="avatar-grid">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`avatar-pick ${me?.avatar === a ? "avatar-pick-active" : ""}`}
                  disabled={takenAvatars.has(a)}
                  onClick={() => onUpdatePlayer({ avatar: a })}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ---- Host-only, applies to the whole room ---- */}
      {roomState && (
        <>
          <div className="setting-group">
            <div className="setting-head">
              <span className="setting-label">
                <Dice5 size={17} /> Rounds per game <span className="host-badge">Host</span>
              </span>
            </div>
            <p className="setting-desc">
              {isHost
                ? inLobby
                  ? "How many rounds before the winner is crowned."
                  : "Can only be changed between rounds."
                : "Only the host can change this."}
            </p>
            <div className="segmented">
              {ROUND_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`segment ${settings?.totalRounds === n ? "segment-active" : ""}`}
                  disabled={!isHost || !inLobby || n < (roomState?.round || 0)}
                  onClick={() => onUpdateSettings({ totalRounds: n })}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-head">
              <span className="setting-label">
                <Repeat size={17} /> Wrong guess swaps points <span className="host-badge">Host</span>
              </span>
              <Switch
                on={!!settings?.swapOnWrongGuess}
                onChange={(v) => isHost && inLobby && onUpdateSettings({ swapOnWrongGuess: v })}
                label="Swap points on wrong guess"
              />
            </div>
            <p className="setting-desc">
              On: the Chor takes the Sipahi's 500. Off: the Sipahi just loses their points and the
              Chor still scores nothing.
            </p>
          </div>

          <div className="setting-group">
            <div className="setting-head">
              <span className="setting-label">
                <Timer size={17} /> Guess timer <span className="host-badge">Host</span>
              </span>
              <Switch
                on={!!settings?.timerEnabled}
                onChange={(v) => isHost && inLobby && onUpdateSettings({ timerEnabled: v })}
                label="Guess timer"
              />
            </div>
            <p className="setting-desc">
              Gives the Sipahi 30 seconds to decide. If it runs out, a random pick is made.
            </p>
          </div>
        </>
      )}
    </Modal>
  );
}
