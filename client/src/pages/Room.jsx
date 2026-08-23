import {
  HelpCircle,
  Settings as SettingsIcon,
  LogOut,
  Play,
  Trophy,
  ArrowRight,
  RotateCcw,
  Users,
  ListOrdered,
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

      <header className="room-header">
        <div>
          <span className="room-code-label">Room</span>
          <span className="room-code">{roomState.code}</span>
        </div>
        {!isFinished && (
          <span className="round-pill">
            Round {Math.max(1, Math.min(roomState.round, roomState.totalRounds))} /{" "}
            {roomState.totalRounds}
          </span>
        )}
        <div className="header-actions">
          <button className="btn-icon" onClick={onOpenHowTo} type="button" aria-label="How to play">
            <HelpCircle size={19} />
          </button>
          <button className="btn-icon" onClick={onOpenSettings} type="button" aria-label="Settings">
            <SettingsIcon size={19} />
          </button>
          <button className="btn-icon" onClick={onLeave} type="button" aria-label="Leave room">
            <LogOut size={19} />
          </button>
        </div>
      </header>

      {error && (
        <p className="error" style={{ marginTop: 12 }}>
          {error}
        </p>
      )}

      <main className="room-body">
        {roomState.state === "lobby" && (
          <div className="phase">
            <h2 className="section-title">
              <Users size={18} /> Players ({roomState.players.length}/4)
            </h2>
            <PlayerList
              players={roomState.players}
              hostId={roomState.hostId}
              you={playerId}
              isHost={isHost}
              onKick={(targetId) => emit("room:kick", { targetId }, "Could not remove player")}
            />

            {!full && (
              <>
                <p className="hint">
                  Share the code with {4 - roomState.players.length} more player
                  {4 - roomState.players.length > 1 ? "s" : ""} to begin.
                </p>
                <ShareRoom code={roomState.code} />
              </>
            )}

            {isHost ? (
              <button
                className="btn btn-primary"
                disabled={!canStart}
                onClick={() => emit("room:start", {}, "Could not start the round")}
              >
                <Play size={18} />
                {roomState.round === 0 ? "Start Game" : `Start Round ${roomState.round + 1}`}
              </button>
            ) : (
              full && (
                <div className="waiting">
                  <div className="spinner" />
                  <p className="hint">
                    Waiting for the host to start<span className="dots" />
                  </p>
                </div>
              )
            )}

            {roomState.round > 0 && (
              <>
                <h2 className="section-title">
                  <ListOrdered size={18} /> Scores
                </h2>
                <Scoreboard players={roomState.players} you={playerId} />
              </>
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
                      The Sipahi is choosing<span className="dots" />
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="waiting">
                <div className="spinner" />
                <p className="hint">
                  Dealing roles<span className="dots" />
                </p>
              </div>
            )}
          </div>
        )}

        {roomState.state === "result" && roomState.lastResult && (
          <div className="phase">
            <ResultPanel result={roomState.lastResult} round={roomState.round} />

            <h2 className="section-title">
              <ListOrdered size={18} /> Scores
            </h2>
            <Scoreboard players={roomState.players} you={playerId} />

            {isHost ? (
              <button
                className="btn btn-primary"
                onClick={() => emit("round:next", {}, "Could not continue")}
              >
                {roomState.round >= roomState.totalRounds ? (
                  <>
                    <Trophy size={18} /> See the winner
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
                className="btn btn-primary"
                onClick={() => emit("room:playAgain", {}, "Could not restart")}
              >
                <RotateCcw size={18} /> Play again
              </button>
            ) : (
              <div className="waiting">
                <div className="spinner" />
                <p className="hint">
                  Waiting for the host to restart<span className="dots" />
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
