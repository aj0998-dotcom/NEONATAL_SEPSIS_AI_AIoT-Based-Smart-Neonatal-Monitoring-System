import SectionHeader from "../components/SectionHeader.jsx";

export default function About() {
  return (
    <div className="space-y-8">
      <section className="card p-7 md:p-10">
        <SectionHeader
          eyebrow="About Project"
          title="What is Neonatal Sepsis?"
          subtitle="Neonatal sepsis is a serious bloodstream infection in newborns. It can progress rapidly and may be fatal if not detected early."
        />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-extrabold text-ink">Why early detection is difficult</h3>
            <p className="muted mt-2">
              Early symptoms (poor feeding, lethargy, temperature instability, breathing changes) are
              often nonspecific. This can lead to delayed recognition—especially in busy NICU settings.
            </p>
            <p className="muted mt-3">
              Our goal is to provide an easy-to-read risk estimate using common measurable signals
              so clinicians can triage faster and monitor high-risk neonates more closely.
            </p>
          </div>
          <div className="rounded-3xl border border-blush-200 bg-gradient-to-b from-white to-blush-50 p-6">
            <div className="text-sm font-semibold text-muted">Key idea</div>
            <div className="mt-2 text-xl font-black tracking-tight text-ink">
              Combine multiple vitals into one clear risk output.
            </div>
            <p className="muted mt-3 text-sm">
              Vital signs + APGAR → ML probability → Risk class → EOS/LOS → Explanation.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-7">
          <SectionHeader
            eyebrow="Types"
            title="EOS vs LOS"
            subtitle="Sepsis is often categorized by time since birth."
          />
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-blush-200 bg-white/70 p-5">
              <div className="text-base font-extrabold text-ink">Early-Onset Sepsis (EOS)</div>
              <p className="muted mt-1 text-sm">
                Typically occurs within the first 72 hours of life. Often linked to maternal risk factors
                and perinatal exposure.
              </p>
            </div>
            <div className="rounded-2xl border border-blush-200 bg-white/70 p-5">
              <div className="text-base font-extrabold text-ink">Late-Onset Sepsis (LOS)</div>
              <p className="muted mt-1 text-sm">
                Occurs after 72 hours. May be associated with hospital-acquired infections, invasive lines,
                or prolonged NICU stay.
              </p>
            </div>
          </div>
        </div>

        <div className="card p-7">
          <SectionHeader
            eyebrow="Why AI"
            title="Why AI is needed in neonatal monitoring"
            subtitle="AI helps synthesize multiple measurements, reduce cognitive load, and surface patterns that are hard to see at the bedside."
          />
          <ul className="mt-6 space-y-3 text-sm text-muted">
            {[
              "Signals are noisy and can change quickly; models can track trends consistently.",
              "Risk estimation helps prioritize monitoring and early clinical review.",
              "Clear explanations improve usability and demo readiness for project evaluation."
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-blush-400" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

