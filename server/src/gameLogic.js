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

const MAX_REDEAL_ATTEMPTS = 40;

/**
 * Deals the four roles at random, but avoids handing anyone the role they
 * just had. A plain independent shuffle is uniformly fair yet still gives
 * each player a 1-in-4 chance of repeating every round, which players read
 * as broken ("why am I Raja again?"). Re-dealing until nobody repeats keeps
 * it random while removing the streaks people actually notice.
 *
 * @param playerIds       ids to deal to
 * @param previousRoles   { [playerId]: roleName } from the last round, if any
 */
export function assignRoles(playerIds, previousRoles = null) {
  let best = null;

  for (let attempt = 0; attempt < MAX_REDEAL_ATTEMPTS; attempt++) {
    const shuffled = shuffle(ROLES);
    const candidate = {};
    playerIds.forEach((id, i) => {
      candidate[id] = shuffled[i];
    });

    if (!previousRoles) return candidate;

    const repeats = playerIds.filter((id) => previousRoles[id] === candidate[id].name).length;
    if (repeats === 0) return candidate;

    // Keep the least-repetitive deal seen so far as a fallback.
    if (!best || repeats < best.repeats) best = { candidate, repeats };
  }

  return best.candidate;
}

export function resolveGuess({ assignment, guessedPlayerId, swapOnWrongGuess = true }) {
  const chorId = Object.keys(assignment).find((id) => assignment[id].name === "Chor");
  const sipahiId = Object.keys(assignment).find((id) => assignment[id].name === "Sipahi");
  const correct = guessedPlayerId === chorId;

  const roundPoints = {};
  for (const id of Object.keys(assignment)) {
    roundPoints[id] = assignment[id].points;
  }

  if (!correct) {
    // House rule: either the Sipahi's 500 transfers to the Chor, or the
    // Sipahi simply loses their points and the Chor still gets nothing.
    roundPoints[sipahiId] = 0;
    if (swapOnWrongGuess) roundPoints[chorId] = 500;
  }

  return { correct, chorId, sipahiId, roundPoints };
}
