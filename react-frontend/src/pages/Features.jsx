import {
  Activity,
  Brain,
  Clock,
  HeartPulse,
  MessagesSquare,
  ShieldCheck,
  Thermometer,
  Waves
} from "lucide-react";
import FeatureCard from "../components/FeatureCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

const items = [
  {
    icon: Activity,
    title: "Real-Time Monitoring (AIoT simulation)",
    text: "A dashboard-like experience that reflects how NICU vitals could be streamed and validated.",
    bullets: ["Simulated sensor readings", "Smooth UI updates", "Trend-friendly visual layout"]
  },
  {
    icon: HeartPulse,
    title: "APGAR Score Integration",
    text: "APGAR provides immediate post-birth assessment context to improve early risk screening.",
    bullets: ["0–10 score support", "Easy form entry", "Used alongside vitals"]
  },
  {
    icon: Brain,
    title: "Sepsis Risk Prediction (Low / Medium / High)",
    text: "Probability-based classification with color-coded interpretation for fast understanding.",
    bullets: ["Risk probability (%)", "Threshold-based categories", "Clear on-screen badge"]
  },
  {
    icon: Clock,
    title: "EOS vs LOS Classification",
    text: "Sepsis type is determined using hours since birth to align with clinical categories.",
    bullets: ["EOS ≤ 72 hours", "LOS > 72 hours", "Shown in the output summary"]
  },
  {
    icon: MessagesSquare,
    title: "Generative AI Explanation",
    text: "A short clinical-style explanation helps interpret the result and suggests next steps.",
    bullets: ["Readable guidance", "Highlight key vitals", "Presentation-ready messaging"]
  },
  {
    icon: ShieldCheck,
    title: "Clinical Decision Support (demo-style)",
    text: "Combines risk, type, and guidance to support triage, monitoring, and escalation workflow demos.",
    bullets: ["Risk panel", "History logging", "Performance transparency"]
  },
  {
    icon: Thermometer,
    title: "Vitals validation",
    text: "Input ranges enforce realistic neonatal values to reduce user error during demo.",
    bullets: ["Temperature, SpO2, HR", "Respiratory rate", "APGAR limits"]
  },
  {
    icon: Waves,
    title: "Insights and trends",
    text: "Charts display probability drift and distribution to demonstrate monitoring intelligence.",
    bullets: ["Trend charts", "Distribution charts", "Easy explanation text"]
  }
];

export default function Features() {
  return (
    <div className="space-y-8">
      <section className="card p-7 md:p-10">
        <SectionHeader
          eyebrow="Features"
          title="What makes NeoCare AI feel like a real product"
          subtitle="Content-rich feature cards with icons, clinical relevance, and demo-ready benefits."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {items.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>
    </div>
  );
}

