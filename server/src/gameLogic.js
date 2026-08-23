export const ROLES = [
  { name: "Raja", points: 1000 },
  { name: "Mantri", points: 800 },
  { name: "Sipahi", points: 500 },
  { name: "Chor", points: 0 },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function assignRoles(playerIds) {
  const shuffledRoles = shuffle(ROLES);
  const assignment = {};
  playerIds.forEach((id, i) => {
    assignment[id] = shuffledRoles[i];
  });
  return assignment;
}

export function resolveGuess({ assignment, guessedPlayerId }) {
  const chorId = Object.keys(assignment).find((id) => assignment[id].name === "Chor");
  const sipahiId = Object.keys(assignment).find((id) => assignment[id].name === "Sipahi");
  const correct = guessedPlayerId === chorId;

  const roundPoints = {};
  for (const id of Object.keys(assignment)) {
    roundPoints[id] = assignment[id].points;
  }

  if (!correct) {
    // wrong guess: Sipahi and Chor swap points (house rule, default on)
    roundPoints[sipahiId] = 0;
    roundPoints[chorId] = 500;
  }

  return { correct, chorId, sipahiId, roundPoints };
}
