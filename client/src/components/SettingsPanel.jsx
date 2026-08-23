import { useState } from "react";
import { Volume2, Moon, Dice5, Repeat, Timer } from "lucide-react";
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
  const taken = new Set(
    (roomState?.players || []).filter((p) => p.id !== me?.id).map((p) => p.avatar)
  );

  function commitNickname() {
    const trimmed = nickname.trim();
    if (trimmed && trimmed !== me?.nickname) onUpdatePlayer({ nickname: trimmed });
    else setNickname(me?.nickname || "");
  }

  return (
    <Modal title="Settings" onClose={onClose}>
      {/* ---- this device only ---- */}
      <div className="setting">
        <div className="setting-head">
          <span className="setting-label">
            <Volume2 size={18} /> Sound &amp; haptics
          </span>
          <Switch on={!muted} onChange={onToggleMute} label="Sound effects" />
        </div>
        <p className="setting-desc">Coin flips, seal stamps and result stings.</p>
      </div>

      <div className="setting">
        <div className="setting-head">
          <span className="setting-label">
            <Moon size={18} /> Dark theme
          </span>
          <Switch on={theme === "dark"} onChange={onToggleTheme} label="Dark theme" />
        </div>
        <p className="setting-desc">Charcoal and gold. Turn off for the ivory court.</p>
      </div>

      {roomState && (
        <>
          <div className="setting">
            <span className="setting-label">Your name</span>
            <input
              className="input"
              style={{ marginTop: "var(--s-3)" }}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onBlur={commitNickname}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              maxLength={16}
            />
          </div>

          <div className="setting">
            <span className="setting-label">Your seal</span>
            <div className="avatar-grid">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`avatar-pick ${me?.avatar === a ? "avatar-pick-on" : ""}`}
                  disabled={taken.has(a)}
                  onClick={() => onUpdatePlayer({ avatar: a })}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* ---- host only, applies to the whole room ---- */}
          <div className="setting">
            <div className="setting-head">
              <span className="setting-label">
                <Dice5 size={18} /> Rounds <span className="host-tag">Host</span>
              </span>
            </div>
            <p className="setting-desc">
              {isHost
                ? inLobby
                  ? "How many rounds before the crown is awarded."
                  : "Can only be changed between rounds."
                : "Only the host can change this."}
            </p>
            <div className="segmented">
              {ROUND_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`segment ${settings?.totalRounds === n ? "segment-on" : ""}`}
                  disabled={!isHost || !inLobby || n < (roomState?.round || 0)}
                  onClick={() => onUpdateSettings({ totalRounds: n })}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="setting">
            <div className="setting-head">
              <span className="setting-label">
                <Repeat size={18} /> Wrong guess swaps <span className="host-tag">Host</span>
              </span>
              <Switch
                on={!!settings?.swapOnWrongGuess}
                onChange={(v) => isHost && inLobby && onUpdateSettings({ swapOnWrongGuess: v })}
                label="Swap points on a wrong guess"
              />
            </div>
            <p className="setting-desc">
              On: the Chor takes the Sipahi's 500. Off: the Sipahi simply loses their points.
            </p>
          </div>

          <div className="setting">
            <div className="setting-head">
              <span className="setting-label">
                <Timer size={18} /> Guess timer <span className="host-tag">Host</span>
              </span>
              <Switch
                on={!!settings?.timerEnabled}
                onChange={(v) => isHost && inLobby && onUpdateSettings({ timerEnabled: v })}
                label="Guess timer"
              />
            </div>
            <p className="setting-desc">
              Gives the Sipahi 30 seconds. If it runs out, the accusation is made at random.
            </p>
          </div>
        </>
      )}
    </Modal>
  );
}
