# Raja Mantri Chor Sipahi — Online

The classic 4-player Indian party game, playable in any browser. Node/Express/Socket.io backend, React (Vite) frontend, no accounts and no database.

## Run locally

**Backend**
```
cd server
npm install
npm run dev      # http://localhost:4000
```

**Frontend** (separate terminal)
```
cd client
npm install
npm run dev      # http://localhost:5173
```

Open the client in 4 browser tabs — or on 4 phones using your machine's LAN IP — to play a full game.

## How it plays

- The host creates a room and shares the 5-character code, a link, or a QR code.
- Three more players join. Once the room is full the host starts the round.
- Roles are dealt at random: **Raja** 1000, **Mantri** 800, **Sipahi** 500, **Chor** 0.
- Everyone taps their face-down card to reveal their own role. The Raja is announced to the table.
- The Sipahi picks which of the two hidden players is the Chor, then locks the guess in.
- Correct: everyone keeps their role's points. Wrong: the Sipahi's 500 goes to the Chor (configurable).
- Scores accumulate; after the final round a winner is crowned.

## Settings

Per-player (this device only): sound &amp; vibration, dark/light theme, nickname, avatar.

Host-only (applies to the room, changeable between rounds): rounds per game (3/5/10), whether a
wrong guess swaps points, and whether the 30-second guess timer is on.

## Reconnects and edge cases

- Each player holds a stable id in `localStorage`, so a refresh or a dropped connection rejoins the
  same room and role instead of removing the player.
- If the host disconnects, the host role passes to a connected player so the game can continue.
- The host can remove a player who is offline in the lobby, freeing the seat for someone else.
- Rooms are cleaned up five minutes after the last player disconnects.

## Deploying

- **Frontend → Vercel.** Root directory `client`, env var `VITE_SERVER_URL` set to the backend URL.
- **Backend → Render.** `render.yaml` in the repo root is a ready blueprint; set `CLIENT_ORIGIN` to
  the exact frontend origin, with no trailing slash (a trailing slash breaks CORS).
