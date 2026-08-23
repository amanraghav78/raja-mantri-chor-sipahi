import crypto from "crypto";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const AVATARS = ["🦁", "🐯", "🦅", "🐘", "🦚", "🐅", "🦌", "🐍", "🦂", "🐊"];

const BOT_NAMES = ["Arjun", "Meera", "Kabir", "Diya", "Rohan", "Ira"];

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

export function sanitizeNickname(nickname) {
  return (nickname || "").trim().replace(/\s+/g, " ").slice(0, 16);
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
      players: new Map(), // playerId -> { id, nickname, avatar, score, connected, socketId, isBot }
      state: "lobby", // lobby | guessing | result | finished
      round: 0,
      settings: {
        totalRounds: 5,
        swapOnWrongGuess: true,
        timerEnabled: true,
      },
      assignment: null,
      previousRoles: null,
      lastResult: null,
      history: [],
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

  // Picks the first avatar nobody in the room has taken yet.
  nextAvatar(room) {
    const taken = new Set(Array.from(room.players.values()).map((p) => p.avatar));
    return AVATARS.find((a) => !taken.has(a)) || AVATARS[0];
  }

  addPlayer(room, playerId, socketId, nickname) {
    if (!room.hostId) room.hostId = playerId;
    room.players.set(playerId, {
      id: playerId,
      nickname,
      avatar: this.nextAvatar(room),
      score: 0,
      connected: true,
      socketId,
      isBot: false,
    });
  }

  addBot(room) {
    const taken = new Set(Array.from(room.players.values()).map((p) => p.nickname));
    const name = BOT_NAMES.find((n) => !taken.has(n)) || `Bot ${room.players.size + 1}`;
    const id = generatePlayerId();
    room.players.set(id, {
      id,
      nickname: name,
      avatar: this.nextAvatar(room),
      score: 0,
      connected: true,
      socketId: null,
      isBot: true,
    });
    return id;
  }

  removePlayer(room, playerId) {
    room.players.delete(playerId);
    if (room.hostId === playerId) this.reassignHost(room);
  }

  // Hands the host role to any still-connected human so the game can't
  // stall when the host closes their tab mid-game. Bots never host.
  reassignHost(room) {
    const human = Array.from(room.players.values()).find((p) => !p.isBot && p.connected);
    const anyHuman = Array.from(room.players.values()).find((p) => !p.isBot);
    room.hostId = (human || anyHuman)?.id || null;
  }

  // Reattaches an existing player (by their stable playerId) to a new socket
  // after a reconnect. Returns null if the player isn't part of this room.
  reconnectPlayer(room, playerId, socketId) {
    const player = room.players.get(playerId);
    if (!player || player.isBot) return null;
    player.connected = true;
    player.socketId = socketId;
    return player;
  }

  markDisconnected(room, playerId) {
    const player = room.players.get(playerId);
    if (player) player.connected = false;
  }

  // Bots don't count as presence — a room holding only bots is abandoned.
  allDisconnected(room) {
    const humans = Array.from(room.players.values()).filter((p) => !p.isBot);
    if (humans.length === 0) return true;
    return humans.every((p) => !p.connected);
  }

  publicState(room) {
    return {
      code: room.code,
      hostId: room.hostId,
      state: room.state,
      round: room.round,
      totalRounds: room.settings.totalRounds,
      settings: { ...room.settings },
      guessDeadline: room.guessDeadline || null,
      players: Array.from(room.players.values()).map((p) => ({
        id: p.id,
        nickname: p.nickname,
        avatar: p.avatar,
        score: p.score,
        connected: p.connected,
        isBot: p.isBot,
      })),
      lastResult: room.lastResult,
      history: room.history,
    };
  }
}
