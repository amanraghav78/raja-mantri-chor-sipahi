import { HelpCircle } from "lucide-react";
import Modal from "./Modal.jsx";
import { ROLE_CONFIG, ROLE_ORDER } from "../roles.js";

const STEPS = [
  {
    title: "Everyone gets a secret role",
    body: "Each round the four roles are dealt at random. Only you can see yours — except the Raja, who is announced to the whole table.",
  },
  {
    title: "The Sipahi hunts the Chor",
    body: "With the Raja known, two players stay hidden: the Mantri and the Chor. The Sipahi picks which one they think is the Chor.",
  },
  {
    title: "Points are settled",
    body: "Guess right and everyone keeps their role's points. Guess wrong and the Sipahi's 500 goes to the Chor instead.",
  },
  {
    title: "Play the set",
    body: "Scores add up across every round. Whoever has the most points when the last round ends wins the crown.",
  },
];

export default function HowToPlay({ onClose }) {
  return (
    <Modal title="How to Play" icon={HelpCircle} onClose={onClose}>
      <div className="role-legend">
        {ROLE_ORDER.map((name) => {
          const cfg = ROLE_CONFIG[name];
          const Icon = cfg.icon;
          return (
            <div key={name} className={`legend-row ${cfg.className}`}>
              <Icon size={18} />
              <span className="legend-name">{name}</span>
              <span className="legend-desc">{cfg.short}</span>
              <span className="legend-points">{cfg.points}</span>
            </div>
          );
        })}
      </div>

      {STEPS.map((step, i) => (
        <div key={step.title} className="howto-step">
          <div className="howto-num">{i + 1}</div>
          <div className="howto-body">
            <h4>{step.title}</h4>
            <p>{step.body}</p>
          </div>
        </div>
      ))}

      <button className="btn btn-primary" style={{ width: "100%", marginTop: 18 }} onClick={onClose}>
        Got it
      </button>
    </Modal>
  );
}
