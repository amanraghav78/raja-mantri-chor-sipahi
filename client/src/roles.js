// Single source of truth for role identity. The crest itself lives in
// RoleCrest.jsx; everything here is the copy and the tone hook that pairs
// with the --role-* tokens in theme.css.
export const ROLE_CONFIG = {
  Raja: {
    tone: "tone-Raja",
    translit: "राजा · The King",
    points: 1000,
    brief: "You hold the court. Your name is announced to everyone.",
    short: "Revealed to all. Always scores full points.",
  },
  Mantri: {
    tone: "tone-Mantri",
    translit: "मंत्री · The Minister",
    points: 800,
    brief: "Say nothing, stay unseen. Your points are never at risk.",
    short: "Stays hidden. Points are never at risk.",
  },
  Sipahi: {
    tone: "tone-Sipahi",
    translit: "सिपाही · The Soldier",
    points: 500,
    brief: "Name the Chor between the two hidden players to keep your points.",
    short: "Must find the Chor to keep their points.",
  },
  Chor: {
    tone: "tone-Chor",
    translit: "चोर · The Thief",
    points: 0,
    brief: "Hold your nerve. A wrong accusation hands you the Sipahi's points.",
    short: "Hides. Takes the Sipahi's points on a wrong guess.",
  },
};

export const ROLE_ORDER = ["Raja", "Mantri", "Sipahi", "Chor"];
