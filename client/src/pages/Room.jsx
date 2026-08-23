import { socket } from "../socket.js";
import PlayerList from "../components/PlayerList.jsx";
import RoleCard from "../components/RoleCard.jsx";
import GuessPanel from "../components/GuessPanel.jsx";
import Scoreboard from "../components/Scoreboard.jsx";
import ResultPanel from "../components/ResultPanel.jsx";

export default function RoomView({ roomState, playerId, myRole, error, setError, onLeave }) {
  const isHost = roomState.hostId === playerId;
  const canStart = roomState.players.length === 4 && roomState.state === "lobby";

  function startRound() {
    setError("");
    socket.emit("room:start", { code: roomState.code }, (res) => {
      if (!res?.ok) setError(res?.error || "Could not start round");
    });
  }

  function nextRound() {
    setError("");
    socket.emit("round:next", { code: roomState.code }, (res) => {
      if (!res?.ok) setError(res?.error || "Could not continue");
    });
  }

  function playAgain() {
    setError("");
    socket.emit("room:playAgain", { code: roomState.code }, (res) => {
      if (!res?.ok) setError(res?.error || "Could not restart");
    });
  }

  return (
    <div className="screen">
      <header className="room-header">
        <div>
          <span className="room-code-label">Room</span>
          <span className="room-code">{roomState.code}</span>
        </div>
        <div className="round-label">
          Round {Math.min(roomState.round, roomState.totalRounds)}/{roomState.totalRounds}
        </div>
        <button className="btn btn-ghost" onClick={onLeave} type="button">
          Leave
        </button>
      </header>

      {error && <p className="error center-text">{error}</p>}

      <main className="room-body">
        {roomState.state === "lobby" && (
          <>
            <PlayerList players={roomState.players} hostId={roomState.hostId} you={playerId} />
            {roomState.players.length < 4 && (
              <p className="hint">Waiting for {4 - roomState.players.length} more player(s)… share code {roomState.code}</p>
            )}
            {isHost && (
              <button className="btn btn-primary" disabled={!canStart} onClick={startRound}>
                {roomState.round === 0 ? "Start Game" : "Start Next Round"}
              </button>
            )}
            {!isHost && roomState.players.length === 4 && (
              <p className="hint">Waiting for host to start…</p>
            )}
          </>
        )}

        {roomState.state === "guessing" && myRole && (
          <>
            <RoleCard myRole={myRole} />
            {myRole.isSipahi ? (
              <GuessPanel code={roomState.code} candidates={myRole.candidates} setError={setError} />
            ) : (
              <p className="hint">The Sipahi is deciding who the Chor is…</p>
            )}
          </>
        )}

        {roomState.state === "result" && roomState.lastResult && (
          <>
            <ResultPanel result={roomState.lastResult} players={roomState.players} />
            {isHost && (
              <button className="btn btn-primary" onClick={nextRound}>
                {roomState.round >= roomState.totalRounds ? "See Final Leaderboard" : "Next Round"}
              </button>
            )}
            {!isHost && <p className="hint">Waiting for host to continue…</p>}
          </>
        )}

        {roomState.state === "finished" && (
          <>
            <h2 className="section-title">Final Leaderboard</h2>
            <Scoreboard players={roomState.players} />
            {isHost && (
              <button className="btn btn-primary" onClick={playAgain}>
                Play Again
              </button>
            )}
            {!isHost && <p className="hint">Waiting for host to restart…</p>}
          </>
        )}

        {roomState.state !== "lobby" && roomState.state !== "finished" && (
          <>
            <h2 className="section-title">Scoreboard</h2>
            <Scoreboard players={roomState.players} />
          </>
        )}
      </main>
    </div>
  );
}
