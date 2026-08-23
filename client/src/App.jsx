import { useEffect, useState, useCallback, useRef } from "react";
import { socket } from "./socket.js";
import Home from "./pages/Home.jsx";
import RoomView from "./pages/Room.jsx";

const STORAGE_KEY = "raja-mantri-session";

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // storage unavailable (private browsing etc.) — rejoin-on-reconnect just won't work
  }
}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export default function App() {
  const [playerId, setPlayerId] = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [error, setError] = useState("");
  const sessionRef = useRef(loadSession());

  useEffect(() => {
    function onConnect() {
      const session = sessionRef.current;
      if (!session?.code || !session?.playerId) return;
      socket.emit("room:rejoin", session, (res) => {
        if (res?.ok) {
          setPlayerId(res.playerId);
        } else {
          clearSession();
          sessionRef.current = null;
        }
      });
    }
    function onRoomUpdate(state) {
      setRoomState(state);
      if (state.state === "lobby") setMyRole(null);
    }
    function onRoleAssigned(role) {
      setMyRole(role);
    }
    function onConnectError() {
      setError("Could not reach the server. Please try again.");
    }

    socket.on("connect", onConnect);
    socket.on("room:update", onRoomUpdate);
    socket.on("role:assigned", onRoleAssigned);
    socket.on("connect_error", onConnectError);

    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("room:update", onRoomUpdate);
      socket.off("role:assigned", onRoleAssigned);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback((nickname) => {
    setError("");
    socket.emit("room:create", { nickname }, (res) => {
      if (!res?.ok) return setError(res?.error || "Failed to create room");
      setPlayerId(res.playerId);
      sessionRef.current = { code: res.code, playerId: res.playerId };
      saveSession(sessionRef.current);
    });
  }, []);

  const joinRoom = useCallback((code, nickname) => {
    setError("");
    socket.emit("room:join", { code, nickname }, (res) => {
      if (!res?.ok) return setError(res?.error || "Failed to join room");
      setPlayerId(res.playerId);
      sessionRef.current = { code: res.code, playerId: res.playerId };
      saveSession(sessionRef.current);
    });
  }, []);

  const leaveRoom = useCallback(() => {
    clearSession();
    sessionRef.current = null;
    socket.disconnect();
    socket.connect();
    setPlayerId(null);
    setRoomState(null);
    setMyRole(null);
    setError("");
  }, []);

  if (!roomState || !playerId) {
    return <Home onCreate={createRoom} onJoin={joinRoom} error={error} />;
  }

  return (
    <RoomView
      roomState={roomState}
      playerId={playerId}
      myRole={myRole}
      error={error}
      setError={setError}
      onLeave={leaveRoom}
    />
  );
}
