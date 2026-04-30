import { Bot, Brain, Cpu, Database, Radio, Server, Sparkles } from "lucide-react";
import FeatureCard from "../components/FeatureCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

const stack = [
  {
    icon: Cpu,
    title: "React (Frontend)",
    text: "Hosting-ready UI with routing, reusable components, charts, and a soft medical theme.",
    bullets: ["Responsive layout", "Modern navigation", "Card-based dashboard"]
  },
  {
    icon: Server,
    title: "Backend API (Flask / FastAPI style)",
    text: "REST endpoints for prediction, metrics, history, dataset analytics and preview.",
    bullets: ["/generate-alert", "/metrics", "/predictions", "/dataset-analytics"]
  },
  {
    icon: Brain,
    title: "Machine Learning",
    text: "CatBoost model performs risk prediction with transparent evaluation artifacts.",
    bullets: ["Accuracy/Precision/Recall", "ROC-AUC", "Confusion Matrix"]
  },
  {
    icon: Sparkles,
    title: "Generative AI (Explanation Layer)",
    text: "Produces a short clinical-style guidance message for fast interpretation.",
    bullets: ["Readable output", "Presentation-ready", "Risk-aligned messaging"]
  },
  {
    icon: Radio,
    title: "AIoT Sensors Simulation",
    text: "Demonstrates how vital-sign monitoring could feed into an AI prediction pipeline.",
    bullets: ["Vitals input mapping", "Trend charts", "Monitoring narrative"]
  }
];

export default function TechStack() {
  return (
    <div className="space-y-8">
      <section className="card p-7 md:p-10">
        <SectionHeader
          eyebrow="Tech Stack"
          title="Built like a real healthcare AI product"
          subtitle="A clear, review-friendly view of the technologies powering NeoCare AI."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {stack.map((s) => (
            <FeatureCard key={s.title} {...s} />
          ))}
        </div>
        <div className="mt-7 grid gap-6 lg:grid-cols-3">
          {[
            { icon: Database, title: "SQLite logging", text: "Stores prediction history for monitoring continuity." },
            { icon: Bot, title: "Explainability UX", text: "Human-first messaging that improves usability in demos." },
            { icon: Cpu, title: "Deployment-ready", text: "Runs via `npm install` + `npm start` with clean routes." }
          ].map((c) => (
            <div key={c.title} className="card p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blush-100 text-blush-600">
                  <c.icon size={18} />
                </div>
                <div className="text-base font-extrabold text-ink">{c.title}</div>
              </div>
              <p className="muted mt-2 text-sm">{c.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

