import { useEffect, useState } from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import { apiGet } from "../services/api.js";

function RiskChip({ result }) {
  const high = String(result || "").toLowerCase().includes("high");
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold ${
        high ? "border-red-200 bg-red-50 text-danger" : "border-emerald-200 bg-emerald-50 text-success"
      }`}
    >
      {result}
    </span>
  );
}

export default function History() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    apiGet("/predictions")
      .then(setRows)
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <div className="space-y-8">
      <section className="card p-7 md:p-10">
        <SectionHeader
          eyebrow="History"
          title="Past predictions (logged)"
          subtitle="Saved predictions with timestamps enable dashboard trend analysis and monitoring continuity."
        />

        {err ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger">
            {err}
          </div>
        ) : null}

        <div className="mt-8 overflow-auto rounded-2xl border border-blush-200 bg-white/70">
          <table className="w-full text-left text-sm">
            <thead className="bg-blush-50 text-xs font-extrabold uppercase tracking-wider text-muted">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">APGAR</th>
                <th className="p-3">Heart Rate</th>
                <th className="p-3">Temp</th>
                <th className="p-3">Resp</th>
                <th className="p-3">SpO2</th>
                <th className="p-3">Risk</th>
                <th className="p-3">Probability</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {rows.length ? (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-blush-200/60">
                    <td className="p-3 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-3">{Number(r.apgar).toFixed(1)}</td>
                    <td className="p-3">{Number(r.heart_rate).toFixed(1)}</td>
                    <td className="p-3">{Number(r.temperature).toFixed(1)}</td>
                    <td className="p-3">{Number(r.resp_rate).toFixed(1)}</td>
                    <td className="p-3">{Number(r.oxygen_level).toFixed(1)}</td>
                    <td className="p-3">
                      <RiskChip result={r.result} />
                    </td>
                    <td className="p-3">{(Number(r.sepsis_probability) * 100).toFixed(2)}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-4">
                    No predictions yet. Go to the Predict page and run a few samples.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

