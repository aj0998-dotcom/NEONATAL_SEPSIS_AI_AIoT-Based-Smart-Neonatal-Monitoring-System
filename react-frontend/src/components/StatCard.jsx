export default function StatCard({ label, value, hint, tone = "default" }) {
  const tones = {
    default: "from-white to-blush-50",
    danger: "from-white to-blush-100",
    info: "from-white to-sky-50"
  };

  return (
    <div className={`card bg-gradient-to-b ${tones[tone] || tones.default} p-5`}>
      <div className="text-sm font-semibold text-muted">{label}</div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight text-ink">{value}</div>
      {hint ? <div className="mt-2 text-sm text-muted">{hint}</div> : null}
    </div>
  );
}

