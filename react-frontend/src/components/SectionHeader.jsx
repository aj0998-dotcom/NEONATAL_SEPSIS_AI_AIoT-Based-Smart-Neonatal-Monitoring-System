export default function SectionHeader({ eyebrow, title, subtitle, right }) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow ? <p className="pill">{eyebrow}</p> : null}
        <h2 className="section-title mt-3">{title}</h2>
        {subtitle ? <p className="muted mt-2 max-w-3xl">{subtitle}</p> : null}
      </div>
      {right ? <div className="flex gap-2">{right}</div> : null}
    </div>
  );
}

