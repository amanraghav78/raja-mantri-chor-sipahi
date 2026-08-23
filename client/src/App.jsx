import { useEffect, useState, useCallback } from "react";
import { socket } from "./socket.js";
import Home from "./pages/Home.jsx";
import RoomView from "./pages/Room.jsx";

export default function App() {
  const [playerId, setPlayerId] = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    socket.connect();

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

    socket.on("room:update", onRoomUpdate);
    socket.on("role:assigned", onRoleAssigned);
    socket.on("connect_error", onConnectError);

    return () => {
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
    });
  }, []);

  const joinRoom = useCallback((code, nickname) => {
    setError("");
    socket.emit("room:join", { code, nickname }, (res) => {
      if (!res?.ok) return setError(res?.error || "Failed to join room");
      setPlayerId(res.playerId);
    });
  }, []);

  const leaveRoom = useCallback(() => {
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
