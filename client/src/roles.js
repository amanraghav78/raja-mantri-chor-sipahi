import { Crown, ScrollText, Shield, VenetianMask } from "lucide-react";

// Single source of truth for role identity — icon, colour class and copy are
// reused by the reveal card, result list, scoreboard and how-to-play legend.
export const ROLE_CONFIG = {
  Raja: {
    icon: Crown,
    className: "role-raja",
    translation: "The King",
    points: 1000,
    brief: "You rule the court. Your identity is revealed to everyone.",
    short: "Revealed to all. Always scores full points.",
  },
  Mantri: {
    icon: ScrollText,
    className: "role-mantri",
    translation: "The Minister",
    points: 800,
    brief: "Stay quiet and stay hidden — your points are safe either way.",
    short: "Stays hidden. Points are never at risk.",
  },
  Sipahi: {
    icon: Shield,
    className: "role-sipahi",
    translation: "The Soldier",
    points: 500,
    brief: "Find the Chor among the two hidden players to keep your points.",
    short: "Must find the Chor to keep their points.",
  },
  Chor: {
    icon: VenetianMask,
    className: "role-chor",
    translation: "The Thief",
    points: 0,
    brief: "Keep your cool. If the Sipahi picks wrong, you take their points.",
    short: "Hides. Steals the Sipahi's points on a wrong guess.",
  },
};

export const ROLE_ORDER = ["Raja", "Mantri", "Sipahi", "Chor"];
