import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { RoomManager, generatePlayerId } from "./rooms.js";
import { assignRoles, resolveGuess } from "./gameLogic.js";

const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.CLIENT_ORIGIN || "*";
const MAX_PLAYERS = 4;
const DISCONNECTED_ROOM_TTL_MS = 5 * 60 * 1000;
const GUESS_TIME_MS = 20000;

const app = express();
app.use(cors({ origin: ORIGIN }));
app.get("/health", (_req, res) => res.json({ ok: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: ORIGIN, methods: ["GET", "POST"] },
});

const rooms = new RoomManager();
const socketIndex = new Map(); // socket.id -> { code, playerId }

function broadcastRoom(room) {
  io.to(room.code).emit("room:update", rooms.publicState(room));
}

function emitToPlayer(room, playerId, event, payload) {
  const player = room.players.get(playerId);
  if (player?.connected && player.socketId) {
    io.to(player.socketId).emit(event, payload);
  }
}

function roleAssignedPayload(room, playerIds, rajaId, sipahiId, playerId) {
  return {
    role: room.assignment[playerId].name,
    points: room.assignment[playerId].points,
    raja: { id: rajaId, nickname: room.players.get(rajaId).nickname },
    isSipahi: playerId === sipahiId,
    candidates:
      playerId === sipahiId
        ? playerIds
            .filter((pid) => pid !== rajaId && pid !== sipahiId)
            .map((pid) => ({ id: pid, nickname: room.players.get(pid).nickname }))
        : [],
  };
}

function scheduleRoomSweep(code) {
  setTimeout(() => {
    const room = rooms.getRoom(code);
    if (room && rooms.allDisconnected(room)) {
      rooms.deleteRoom(code);
    }
  }, DISCONNECTED_ROOM_TTL_MS);
}

function clearGuessTimer(room) {
  if (room.guessTimer) {
    clearTimeout(room.guessTimer);
    room.guessTimer = null;
  }
  room.guessDeadline = null;
}

function finishRound(room, guessedPlayerId, { timedOut = false } = {}) {
  clearGuessTimer(room);

  const { correct, chorId, roundPoints } = resolveGuess({
    assignment: room.assignment,
    guessedPlayerId,
  });

  for (const [pid, pts] of Object.entries(roundPoints)) {
    const player = room.players.get(pid);
    if (player) player.score += pts;
  }

  room.state = "result";
  room.lastResult = {
    correct,
    timedOut,
    roles: Object.fromEntries(
      Object.entries(room.assignment).map(([id, r]) => [
        id,
        { role: r.name, nickname: room.players.get(id)?.nickname },
      ])
    ),
    roundPoints,
    chorNickname: room.players.get(chorId)?.nickname,
  };
  room.assignment = null;
}

function armGuessTimer(room, code) {
  clearGuessTimer(room);
  room.guessDeadline = Date.now() + GUESS_TIME_MS;
  room.guessTimer = setTimeout(() => {
    const current = rooms.getRoom(code);
    if (!current || current.state !== "guessing" || !current.assignment) return;

    const ids = Object.keys(current.assignment);
    const rajaId = ids.find((id) => current.assignment[id].name === "Raja");
    const sipahiId = ids.find((id) => current.assignment[id].name === "Sipahi");
    const candidates = ids.filter((id) => id !== rajaId && id !== sipahiId);
    const randomPick = candidates[Math.floor(Math.random() * candidates.length)];

    finishRound(current, randomPick, { timedOut: true });
    broadcastRoom(current);
  }, GUESS_TIME_MS);
}

io.on("connection", (socket) => {
  socket.on("room:create", ({ nickname }, cb) => {
    const name = (nickname || "").trim().slice(0, 20) || "Player";
    const room = rooms.createRoom();
    const playerId = generatePlayerId();
    socket.join(room.code);
    rooms.addPlayer(room, playerId, socket.id, name);
    socketIndex.set(socket.id, { code: room.code, playerId });
    cb?.({ ok: true, code: room.code, playerId });
    broadcastRoom(room);
  });

  socket.on("room:join", ({ code, nickname }, cb) => {
    const room = rooms.getRoom(code);
    if (!room) return cb?.({ ok: false, error: "Room not found" });
    if (room.state !== "lobby") return cb?.({ ok: false, error: "Game already in progress" });
    if (room.players.size >= MAX_PLAYERS) return cb?.({ ok: false, error: "Room is full" });

    const name = (nickname || "").trim().slice(0, 20) || "Player";
    const playerId = generatePlayerId();
    socket.join(room.code);
    rooms.addPlayer(room, playerId, socket.id, name);
    socketIndex.set(socket.id, { code: room.code, playerId });
    cb?.({ ok: true, code: room.code, playerId });
    broadcastRoom(room);
  });

  socket.on("room:rejoin", ({ code, playerId }, cb) => {
    const room = rooms.getRoom(code);
    if (!room) return cb?.({ ok: false, error: "Room not found" });
    const player = rooms.reconnectPlayer(room, playerId, socket.id);
    if (!player) return cb?.({ ok: false, error: "Could not rejoin room" });

    socket.join(room.code);
    socketIndex.set(socket.id, { code: room.code, playerId });
    cb?.({ ok: true, code: room.code, playerId });
    broadcastRoom(room);

    if (room.state === "guessing" && room.assignment?.[playerId]) {
      const playerIds = Array.from(room.players.keys());
      const rajaId = playerIds.find((id) => room.assignment[id].name === "Raja");
      const sipahiId = playerIds.find((id) => room.assignment[id].name === "Sipahi");
      emitToPlayer(
        room,
        playerId,
        "role:assigned",
        roleAssignedPayload(room, playerIds, rajaId, sipahiId, playerId)
      );
    }
  });

  socket.on("room:start", ({ code }, cb) => {
    const room = rooms.getRoom(code);
    if (!room) return cb?.({ ok: false, error: "Room not found" });
    const entry = socketIndex.get(socket.id);
    if (!entry || room.hostId !== entry.playerId) return cb?.({ ok: false, error: "Only host can start" });
    if (room.players.size !== MAX_PLAYERS)
      return cb?.({ ok: false, error: `Need exactly ${MAX_PLAYERS} players` });

    const playerIds = Array.from(room.players.keys());
    room.assignment = assignRoles(playerIds);
    room.state = "guessing";
    room.round += 1;
    room.lastResult = null;
    armGuessTimer(room, code);

    const rajaId = playerIds.find((id) => room.assignment[id].name === "Raja");
    const sipahiId = playerIds.find((id) => room.assignment[id].name === "Sipahi");

    for (const id of playerIds) {
      emitToPlayer(room, id, "role:assigned", roleAssignedPayload(room, playerIds, rajaId, sipahiId, id));
    }

    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("round:guess", ({ code, targetId }, cb) => {
    const room = rooms.getRoom(code);
    if (!room || !room.assignment) return cb?.({ ok: false, error: "No active round" });
    const entry = socketIndex.get(socket.id);
    const sipahiId = Object.keys(room.assignment).find(
      (id) => room.assignment[id].name === "Sipahi"
    );
    if (!entry || entry.playerId !== sipahiId) return cb?.({ ok: false, error: "Only Sipahi can guess" });

    finishRound(room, targetId);
    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("round:next", ({ code }, cb) => {
    const room = rooms.getRoom(code);
    if (!room) return cb?.({ ok: false, error: "Room not found" });
    const entry = socketIndex.get(socket.id);
    if (!entry || room.hostId !== entry.playerId) return cb?.({ ok: false, error: "Only host can continue" });

    if (room.round >= room.totalRounds) {
      room.state = "finished";
    } else {
      room.state = "lobby";
      room.lastResult = null;
    }
    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("room:playAgain", ({ code }, cb) => {
    const room = rooms.getRoom(code);
    if (!room) return cb?.({ ok: false, error: "Room not found" });
    const entry = socketIndex.get(socket.id);
    if (!entry || room.hostId !== entry.playerId) return cb?.({ ok: false, error: "Only host can restart" });
    clearGuessTimer(room);
    room.state = "lobby";
    room.round = 0;
    room.lastResult = null;
    room.assignment = null;
    for (const p of room.players.values()) p.score = 0;
    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("room:kick", ({ code, targetId }, cb) => {
    const room = rooms.getRoom(code);
    if (!room) return cb?.({ ok: false, error: "Room not found" });
    const entry = socketIndex.get(socket.id);
    if (!entry || room.hostId !== entry.playerId)
      return cb?.({ ok: false, error: "Only host can remove players" });
    if (room.state !== "lobby")
      return cb?.({ ok: false, error: "Can only remove players between rounds" });
    const target = room.players.get(targetId);
    if (!target) return cb?.({ ok: false, error: "Player not found" });
    if (target.connected) return cb?.({ ok: false, error: "Can only remove disconnected players" });

    rooms.removePlayer(room, targetId);
    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("disconnect", () => {
    const entry = socketIndex.get(socket.id);
    socketIndex.delete(socket.id);
    if (!entry) return;
    const room = rooms.getRoom(entry.code);
    if (!room) return;

    rooms.markDisconnected(room, entry.playerId);
    broadcastRoom(room);
    if (rooms.allDisconnected(room)) {
      scheduleRoomSweep(room.code);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Raja Mantri Chor Sipahi server listening on :${PORT}`);
});
