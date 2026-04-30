import { useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock, Sparkles } from "lucide-react";
import SectionHeader from "../components/SectionHeader.jsx";
import { apiPost } from "../services/api.js";

const initial = {
  HeartRate: "140",
  OxygenLevel: "98",
  Temperature: "36.8",
  RespRate: "42",
  Apgar: "8",
  HoursSinceBirth: "12"
};

function RiskBadge({ level }) {
  const map = {
    High: "bg-red-50 border-red-200 text-danger",
    Medium: "bg-yellow-50 border-yellow-200 text-warning",
    Low: "bg-emerald-50 border-emerald-200 text-success"
  };
  const cls = map[level] || "bg-white border-blush-200 text-muted";
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${cls}`}>{level}</span>;
}

export default function Predict() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const sepsisType = useMemo(() => {
    const hours = Number(form.HoursSinceBirth || 0);
    return hours <= 72 ? "EOS (Early-Onset Sepsis)" : "LOS (Late-Onset Sepsis)";
  }, [form.HoursSinceBirth]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const payload = {
        HeartRate: Number(form.HeartRate),
        OxygenLevel: Number(form.OxygenLevel),
        Temperature: Number(form.Temperature),
        RespRate: Number(form.RespRate),
        Apgar: Number(form.Apgar)
      };
      const data = await apiPost("/generate-alert", payload);
      setResult({ ...data, sepsisType });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const riskIcon =
    result?.alert_level === "High" ? (
      <AlertTriangle className="text-danger" size={18} />
    ) : result?.alert_level === "Medium" ? (
      <Activity className="text-warning" size={18} />
    ) : (
      <CheckCircle2 className="text-success" size={18} />
    );

  return (
    <div className="space-y-8">
      <section className="card p-7 md:p-10">
        <SectionHeader
          eyebrow="Prediction Console"
          title="Predict neonatal sepsis risk from vital signs + APGAR"
          subtitle="Enter vitals, specify hours since birth, and get risk level, EOS/LOS type, probability, and Generative-AI-style explanation."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <form onSubmit={onSubmit} className="rounded-3xl border border-blush-200 bg-white/70 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["HeartRate", "Heart Rate (bpm)", "60–220"],
                ["OxygenLevel", "SpO2 (%)", "40–100"],
                ["Temperature", "Temperature (°C)", "30–43"],
                ["RespRate", "Respiratory Rate (/min)", "10–120"],
                ["Apgar", "APGAR Score", "0–10"],
                ["HoursSinceBirth", "Hours Since Birth", "0+ (EOS ≤ 72h)"]
              ].map(([name, label, hint]) => (
                <label key={name} className="block">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-ink">{label}</span>
                    <span className="text-xs font-semibold text-muted">{hint}</span>
                  </div>
                  <input
                    className="mt-2 w-full rounded-2xl border border-blush-200 bg-white px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:border-blush-400 focus:ring-4 focus:ring-blush-100"
                    name={name}
                    value={form[name]}
                    onChange={onChange}
                    inputMode="decimal"
                    required
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button disabled={loading} className="btn-primary w-full sm:w-auto">
                {loading ? "Predicting..." : "Predict Now"}
              </button>
              <button
                type="button"
                className="btn-secondary w-full sm:w-auto"
                onClick={() =>
                  setForm({
                    HeartRate: "176",
                    OxygenLevel: "85",
                    Temperature: "38.9",
                    RespRate: "70",
                    Apgar: "5",
                    HoursSinceBirth: "24"
                  })
                }
              >
                Load High-risk sample
              </button>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger">
                {error}
              </div>
            ) : null}
          </form>

          <div className="rounded-3xl border border-blush-200 bg-white/70 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="pill">
                  <Sparkles size={14} className="text-blush-500" />
                  Output
                </div>
                <div className="mt-3 text-2xl font-black tracking-tight text-ink">
                  {result ? result.result : "No prediction yet"}
                </div>
                <p className="muted mt-2 text-sm">
                  Risk, onset type, probability, and a readable explanation appear here after prediction.
                </p>
              </div>
              {result ? <RiskBadge level={result.alert_level || "Low"} /> : null}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="card p-5">
                <div className="text-sm font-semibold text-muted">Sepsis type</div>
                <div className="mt-2 text-sm font-extrabold text-ink">{sepsisType}</div>
                <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-muted">
                  <Clock size={14} /> From hours since birth
                </div>
              </div>
              <div className="card p-5">
                <div className="text-sm font-semibold text-muted">Probability</div>
                <div className="mt-2 text-2xl font-black text-ink">
                  {result ? `${(result.sepsis_probability * 100).toFixed(2)}%` : "-"}
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-blush-100">
                  <div
                    className="h-full bg-gradient-to-r from-blush-500 to-blush-300"
                    style={{ width: `${result ? Math.max(3, result.sepsis_probability * 100) : 0}%` }}
                  />
                </div>
              </div>
              <div className="card p-5">
                <div className="text-sm font-semibold text-muted">Risk class</div>
                <div className="mt-2 flex items-center gap-2 text-sm font-extrabold text-ink">
                  {result ? riskIcon : null}
                  {result ? (result.alert_level || "Low") : "-"}
                </div>
                <div className="muted mt-2 text-xs">Low &lt; 0.40 • Medium 0.40–0.75 • High &gt; 0.75</div>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-blush-200 bg-blush-50 p-5">
              <div className="flex items-center gap-2 text-sm font-extrabold text-ink">
                <Sparkles size={16} className="text-blush-500" />
                Generative AI Explanation
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {result?.alert_message ||
                  "Run a prediction to generate a short clinical-style guidance message based on the output probability and vitals."}
              </p>
              <p className="mt-3 text-xs font-semibold text-muted">
                This is an educational demo output. Always consult clinical guidelines.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

