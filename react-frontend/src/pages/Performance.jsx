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
  const cmTable = useMemo(() => {
    if (!cm?.labels?.length || !Array.isArray(cm.matrix)) return null;
    const labels = cm.labels;
    const matrix = cm.matrix;
    if (!Array.isArray(matrix) || matrix.length !== labels.length) return null;
    return { labels, matrix };
  }, [cm]);

  const comparison = Array.isArray(m?.cv_accuracy_comparison) ? m.cv_accuracy_comparison : [];

  return (
    <div className="space-y-8">
      <section className="card p-7 md:p-10">
        <SectionHeader
          eyebrow="Performance"
          title="Transparent model performance for review"
          subtitle="Metrics and evaluation visuals for academic presentation: accuracy, precision, recall, F1, cross-validation, confusion matrix, and feature importance."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-4">
          <StatCard label="Accuracy" value={m ? `${(m.accuracy * 100).toFixed(2)}%` : "-"} />
          <StatCard label="Precision" value={m ? `${(m.precision * 100).toFixed(2)}%` : "-"} />
          <StatCard label="Recall" value={m ? `${(m.recall * 100).toFixed(2)}%` : "-"} />
          <StatCard
            label="F1 (Macro)"
            value={m?.f1_score != null ? `${(m.f1_score * 100).toFixed(2)}%` : "-"}
          />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-4">
          <StatCard
            label="F1 (Weighted)"
            value={m?.f1_weighted != null ? `${(m.f1_weighted * 100).toFixed(2)}%` : "-"}
          />
          <StatCard
            label="CV Accuracy (mean)"
            value={m?.cv_accuracy_mean != null ? `${(m.cv_accuracy_mean * 100).toFixed(2)}%` : "-"}
          />
          <StatCard
            label="CV F1 Macro (mean)"
            value={m?.cv_f1_macro_mean != null ? `${(m.cv_f1_macro_mean * 100).toFixed(2)}%` : "-"}
          />
          <StatCard
            label="CV Folds"
            value={m?.cv_folds != null ? `${m.cv_folds}` : "-"}
          />
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          <div className="card p-6 lg:col-span-2">
            <div className="text-lg font-extrabold text-ink">All Performance (Overview)</div>
            <p className="muted mt-1 text-sm">
              One composite figure for reports/slides (CV comparison, confusion matrix, feature importance, and key metrics).
            </p>
            {m?.performance_overview_url ? (
              <img
                className="mt-4 w-full rounded-2xl border border-blush-200 bg-white"
                src={`${API_BASE}${m.performance_overview_url}`}
                alt="performance overview"
              />
            ) : (
              <div className="mt-4 rounded-2xl border border-blush-200 bg-white/70 p-4 text-sm text-muted">
                Overview image not available.
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="text-lg font-extrabold text-ink">Confusion Matrix</div>
            <p className="muted mt-1 text-sm">Static image generated during training.</p>
            <img
              className="mt-4 w-full rounded-2xl border border-blush-200 bg-white"
              src={m?.confusion_matrix_url ? `${API_BASE}${m.confusion_matrix_url}` : `${API_BASE}/plots/confusion_matrix.png`}
              alt="confusion matrix"
            />
          </div>
          <div className="card p-6">
            <div className="text-lg font-extrabold text-ink">Feature Importance (CatBoost)</div>
            <p className="muted mt-1 text-sm">Bar chart generated from CatBoost feature importances.</p>
            {m?.feature_importance_url ? (
              <img
                className="mt-4 w-full rounded-2xl border border-blush-200 bg-white"
                src={`${API_BASE}${m.feature_importance_url}`}
                alt="feature importance"
              />
            ) : (
              <div className="mt-4 rounded-2xl border border-blush-200 bg-white/70 p-4 text-sm text-muted">
                Feature importance chart not available.
              </div>
            )}
          </div>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <div className="text-lg font-extrabold text-ink">Cross-Validation Accuracy Comparison</div>
            <p className="muted mt-1 text-sm">
              5-fold cross-validation (mean ± std). Use this for your comparison table/figure.
            </p>
            {m?.cv_accuracy_comparison_url ? (
              <img
                className="mt-4 w-full rounded-2xl border border-blush-200 bg-white"
                src={`${API_BASE}${m.cv_accuracy_comparison_url}`}
                alt="cv accuracy comparison"
              />
            ) : null}
            <div className="mt-4 overflow-auto rounded-2xl border border-blush-200 bg-white/70">
              <table className="w-full text-left text-sm">
                <thead className="bg-blush-50 text-xs font-extrabold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="p-3">Model</th>
                    <th className="p-3">Accuracy</th>
                    <th className="p-3">F1 (Macro)</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  {comparison.length ? (
                    comparison.map((r) => (
                      <tr key={r.model} className="border-t border-blush-200/60">
                        <td className="p-3 font-extrabold text-ink">{r.model}</td>
                        <td className="p-3">
                          {(r.accuracy_mean * 100).toFixed(2)}% ± {(r.accuracy_std * 100).toFixed(2)}%
                        </td>
                        <td className="p-3">
                          {(r.f1_macro_mean * 100).toFixed(2)}% ± {(r.f1_macro_std * 100).toFixed(2)}%
                        </td>
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
            {m?.cv_accuracy_comparison_error ? (
              <div className="mt-3 text-xs text-rose-700">
                CV comparison error: {m.cv_accuracy_comparison_error}
              </div>
            ) : null}
          </div>

          <div className="card p-6">
            <div className="text-lg font-extrabold text-ink">Confusion Matrix Counts</div>
            <p className="muted mt-1 text-sm">Multiclass counts used by evaluation on the test split.</p>
          <div className="mt-4 overflow-auto rounded-2xl border border-blush-200 bg-white/70">
            <table className="w-full text-left text-sm">
              <thead className="bg-blush-50 text-xs font-extrabold uppercase tracking-wider text-muted">
                <tr>
                  <th className="p-3">Actual \\ Predicted</th>
                  {cmTable?.labels?.map((lab) => (
                    <th key={lab} className="p-3">
                      {lab}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-muted">
                {cmTable ? (
                  cmTable.matrix.map((row, i) => (
                    <tr key={cmTable.labels[i]} className="border-t border-blush-200/60">
                      <td className="p-3 font-extrabold text-ink">{cmTable.labels[i]}</td>
                      {row.map((cell, j) => (
                        <td key={`${i}-${j}`} className="p-3">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-3" colSpan={4}>
                      Loading...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </section>
    </div>
  );
}

