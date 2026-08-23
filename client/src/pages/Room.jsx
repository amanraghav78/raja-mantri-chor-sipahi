import {
  HelpCircle,
  Settings as SettingsIcon,
  LogOut,
  Play,
  Trophy,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { socket } from "../socket.js";
import PlayerList from "../components/PlayerList.jsx";
import RoleCard from "../components/RoleCard.jsx";
import GuessPanel from "../components/GuessPanel.jsx";
import Scoreboard from "../components/Scoreboard.jsx";
import ResultPanel from "../components/ResultPanel.jsx";
import Confetti from "../components/Confetti.jsx";
import GuessTimer from "../components/GuessTimer.jsx";
import ShareRoom from "../components/ShareRoom.jsx";
import WinnerScreen from "../components/WinnerScreen.jsx";

export default function RoomView({
  roomState,
  playerId,
  myRole,
  error,
  setError,
  onLeave,
  onOpenSettings,
  onOpenHowTo,
}) {
  const isHost = roomState.hostId === playerId;
  const full = roomState.players.length === 4;
  const seatsLeft = 4 - roomState.players.length;
  const canStart = full && roomState.state === "lobby";
  const isFinished = roomState.state === "finished";

  function emit(event, payload, fallbackError) {
    setError("");
    socket.emit(event, { code: roomState.code, ...payload }, (res) => {
      if (!res?.ok) setError(res?.error || fallbackError);
    });
  }

  const confettiKey =
    (roomState.state === "result" && roomState.lastResult?.correct && `r${roomState.round}`) ||
    (isFinished && "final") ||
    null;

  return (
    <div className="screen">
      <Confetti burstKey={confettiKey} />

      <header className="topbar shell">
        <div>
          <span className="eyebrow">Room</span>
          <span className="room-code metal-text">{roomState.code}</span>
        </div>
        {!isFinished && (
          <span className="round-pill">
            {Math.max(1, Math.min(roomState.round, roomState.totalRounds))} / {roomState.totalRounds}
          </span>
        )}
        <div className="topbar-actions">
          <button className="icon-btn" onClick={onOpenHowTo} type="button" aria-label="How to play">
            <HelpCircle size={19} />
          </button>
          <button className="icon-btn" onClick={onOpenSettings} type="button" aria-label="Settings">
            <SettingsIcon size={19} />
          </button>
          <button className="icon-btn" onClick={onLeave} type="button" aria-label="Leave room">
            <LogOut size={19} />
          </button>
        </div>
      </header>

      {error && (
        <p className="error-line" style={{ marginTop: "var(--s-4)" }}>
          {error}
        </p>
      )}

      <main className="shell" style={{ flex: 1, paddingBlock: "var(--s-5)" }}>
        {roomState.state === "lobby" && (
          <div className="phase">
            <div className="stack">
              <h2 className="section-title">The court ({roomState.players.length}/4)</h2>
              <PlayerList
                players={roomState.players}
                hostId={roomState.hostId}
                you={playerId}
                isHost={isHost}
                onKick={(targetId) => emit("room:kick", { targetId }, "Could not remove player")}
                onAddBot={() => emit("room:addBot", {}, "Could not add a bot")}
              />
            </div>

            {!full && (
              <div className="stack">
                <p className="hint">
                  {isHost
                    ? `Invite ${seatsLeft} more, or seat a bot in the empty ${seatsLeft > 1 ? "chairs" : "chair"}.`
                    : `Waiting for ${seatsLeft} more player${seatsLeft > 1 ? "s" : ""}.`}
                </p>
                <ShareRoom code={roomState.code} />
              </div>
            )}

            {isHost ? (
              <button
                className="btn btn-gold btn-full"
                disabled={!canStart}
                onClick={() => emit("room:start", {}, "Could not start the round")}
              >
                <Play size={18} />
                {roomState.round === 0 ? "Begin" : `Round ${roomState.round + 1}`}
              </button>
            ) : (
              full && (
                <div className="waiting">
                  <div className="spinner" />
                  <p className="hint">
                    Waiting for the host<span className="dots" />
                  </p>
                </div>
              )
            )}

            {roomState.round > 0 && (
              <div className="stack">
                <h2 className="section-title">Standings</h2>
                <Scoreboard players={roomState.players} you={playerId} />
              </div>
            )}
          </div>
        )}

        {roomState.state === "guessing" && (
          <div className="phase">
            {myRole ? (
              <>
                <RoleCard myRole={myRole} />
                <GuessTimer deadline={roomState.guessDeadline} />
                {myRole.isSipahi ? (
                  <GuessPanel
                    code={roomState.code}
                    candidates={myRole.candidates}
                    setError={setError}
                  />
                ) : (
                  <div className="waiting">
                    <div className="spinner" />
                    <p className="hint">
                      The Sipahi is deciding<span className="dots" />
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="waiting">
                <div className="spinner" />
                <p className="hint">
                  Striking the coins<span className="dots" />
                </p>
              </div>
            )}
          </div>
        )}

        {roomState.state === "result" && roomState.lastResult && (
          <div className="phase">
            <ResultPanel result={roomState.lastResult} round={roomState.round} />

            <div className="stack">
              <h2 className="section-title">Standings</h2>
              <Scoreboard players={roomState.players} you={playerId} />
            </div>

            {isHost ? (
              <button
                className="btn btn-gold btn-full"
                onClick={() => emit("round:next", {}, "Could not continue")}
              >
                {roomState.round >= roomState.totalRounds ? (
                  <>
                    <Trophy size={18} /> Crown the winner
                  </>
                ) : (
                  <>
                    <ArrowRight size={18} /> Next round
                  </>
                )}
              </button>
            ) : (
              <div className="waiting">
                <div className="spinner" />
                <p className="hint">
                  Waiting for the host<span className="dots" />
                </p>
              </div>
            )}
          </div>
        )}

        {isFinished && (
          <div className="phase">
            <WinnerScreen players={roomState.players} you={playerId} />
            {isHost ? (
              <button
                className="btn btn-gold btn-full"
                onClick={() => emit("room:playAgain", {}, "Could not restart")}
              >
                <RotateCcw size={18} /> Play again
              </button>
            ) : (
              <div className="waiting">
                <div className="spinner" />
                <p className="hint">
                  Waiting for the host<span className="dots" />
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
