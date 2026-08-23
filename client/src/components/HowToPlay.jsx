import Modal from "./Modal.jsx";
import RoleCrest from "./RoleCrest.jsx";
import { ROLE_CONFIG, ROLE_ORDER } from "../roles.js";

const STEPS = [
  {
    title: "The court is dealt",
    body: "Four roles are struck at random each round. Only you see yours — except the Raja, whose name is announced to the whole table.",
  },
  {
    title: "The Sipahi hunts",
    body: "With the Raja known, two players stay hidden: the Mantri and the Chor. The Sipahi names which one they believe is the thief.",
  },
  {
    title: "The coin falls",
    body: "A correct accusation and everyone keeps their role's points. A wrong one and the Sipahi's 500 passes to the Chor.",
  },
  {
    title: "The crown is claimed",
    body: "Points carry across every round. Whoever stands highest when the last round closes takes the crown.",
  },
];

export default function HowToPlay({ onClose }) {
  return (
    <Modal title="How to Play" onClose={onClose}>
      <div className="legend">
        {ROLE_ORDER.map((name) => {
          const cfg = ROLE_CONFIG[name];
          return (
            <div key={name} className={`legend-row ${cfg.tone}`}>
              <RoleCrest role={name} size={22} />
              <span className="legend-name">{name}</span>
              <span className="legend-desc">{cfg.short}</span>
              <span className="legend-pts">{cfg.points}</span>
            </div>
          );
        })}
      </div>

      {STEPS.map((step, i) => (
        <div key={step.title} className="step">
          <span className="step-num">{i + 1}</span>
          <div>
            <div className="step-title">{step.title}</div>
            <p className="step-body">{step.body}</p>
          </div>
        </div>
      ))}

      <button className="btn btn-gold btn-full" style={{ marginTop: "var(--s-5)" }} onClick={onClose}>
        Understood
      </button>
    </Modal>
  );
}
