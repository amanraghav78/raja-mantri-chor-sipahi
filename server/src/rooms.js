const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(length = 5) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
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
      hostId: null,
      players: new Map(), // socketId -> { id, nickname, score, connected }
      state: "lobby", // lobby | reveal | guessing | result
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

  addPlayer(room, socketId, nickname) {
    if (!room.hostId) room.hostId = socketId;
    room.players.set(socketId, {
      id: socketId,
      nickname,
      score: 0,
      connected: true,
    });
  }

  removePlayer(room, socketId) {
    room.players.delete(socketId);
    if (room.hostId === socketId) {
      const next = room.players.keys().next().value;
      room.hostId = next || null;
    }
  }

  publicState(room) {
    return {
      code: room.code,
      hostId: room.hostId,
      state: room.state,
      round: room.round,
      totalRounds: room.totalRounds,
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
