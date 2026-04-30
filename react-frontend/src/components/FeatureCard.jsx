export default function FeatureCard({ icon: Icon, title, text, bullets = [] }) {
  return (
    <div className="card group p-6 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blush-500 to-blush-300 text-white shadow">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-ink">{title}</h3>
          <p className="muted mt-1">{text}</p>
        </div>
      </div>
      {bullets.length ? (
        <ul className="mt-4 space-y-2 text-sm text-muted">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blush-400" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

