import { ArrowRight, Brain, Database, Radar, Sparkles, Stethoscope } from "lucide-react";
import SectionHeader from "../components/SectionHeader.jsx";

function Step({ icon: Icon, title, text }) {
  return (
    <div className="card p-6">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-400 text-white shadow">
          <Icon size={20} />
        </div>
        <div>
          <div className="text-lg font-extrabold text-ink">{title}</div>
          <div className="muted mt-1 text-sm">{text}</div>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <div className="space-y-8">
      <section className="card p-7 md:p-10">
        <SectionHeader
          eyebrow="How it Works"
          title="Sensors → Data → ML → Prediction → GenAI Explanation"
          subtitle="A step-by-step flow designed for presentations and product-style understanding."
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-5">
          <Step
            icon={Radar}
            title="1) Sensor Data Collection"
            text="Vitals are captured (HR, SpO2, Temp, Resp Rate, APGAR, hours)."
          />
          <div className="hidden lg:grid place-items-center text-blush-400">
            <ArrowRight />
          </div>
          <Step
            icon={Database}
            title="2) Data Processing"
            text="Validation, normalization, and formatting to match the trained model inputs."
          />
          <div className="hidden lg:grid place-items-center text-blush-400">
            <ArrowRight />
          </div>
          <Step
            icon={Brain}
            title="3) ML Prediction"
            text="CatBoost estimates sepsis probability based on vitals and APGAR patterns."
          />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Step
            icon={Stethoscope}
            title="4) Risk Classification"
            text="Probability is mapped to Low / Medium / High with clear color-coded output."
          />
          <Step
            icon={Sparkles}
            title="5) Generative AI Explanation"
            text="A short, readable guidance message explains risk and suggests next actions."
          />
          <div className="card p-6">
            <div className="text-lg font-extrabold text-ink">Outcome</div>
            <p className="muted mt-2 text-sm">
              A single screen shows risk, EOS/LOS type, probability, and explanation—plus the history
              is logged for dashboards.
            </p>
            <div className="mt-4 rounded-2xl border border-blush-200 bg-white/70 p-4 text-sm text-muted">
              This flow is designed for classroom demos and a hosting-ready product feel.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

