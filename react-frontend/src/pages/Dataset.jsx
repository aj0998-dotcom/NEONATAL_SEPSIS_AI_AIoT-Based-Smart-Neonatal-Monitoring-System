import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import SectionHeader from "../components/SectionHeader.jsx";
import { apiGet } from "../services/api.js";

function toHistSeries(hist) {
  if (!hist?.labels?.length) return [];
  return hist.labels.map((label, idx) => ({ label, count: hist.counts?.[idx] ?? 0 }));
}

export default function Dataset() {
  const [analytics, setAnalytics] = useState(null);
  const [preview, setPreview] = useState({ columns: [], rows: [] });
  const [err, setErr] = useState("");

  useEffect(() => {
    Promise.all([apiGet("/dataset-analytics"), apiGet("/dataset-preview?limit=12")])
      .then(([a, p]) => {
        setAnalytics(a);
        setPreview(p);
      })
      .catch((e) => setErr(e.message));
  }, []);

  const apgar = useMemo(() => toHistSeries(analytics?.feature_histograms?.Apgar), [analytics]);
  const temp = useMemo(() => toHistSeries(analytics?.feature_histograms?.Temperature), [analytics]);
  const oxygen = useMemo(() => toHistSeries(analytics?.feature_histograms?.OxygenLevel), [analytics]);

  return (
    <div className="space-y-8">
      <section className="card p-7 md:p-10">
        <SectionHeader
          eyebrow="Dataset"
          title="Dataset analytics and preview"
          subtitle="This page describes the features used by the model and visualizes training distributions."
        />

        <div className="mt-7 grid gap-6 lg:grid-cols-3">
          <div className="card p-6 lg:col-span-2">
            <div className="text-lg font-extrabold text-ink">Dataset description</div>
            <p className="muted mt-2 text-sm">
              The model uses a simplified vital-sign feature set designed for classroom demonstration:
              <span className="font-extrabold text-ink"> APGAR, HeartRate, Temperature, RespRate, OxygenLevel</span>.
            </p>
            <p className="muted mt-2 text-sm">
              These distributions help validate that values fall in realistic neonatal ranges and support the
              monitoring narrative in an AIoT dashboard.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {[
                "APGAR score (0–10): quick post-birth assessment summary.",
                "Heart rate, respiratory rate: indicators of distress or infection response.",
                "Temperature: fever/hypothermia signals.",
                "SpO2 (oxygen level): hypoxia risk indicator."
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-blush-400" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-blush-200 bg-gradient-to-b from-white to-blush-50 p-6">
            <div className="text-sm font-semibold text-muted">Total training samples</div>
            <div className="mt-2 text-4xl font-black tracking-tight text-ink">
              {analytics?.sample_count ?? "-"}
            </div>
            <p className="muted mt-2 text-sm">
              The preview table below shows the first few rows of the training dataset used by the model.
            </p>
            {err ? <div className="mt-3 text-sm font-semibold text-danger">{err}</div> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          ["APGAR distribution", apgar, "#de6f97"],
          ["Temperature distribution", temp, "#c85a86"],
          ["Oxygen distribution", oxygen, "#7fb0ff"]
        ].map(([title, data, color]) => (
          <div key={title} className="card p-6">
            <div className="text-lg font-extrabold text-ink">{title}</div>
            <p className="muted mt-1 text-sm">Histogram from training dataset.</p>
            <div className="mt-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill={color} radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </section>

      <section className="card p-6">
        <div className="text-lg font-extrabold text-ink">Dataset preview</div>
        <p className="muted mt-1 text-sm">First rows from `backend/dataset.csv` served via API.</p>
        <div className="mt-4 overflow-auto rounded-2xl border border-blush-200 bg-white/70">
          <table className="w-full text-left text-sm">
            <thead className="bg-blush-50 text-xs font-extrabold uppercase tracking-wider text-muted">
              <tr>
                {preview.columns.map((c) => (
                  <th key={c} className="p-3">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-muted">
              {preview.rows.map((r, i) => (
                <tr key={i} className="border-t border-blush-200/60">
                  {preview.columns.map((c) => (
                    <td key={`${i}-${c}`} className="p-3 whitespace-nowrap">
                      {String(r[c])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

