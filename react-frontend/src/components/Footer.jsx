export default function Footer() {
  return (
    <footer className="mt-12 border-t border-blush-200/60 bg-white/60">
      <div className="container-app flex flex-col items-start justify-between gap-4 py-8 md:flex-row md:items-center">
        <div>
          <div className="font-extrabold text-ink">NeoCare AI</div>
          <div className="text-sm font-semibold text-muted">AIoT Mini Project • 2026</div>
        </div>
        <div className="text-sm font-semibold text-muted">
          Your Name • Your College Name
        </div>
      </div>
    </footer>
  );
}

