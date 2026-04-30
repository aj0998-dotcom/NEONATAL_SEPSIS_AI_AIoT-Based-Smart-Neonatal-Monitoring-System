import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import SectionHeader from "../components/SectionHeader.jsx";
import { apiGet } from "../services/api.js";

export default function Insights() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    apiGet("/prediction-summary")
      .then((d) => {
        setSummary(d);
        const data = (d.last_probabilities || []).map((p, i) => ({
          name: d.last_probability_labels?.[i] || `P${i + 1}`,
          probability: +(p * 100).toFixed(2)
        }));
        setRows(data);
      })
      .catch(() => {});
  }, []);

  const note = useMemo(() => {
    if (!rows.length) return "Run a few predictions to populate the trend chart.";
    const last = rows[rows.length - 1]?.probability ?? 0;
    if (last >= 75) return "Recent trend suggests elevated risk; review vitals and consider escalation.";
    if (last >= 40) return "Moderate risk trend; increase monitoring frequency and reassess.";
    return "Low risk trend; continue routine monitoring and repeat checks if vitals change.";
  }, [rows]);

  return (
    <div className="space-y-8">
      <section className="card p-7 md:p-10">
        <SectionHeader
          eyebrow="Insights"
          title="Trend intelligence for monitoring"
          subtitle="Higher risk is often associated with lower APGAR and abnormal vital signs. This page visualizes probability drift over recent predictions."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="card p-6 lg:col-span-2">
            <div className="text-lg font-extrabold text-ink">Recent probability trend</div>
            <p className="muted mt-1 text-sm">Displays last 10 saved probabilities in chronological order.</p>
            <div className="mt-4 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rows}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="probability" stroke="#de6f97" strokeWidth={3} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-6">
            <div className="text-lg font-extrabold text-ink">Interpretation</div>
            <p className="muted mt-2 text-sm">{note}</p>
            <div className="mt-4 rounded-2xl border border-blush-200 bg-blush-50 p-4 text-sm text-muted">
              Practical demo insight:
              <ul className="mt-2 space-y-2">
                <li>Low APGAR + fever + low SpO2 → higher probability.</li>
                <li>Resp distress + tachycardia → risk increases.</li>
                <li>Stable vitals + APGAR ≥ 8 → lower probability.</li>
              </ul>
            </div>
            <div className="mt-4 text-xs font-semibold text-muted">
              Logged samples: {summary?.total_predictions ?? 0}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

