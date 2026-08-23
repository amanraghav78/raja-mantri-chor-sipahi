import { useEffect, useState, useCallback, useRef } from "react";
import { socket } from "./socket.js";
import { pushToast } from "./toast.js";
import { getTheme, applyTheme, hasSeenIntro, markIntroSeen } from "./prefs.js";
import { isMuted, setMuted } from "./sound.js";
import Home from "./pages/Home.jsx";
import RoomView from "./pages/Room.jsx";
import ToastStack from "./components/ToastStack.jsx";
import HowToPlay from "./components/HowToPlay.jsx";
import SettingsPanel from "./components/SettingsPanel.jsx";

const STORAGE_KEY = "rmcs-session";

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
    // storage unavailable — rejoin-on-reconnect just won't persist
  }
}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function readCodeFromUrl() {
  try {
    return new URLSearchParams(window.location.search).get("code")?.toUpperCase() || "";
  } catch {
    return "";
  }
}

export default function App() {
  const [playerId, setPlayerId] = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [theme, setTheme] = useState(getTheme);
  const [muted, setMutedState] = useState(isMuted);
  const [showHowTo, setShowHowTo] = useState(!hasSeenIntro());
  const [showSettings, setShowSettings] = useState(false);

  const sessionRef = useRef(loadSession());
  const prevPlayersRef = useRef(new Map());
  const initialCodeRef = useRef(readCodeFromUrl());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    function onConnect() {
      setError("");
      const session = sessionRef.current;
      if (!session?.code || !session?.playerId) return;
      socket.emit("room:rejoin", session, (res) => {
        if (res?.ok) {
          setPlayerId(res.playerId);
        } else {
          // The room expired or was cleaned up — fall back to the home screen.
          clearSession();
          sessionRef.current = null;
          setRoomState(null);
          setPlayerId(null);
        }
      });
    }

    function onRoomUpdate(state) {
      const prev = prevPlayersRef.current;
      if (prev.size > 0) {
        state.players.forEach((p) => {
          const before = prev.get(p.id);
          if (before && before.connected && !p.connected) {
            pushToast(`${p.nickname} lost connection`, "warn");
          } else if (before && !before.connected && p.connected) {
            pushToast(`${p.nickname} is back`, "success");
          }
        });
        state.players.forEach((p) => {
          if (!prev.has(p.id)) pushToast(`${p.nickname} joined`, "info");
        });
        prev.forEach((p) => {
          if (!state.players.some((x) => x.id === p.id)) {
            pushToast(`${p.nickname} left the room`, "warn");
          }
        });
      }
      prevPlayersRef.current = new Map(state.players.map((p) => [p.id, p]));

      setRoomState(state);
      if (state.state !== "guessing") setMyRole(null);
    }

    function onRoleAssigned(role) {
      setMyRole(role);
    }

    function onDisconnect(reason) {
      if (reason !== "io client disconnect") {
        pushToast("Connection lost — reconnecting…", "warn");
      }
    }

    function onConnectError() {
      setError("Can't reach the server. Check your connection and try again.");
      setBusy(false);
    }

    socket.on("connect", onConnect);
    socket.on("room:update", onRoomUpdate);
    socket.on("role:assigned", onRoleAssigned);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("room:update", onRoomUpdate);
      socket.off("role:assigned", onRoleAssigned);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, []);

  const enterRoom = useCallback((event, payload) => {
    setError("");
    setBusy(true);
    socket.emit(event, payload, (res) => {
      setBusy(false);
      if (!res?.ok) return setError(res?.error || "Something went wrong. Try again.");
      setPlayerId(res.playerId);
      sessionRef.current = { code: res.code, playerId: res.playerId };
      saveSession(sessionRef.current);
    });
  }, []);

  const createRoom = useCallback((nickname) => enterRoom("room:create", { nickname }), [enterRoom]);
  const joinRoom = useCallback(
    (code, nickname) => enterRoom("room:join", { code, nickname }),
    [enterRoom]
  );

  const leaveRoom = useCallback(() => {
    clearSession();
    sessionRef.current = null;
    prevPlayersRef.current = new Map();
    socket.disconnect();
    socket.connect();
    setPlayerId(null);
    setRoomState(null);
    setMyRole(null);
    setError("");
    setShowSettings(false);
  }, []);

  const closeHowTo = useCallback(() => {
    markIntroSeen();
    setShowHowTo(false);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((m) => {
      setMuted(!m);
      return !m;
    });
  }, []);

  const updateSettings = useCallback(
    (settings) => {
      if (!roomState) return;
      socket.emit("room:settings", { code: roomState.code, settings }, (res) => {
        if (!res?.ok) pushToast(res?.error || "Could not update settings", "warn");
      });
    },
    [roomState]
  );

  const updatePlayer = useCallback(
    (patch) => {
      if (!roomState) return;
      socket.emit("player:update", { code: roomState.code, ...patch }, (res) => {
        if (!res?.ok) pushToast(res?.error || "Could not update", "warn");
      });
    },
    [roomState]
  );

  const inRoom = roomState && playerId;
  const me = inRoom ? roomState.players.find((p) => p.id === playerId) : null;

  return (
    <>
      <ToastStack />

      {inRoom ? (
        <RoomView
          roomState={roomState}
          playerId={playerId}
          myRole={myRole}
          error={error}
          setError={setError}
          onLeave={leaveRoom}
          onOpenSettings={() => setShowSettings(true)}
          onOpenHowTo={() => setShowHowTo(true)}
        />
      ) : (
        <Home
          onCreate={createRoom}
          onJoin={joinRoom}
          error={error}
          busy={busy}
          initialCode={initialCodeRef.current}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenHowTo={() => setShowHowTo(true)}
        />
      )}

      {showHowTo && <HowToPlay onClose={closeHowTo} />}

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          muted={muted}
          onToggleMute={toggleMute}
          theme={theme}
          onToggleTheme={toggleTheme}
          roomState={roomState}
          isHost={roomState?.hostId === playerId}
          me={me}
          onUpdateSettings={updateSettings}
          onUpdatePlayer={updatePlayer}
        />
      )}
    </>
  );
}
