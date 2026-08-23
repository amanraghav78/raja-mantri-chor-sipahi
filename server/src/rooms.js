import crypto from "crypto";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(length = 5) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export function generatePlayerId() {
  return crypto.randomUUID();
}

export class RoomManager {
  constructor() {
    this.rooms = new Map(); // code -> room
  }

  createRoom() {
    let code;
    do {
      code = generateCode();
    } while (this.rooms.has(code));

    const room = {
      code,
      hostId: null, // playerId
      players: new Map(), // playerId -> { id, nickname, score, connected, socketId }
      state: "lobby", // lobby | guessing | result | finished
      totalRounds: 5,
      round: 0,
      assignment: null,
      lastResult: null,
      createdAt: Date.now(),
    };
    this.rooms.set(code, room);
    return room;
  }

  getRoom(code) {
    return this.rooms.get(code?.toUpperCase());
  }

  deleteRoom(code) {
    this.rooms.delete(code);
  }

  addPlayer(room, playerId, socketId, nickname) {
    if (!room.hostId) room.hostId = playerId;
    room.players.set(playerId, {
      id: playerId,
      nickname,
      score: 0,
      connected: true,
      socketId,
    });
  }

  removePlayer(room, playerId) {
    room.players.delete(playerId);
    if (room.hostId === playerId) {
      const next = room.players.keys().next().value;
      room.hostId = next || null;
    }
  }

  // Reattaches an existing player (by their stable playerId) to a new socket
  // after a reconnect. Returns null if the player isn't part of this room.
  reconnectPlayer(room, playerId, socketId) {
    const player = room.players.get(playerId);
    if (!player) return null;
    player.connected = true;
    player.socketId = socketId;
    return player;
  }

  markDisconnected(room, playerId) {
    const player = room.players.get(playerId);
    if (player) player.connected = false;
  }

  allDisconnected(room) {
    if (room.players.size === 0) return true;
    return Array.from(room.players.values()).every((p) => !p.connected);
  }

  publicState(room) {
    return {
      code: room.code,
      hostId: room.hostId,
      state: room.state,
      round: room.round,
      totalRounds: room.totalRounds,
      guessDeadline: room.guessDeadline || null,
      players: Array.from(room.players.values()).map((p) => ({
        id: p.id,
        nickname: p.nickname,
        score: p.score,
        connected: p.connected,
      })),
      lastResult: room.lastResult,
    };
  }
}
