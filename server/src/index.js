import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { RoomManager } from "./rooms.js";
import { assignRoles, resolveGuess } from "./gameLogic.js";

const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.CLIENT_ORIGIN || "*";
const MAX_PLAYERS = 4;

const app = express();
app.use(cors({ origin: ORIGIN }));
app.get("/health", (_req, res) => res.json({ ok: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: ORIGIN, methods: ["GET", "POST"] },
});

const rooms = new RoomManager();

function broadcastRoom(room) {
  io.to(room.code).emit("room:update", rooms.publicState(room));
}

function findRoomBySocket(socketId) {
  for (const room of rooms.rooms.values()) {
    if (room.players.has(socketId)) return room;
  }
  return null;
}

io.on("connection", (socket) => {
  socket.on("room:create", ({ nickname }, cb) => {
    const name = (nickname || "").trim().slice(0, 20) || "Player";
    const room = rooms.createRoom();
    socket.join(room.code);
    rooms.addPlayer(room, socket.id, name);
    cb?.({ ok: true, code: room.code, playerId: socket.id });
    broadcastRoom(room);
  });

  socket.on("room:join", ({ code, nickname }, cb) => {
    const room = rooms.getRoom(code);
    if (!room) return cb?.({ ok: false, error: "Room not found" });
    if (room.state !== "lobby") return cb?.({ ok: false, error: "Game already in progress" });
    if (room.players.size >= MAX_PLAYERS) return cb?.({ ok: false, error: "Room is full" });

    const name = (nickname || "").trim().slice(0, 20) || "Player";
    socket.join(room.code);
    rooms.addPlayer(room, socket.id, name);
    cb?.({ ok: true, code: room.code, playerId: socket.id });
    broadcastRoom(room);
  });

  socket.on("room:start", ({ code }, cb) => {
    const room = rooms.getRoom(code);
    if (!room) return cb?.({ ok: false, error: "Room not found" });
    if (room.hostId !== socket.id) return cb?.({ ok: false, error: "Only host can start" });
    if (room.players.size !== MAX_PLAYERS)
      return cb?.({ ok: false, error: `Need exactly ${MAX_PLAYERS} players` });

    const playerIds = Array.from(room.players.keys());
    room.assignment = assignRoles(playerIds);
    room.state = "guessing";
    room.round += 1;
    room.lastResult = null;

    const rajaId = playerIds.find((id) => room.assignment[id].name === "Raja");
    const rajaName = room.players.get(rajaId).nickname;
    const sipahiId = playerIds.find((id) => room.assignment[id].name === "Sipahi");

    for (const id of playerIds) {
      io.to(id).emit("role:assigned", {
        role: room.assignment[id].name,
        points: room.assignment[id].points,
        raja: { id: rajaId, nickname: rajaName },
        isSipahi: id === sipahiId,
        candidates:
          id === sipahiId
            ? playerIds
                .filter((pid) => pid !== rajaId && pid !== sipahiId)
                .map((pid) => ({ id: pid, nickname: room.players.get(pid).nickname }))
            : [],
      });
    }

    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("round:guess", ({ code, targetId }, cb) => {
    const room = rooms.getRoom(code);
    if (!room || !room.assignment) return cb?.({ ok: false, error: "No active round" });
    const sipahiId = Object.keys(room.assignment).find(
      (id) => room.assignment[id].name === "Sipahi"
    );
    if (socket.id !== sipahiId) return cb?.({ ok: false, error: "Only Sipahi can guess" });

    const { correct, chorId, roundPoints } = resolveGuess({
      assignment: room.assignment,
      guessedPlayerId: targetId,
    });

    for (const [pid, pts] of Object.entries(roundPoints)) {
      const player = room.players.get(pid);
      if (player) player.score += pts;
    }

    room.state = "result";
    room.lastResult = {
      correct,
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

    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("round:next", ({ code }, cb) => {
    const room = rooms.getRoom(code);
    if (!room) return cb?.({ ok: false, error: "Room not found" });
    if (room.hostId !== socket.id) return cb?.({ ok: false, error: "Only host can continue" });

    if (room.round >= room.totalRounds) {
      room.state = "finished";
    } else {
      room.state = "lobby";
    }
    room.lastResult = room.state === "finished" ? room.lastResult : null;
    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("room:playAgain", ({ code }, cb) => {
    const room = rooms.getRoom(code);
    if (!room) return cb?.({ ok: false, error: "Room not found" });
    if (room.hostId !== socket.id) return cb?.({ ok: false, error: "Only host can restart" });
    room.state = "lobby";
    room.round = 0;
    room.lastResult = null;
    room.assignment = null;
    for (const p of room.players.values()) p.score = 0;
    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("disconnect", () => {
    const room = findRoomBySocket(socket.id);
    if (!room) return;
    rooms.removePlayer(room, socket.id);
    if (room.players.size === 0) {
      rooms.deleteRoom(room.code);
    } else {
      broadcastRoom(room);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Raja Mantri Chor Sipahi server listening on :${PORT}`);
});
