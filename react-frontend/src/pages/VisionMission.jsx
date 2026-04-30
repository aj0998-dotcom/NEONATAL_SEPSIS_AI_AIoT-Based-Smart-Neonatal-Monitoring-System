import SectionHeader from "../components/SectionHeader.jsx";

export default function VisionMission() {
  return (
    <div className="space-y-8">
      <section className="card p-7 md:p-10">
        <SectionHeader
          eyebrow="Vision & Mission"
          title="Healthcare innovation for safer newborn outcomes"
          subtitle="A content-rich statement of purpose for academic review and a product-style experience."
        />
        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-blush-200 bg-gradient-to-b from-white to-blush-50 p-7">
            <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-blush-600">Vision</div>
            <div className="mt-3 text-2xl font-black tracking-tight text-ink">
              To reduce neonatal mortality using AI-driven early detection systems.
            </div>
            <p className="muted mt-3">
              We aim to provide faster interpretation of vital signs, support earlier clinical review, and
              promote accessible, affordable AIoT healthcare tools.
            </p>
          </div>

          <div className="rounded-3xl border border-blush-200 bg-white/70 p-7">
            <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-blush-600">Mission</div>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              {[
                "Build real-time monitoring experiences (IoT simulation) that feel like NICU dashboards.",
                "Assist doctors with interpretable AI predictions and risk classification.",
                "Track trends and history to improve continuity of monitoring.",
                "Use Generative-AI-style explanations to present guidance clearly for faster decisions."
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-blush-400" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          [
            "Clinical impact",
            "Improve early screening so neonates at risk are reviewed sooner."
          ],
          [
            "Technical innovation",
            "Combine AIoT monitoring concepts with ML and explainable guidance."
          ],
          [
            "Deployment mindset",
            "Deliver a hosting-ready, modular web app for demos and presentation."
          ]
        ].map(([t, d]) => (
          <div key={t} className="card p-6">
            <div className="text-lg font-extrabold text-ink">{t}</div>
            <p className="muted mt-2 text-sm">{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

