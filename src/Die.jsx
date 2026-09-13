const PIP_LAYOUTS = {
  1: ["c"],
  2: ["tl", "br"],
  3: ["tl", "c", "br"],
  4: ["tl", "tr", "bl", "br"],
  5: ["tl", "tr", "c", "bl", "br"],
  6: ["tl", "tr", "ml", "mr", "bl", "br"],
};

export default function Die({ value, held, disabled, rolling, onToggle, index }) {
  const pips = PIP_LAYOUTS[value] || [];

  return (
    <button
      type="button"
      className={`die${held ? " die--held" : ""}${rolling ? " die--rolling" : ""}`}
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={held}
      aria-label={`Die ${index + 1}, showing ${value}${held ? ", held" : ""}`}
      style={{ animationDelay: rolling ? `${index * 40}ms` : "0ms" }}
    >
      <span className="die__face">
        {pips.map((pos, i) => (
          <span className={`pip pip--${pos}`} key={i} />
        ))}
      </span>
      {held && <span className="die__held-tag">held</span>}
    </button>
  );
}
