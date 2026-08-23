# Raja Mantri Chor Sipahi — Online

4-player real-time version of the classic Indian guessing game, built with Node/Express/Socket.io and React (Vite).

## Run locally

**1. Backend**
```
cd server
npm install
npm run dev
```
Server runs on http://localhost:4000

**2. Frontend** (new terminal)
```
cd client
npm install
npm run dev
```
Client runs on http://localhost:5173

Open the client URL in 4 browser tabs (or 4 phones on the same network, using your PC's LAN IP instead of localhost) to play a full round.

## How it plays
- Host creates a room and shares the 5-letter code.
- 3 more players join with the code + a nickname.
- Host starts the round once 4 players are in — roles (Raja 1000, Mantri 800, Sipahi 500, Chor 0) are dealt at random.
- Everyone sees only their own role; the Raja is revealed to the table automatically.
- The Sipahi picks who they think the Chor is between the two remaining unrevealed players.
- Correct guess: points stand. Wrong guess: Sipahi and Chor swap points.
- Scores accumulate over 5 rounds (edit `totalRounds` in `server/src/rooms.js` to change), then a final leaderboard is shown and the host can start a new game.

## Deploying
- Frontend → Vercel (set `VITE_SERVER_URL` env var to your deployed backend URL).
- Backend → Render/Railway (set `CLIENT_ORIGIN` env var to your deployed frontend URL for CORS).
