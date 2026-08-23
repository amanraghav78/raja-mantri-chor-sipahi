const ROLE_META = {
  Raja: { emoji: "👑", color: "role-raja" },
  Mantri: { emoji: "🧠", color: "role-mantri" },
  Sipahi: { emoji: "🛡️", color: "role-sipahi" },
  Chor: { emoji: "🥷", color: "role-chor" },
};

export default function RoleCard({ myRole }) {
  const meta = ROLE_META[myRole.role] || {};
  return (
    <div className={`role-card ${meta.color || ""}`}>
      <div className="role-emoji">{meta.emoji}</div>
      <div className="role-name">{myRole.role}</div>
      <div className="role-points">{myRole.points} pts</div>
      <div className="role-raja-line">
        👑 Raja is <strong>{myRole.raja.nickname}</strong>
      </div>
    </div>
  );
}
