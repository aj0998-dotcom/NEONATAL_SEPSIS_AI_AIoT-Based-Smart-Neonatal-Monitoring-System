import { useEffect, useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import { API_BASE, apiGet } from "../services/api.js";

export default function Performance() {
  const [m, setM] = useState(null);
  useEffect(() => {
    apiGet("/metrics")
      .then(setM)
      .catch(() => {});
  }, []);

  const cm = m?.confusion_matrix_counts;
  const cmRows = useMemo(() => {
    if (!cm) return null;
    return [
      { a: "Low Risk", pLow: cm.tn, pHigh: cm.fp },
      { a: "High Risk", pLow: cm.fn, pHigh: cm.tp }
    ];
  }, [cm]);

  return (
    <div className="space-y-8">
      <section className="card p-7 md:p-10">
        <SectionHeader
          eyebrow="Performance"
          title="Transparent model performance for review"
          subtitle="Metrics and evaluation visuals for academic presentation: accuracy, precision, recall, ROC-AUC, confusion matrix, and ROC curve."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-4">
          <StatCard label="Accuracy" value={m ? `${(m.accuracy * 100).toFixed(2)}%` : "-"} />
          <StatCard label="Precision" value={m ? `${(m.precision * 100).toFixed(2)}%` : "-"} />
          <StatCard label="Recall" value={m ? `${(m.recall * 100).toFixed(2)}%` : "-"} />
          <StatCard label="ROC-AUC" value={m ? `${(m.roc_auc * 100).toFixed(2)}%` : "-"} />
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <div className="text-lg font-extrabold text-ink">Confusion Matrix</div>
            <p className="muted mt-1 text-sm">Static image generated during training.</p>
            <img
              className="mt-4 w-full rounded-2xl border border-blush-200 bg-white"
              src={`${API_BASE}/plots/confusion_matrix.png`}
              alt="confusion matrix"
            />
          </div>
          <div className="card p-6">
            <div className="text-lg font-extrabold text-ink">ROC Curve</div>
            <p className="muted mt-1 text-sm">Shows sensitivity vs specificity trade-off.</p>
            <img
              className="mt-4 w-full rounded-2xl border border-blush-200 bg-white"
              src={`${API_BASE}/plots/roc_curve.png`}
              alt="roc curve"
            />
          </div>
        </div>

        <div className="mt-7 card p-6">
          <div className="text-lg font-extrabold text-ink">Confusion matrix counts</div>
          <p className="muted mt-1 text-sm">Counts used by the model evaluation on the test split.</p>
          <div className="mt-4 overflow-auto rounded-2xl border border-blush-200 bg-white/70">
            <table className="w-full text-left text-sm">
              <thead className="bg-blush-50 text-xs font-extrabold uppercase tracking-wider text-muted">
                <tr>
                  <th className="p-3">Actual \\ Predicted</th>
                  <th className="p-3">Low Risk</th>
                  <th className="p-3">High Risk</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {cmRows ? (
                  cmRows.map((r) => (
                    <tr key={r.a} className="border-t border-blush-200/60">
                      <td className="p-3 font-extrabold text-ink">{r.a}</td>
                      <td className="p-3">{r.pLow}</td>
                      <td className="p-3">{r.pHigh}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-3" colSpan={3}>
                      Loading...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

