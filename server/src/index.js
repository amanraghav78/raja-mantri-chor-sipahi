import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { RoomManager, generatePlayerId, sanitizeNickname, AVATARS } from "./rooms.js";
import { assignRoles, resolveGuess } from "./gameLogic.js";

const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.CLIENT_ORIGIN || "*";
const MAX_PLAYERS = 4;
const DISCONNECTED_ROOM_TTL_MS = 5 * 60 * 1000;
const GUESS_TIME_MS = 30000;
const ROUND_OPTIONS = [3, 5, 10];

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

function requireHost(room, socket) {
  const entry = socketIndex.get(socket.id);
  if (!entry || room.hostId !== entry.playerId) return null;
  return entry;
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
            .map((pid) => ({
              id: pid,
              nickname: room.players.get(pid).nickname,
              avatar: room.players.get(pid).avatar,
            }))
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

  const { correct, chorId, sipahiId, roundPoints } = resolveGuess({
    assignment: room.assignment,
    guessedPlayerId,
    swapOnWrongGuess: room.settings.swapOnWrongGuess,
  });

  for (const [pid, pts] of Object.entries(roundPoints)) {
    const player = room.players.get(pid);
    if (player) player.score += pts;
  }

  const roles = Object.fromEntries(
    Object.entries(room.assignment).map(([id, r]) => [
      id,
      {
        role: r.name,
        nickname: room.players.get(id)?.nickname,
        avatar: room.players.get(id)?.avatar,
      },
    ])
  );

  room.state = "result";
  room.lastResult = {
    correct,
    timedOut,
    roles,
    roundPoints,
    guessedId: guessedPlayerId,
    guessedNickname: room.players.get(guessedPlayerId)?.nickname,
    chorId,
    chorNickname: room.players.get(chorId)?.nickname,
    sipahiNickname: room.players.get(sipahiId)?.nickname,
  };
  room.history.push({ round: room.round, correct, timedOut, roles, roundPoints });
  room.assignment = null;
}

function armGuessTimer(room, code) {
  clearGuessTimer(room);
  if (!room.settings.timerEnabled) return;

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
    const name = sanitizeNickname(nickname);
    if (!name) return cb?.({ ok: false, error: "Please enter a nickname" });

    const room = rooms.createRoom();
    const playerId = generatePlayerId();
    socket.join(room.code);
    rooms.addPlayer(room, playerId, socket.id, name);
    socketIndex.set(socket.id, { code: room.code, playerId });
    cb?.({ ok: true, code: room.code, playerId });
    broadcastRoom(room);
  });

  socket.on("room:join", ({ code, nickname }, cb) => {
    const name = sanitizeNickname(nickname);
    if (!name) return cb?.({ ok: false, error: "Please enter a nickname" });

    const trimmed = (code || "").trim().toUpperCase();
    if (!/^[A-Z0-9]{4,6}$/.test(trimmed))
      return cb?.({ ok: false, error: "Room codes are 5 letters and numbers" });

    const room = rooms.getRoom(trimmed);
    if (!room) return cb?.({ ok: false, error: "No room with that code. Check and try again." });
    if (room.state !== "lobby")
      return cb?.({ ok: false, error: "That game is already in progress" });
    if (room.players.size >= MAX_PLAYERS) return cb?.({ ok: false, error: "That room is full (4/4)" });

    const taken = Array.from(room.players.values()).some(
      (p) => p.nickname.toLowerCase() === name.toLowerCase()
    );
    if (taken) return cb?.({ ok: false, error: "Someone already has that nickname" });

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

  socket.on("player:update", ({ code, nickname, avatar }, cb) => {
    const room = rooms.getRoom(code);
    if (!room) return cb?.({ ok: false, error: "Room not found" });
    const entry = socketIndex.get(socket.id);
    const player = entry && room.players.get(entry.playerId);
    if (!player) return cb?.({ ok: false, error: "You are not in this room" });

    if (nickname !== undefined) {
      const name = sanitizeNickname(nickname);
      if (!name) return cb?.({ ok: false, error: "Nickname can't be empty" });
      const taken = Array.from(room.players.values()).some(
        (p) => p.id !== player.id && p.nickname.toLowerCase() === name.toLowerCase()
      );
      if (taken) return cb?.({ ok: false, error: "Someone already has that nickname" });
      player.nickname = name;
    }
    if (avatar !== undefined && AVATARS.includes(avatar)) {
      player.avatar = avatar;
    }

    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("room:settings", ({ code, settings }, cb) => {
    const room = rooms.getRoom(code);
    if (!room) return cb?.({ ok: false, error: "Room not found" });
    if (!requireHost(room, socket)) return cb?.({ ok: false, error: "Only the host can change settings" });
    if (room.state !== "lobby")
      return cb?.({ ok: false, error: "Settings can only change between rounds" });

    if (settings?.totalRounds !== undefined) {
      const n = Number(settings.totalRounds);
      if (!ROUND_OPTIONS.includes(n))
        return cb?.({ ok: false, error: "Rounds must be 3, 5 or 10" });
      if (n < room.round)
        return cb?.({ ok: false, error: `You've already played ${room.round} rounds` });
      room.settings.totalRounds = n;
    }
    if (settings?.swapOnWrongGuess !== undefined) {
      room.settings.swapOnWrongGuess = Boolean(settings.swapOnWrongGuess);
    }
    if (settings?.timerEnabled !== undefined) {
      room.settings.timerEnabled = Boolean(settings.timerEnabled);
    }

    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("room:start", ({ code }, cb) => {
    const room = rooms.getRoom(code);
    if (!room) return cb?.({ ok: false, error: "Room not found" });
    if (!requireHost(room, socket)) return cb?.({ ok: false, error: "Only the host can start" });
    if (room.players.size !== MAX_PLAYERS)
      return cb?.({ ok: false, error: `You need exactly ${MAX_PLAYERS} players` });
    if (room.state !== "lobby") return cb?.({ ok: false, error: "Round already in progress" });

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
    if (!entry || entry.playerId !== sipahiId)
      return cb?.({ ok: false, error: "Only the Sipahi can guess" });
    if (!room.assignment[targetId] || targetId === sipahiId)
      return cb?.({ ok: false, error: "Pick one of the two hidden players" });

    finishRound(room, targetId);
    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("round:next", ({ code }, cb) => {
    const room = rooms.getRoom(code);
    if (!room) return cb?.({ ok: false, error: "Room not found" });
    if (!requireHost(room, socket)) return cb?.({ ok: false, error: "Only the host can continue" });

    if (room.round >= room.settings.totalRounds) {
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
    if (!requireHost(room, socket)) return cb?.({ ok: false, error: "Only the host can restart" });

    clearGuessTimer(room);
    room.state = "lobby";
    room.round = 0;
    room.lastResult = null;
    room.assignment = null;
    room.history = [];
    for (const p of room.players.values()) p.score = 0;
    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("room:kick", ({ code, targetId }, cb) => {
    const room = rooms.getRoom(code);
    if (!room) return cb?.({ ok: false, error: "Room not found" });
    if (!requireHost(room, socket))
      return cb?.({ ok: false, error: "Only the host can remove players" });
    if (room.state !== "lobby")
      return cb?.({ ok: false, error: "You can only remove players between rounds" });
    const target = room.players.get(targetId);
    if (!target) return cb?.({ ok: false, error: "Player not found" });
    if (target.connected) return cb?.({ ok: false, error: "You can only remove offline players" });

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
    // Keep the game playable if the host is the one who dropped.
    if (room.hostId === entry.playerId && !rooms.allDisconnected(room)) {
      rooms.reassignHost(room);
    }
    broadcastRoom(room);
    if (rooms.allDisconnected(room)) {
      scheduleRoomSweep(room.code);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Raja Mantri Chor Sipahi server listening on :${PORT}`);
});
