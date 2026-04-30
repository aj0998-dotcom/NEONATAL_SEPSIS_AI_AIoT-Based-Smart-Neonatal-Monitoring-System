import { ArrowRight, BarChart3, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeader from "../components/SectionHeader.jsx";

function IconPill({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-blush-200 bg-white/70 px-3 py-1 text-xs font-semibold text-muted">
      <Icon size={14} className="text-blush-500" />
      <span>{text}</span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="card overflow-hidden">
        <div className="grid gap-8 p-7 md:grid-cols-2 md:p-10">
          <div className="space-y-5">
            <p className="pill">
              <Sparkles size={14} className="text-blush-500" />
              Hosting-ready healthcare UI
            </p>
            <h1 className="font-serif text-4xl font-black leading-[1.05] tracking-tight text-ink md:text-5xl">
              AIoT-Based Smart Neonatal Monitoring System
            </h1>
            <p className="muted text-base md:text-lg">
              Early detection of Neonatal Sepsis using Vital Signs, APGAR Score, and Generative AI.
              Built to look like a real NICU decision-support product.
            </p>

            <div className="flex flex-wrap gap-2">
              <IconPill icon={HeartPulse} text="Vitals + APGAR inputs" />
              <IconPill icon={ShieldCheck} text="Risk classification (Low/Med/High)" />
              <IconPill icon={BarChart3} text="Trends, charts, performance" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/predict" className="btn-primary">
                Predict Now <ArrowRight size={16} />
              </Link>
              <Link to="/dashboard" className="btn-secondary">
                Explore Dashboard
              </Link>
            </div>

            <p className="text-xs font-semibold text-muted">
              Educational demo only. Not a medical device or diagnostic tool.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blush-200/60 blur-3xl" />
            <div className="absolute -bottom-20 -left-24 h-64 w-64 rounded-full bg-sky-100/70 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-blush-200 bg-white/70 p-2 shadow-soft">
              <img
                className="h-[360px] w-full rounded-[22px] object-cover md:h-[440px]"
                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80"
                alt="NICU healthcare environment"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-7 md:p-8">
          <SectionHeader
            eyebrow="Problem"
            title="Neonatal sepsis is fast, subtle, and dangerous."
            subtitle="Early symptoms are not easily identifiable and can resemble normal post-birth adjustments. This can delay diagnosis and increase complications."
          />
          <div className="mt-6 space-y-3 text-sm text-muted">
            <p>
              In NICU workflows, clinicians must triage quickly even when information is incomplete.
              A small delay can lead to rapid deterioration.
            </p>
            <p>
              The challenge is to combine multiple signals—APGAR, temperature, oxygen, heart rate,
              respiratory rate—into a single clear risk view.
            </p>
          </div>
        </div>

        <div className="card p-7 md:p-8">
          <SectionHeader
            eyebrow="Solution"
            title="AIoT + ML + GenAI for earlier, clearer action."
            subtitle="Our system simulates real-time sensor monitoring, runs ML-based risk prediction, and generates a short clinical-style explanation to help interpret results."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["AIoT Monitoring", "Vitals stream + validation"],
              ["ML Prediction", "CatBoost risk probability"],
              ["EOS / LOS", "Onset classification by hours"],
              ["GenAI Guidance", "Readable summary actions"]
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-blush-200 bg-white/70 p-4">
                <div className="font-extrabold text-ink">{t}</div>
                <div className="mt-1 text-sm text-muted">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

