import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import SectionHeader from "../components/SectionHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import { apiGet } from "../services/api.js";

function toHistSeries(hist) {
  if (!hist?.labels?.length) return [];
  return hist.labels.map((label, idx) => ({ label, count: hist.counts?.[idx] ?? 0 }));
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [dataset, setDataset] = useState(null);

  useEffect(() => {
    Promise.all([apiGet("/prediction-summary"), apiGet("/predictions"), apiGet("/dataset-analytics")])
      .then(([s, h, d]) => {
        setSummary(s);
        setHistory(h);
        setDataset(d);
      })
      .catch(() => {});
  }, []);

  const highRiskPct = useMemo(() => {
    const total = summary?.total_predictions || 0;
    const high = summary?.high_risk_count || 0;
    return total ? `${((high / total) * 100).toFixed(1)}%` : "0%";
  }, [summary]);

  const avgApgar = useMemo(() => {
    if (!history.length) return "-";
    const avg = history.reduce((acc, r) => acc + Number(r.apgar || 0), 0) / history.length;
    return avg.toFixed(2);
  }, [history]);

  const distData = [
    { name: "High Risk", value: summary?.high_risk_count || 0 },
    { name: "Low Risk", value: summary?.low_risk_count || 0 }
  ];

  const apgarHist = toHistSeries(dataset?.feature_histograms?.Apgar);
  const hrHist = toHistSeries(dataset?.feature_histograms?.HeartRate);

  return (
    <div className="space-y-8">
      <section className="card p-7 md:p-10">
        <SectionHeader
          eyebrow="Dashboard"
          title="Clinical-style overview for monitoring & analytics"
          subtitle="Summary cards and charts to demonstrate real-time monitoring concepts, dataset behavior, and prediction distribution."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <StatCard
            label="Total samples (logged)"
            value={summary?.total_predictions ?? 0}
            hint="Count of saved predictions in local SQLite."
            tone="info"
          />
          <StatCard
            label="High risk percentage"
            value={highRiskPct}
            hint="Proportion of high-risk predictions."
            tone="danger"
          />
          <StatCard
            label="Average APGAR (recent)"
            value={avgApgar}
            hint="Computed from last stored predictions."
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="text-lg font-extrabold text-ink">Risk distribution</div>
          <p className="muted mt-1 text-sm">
            A quick breakdown of low vs high risk cases. Useful for monitoring operational burden.
          </p>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distData} dataKey="value" outerRadius={100} nameKey="name" label>
                  <Legend />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="text-lg font-extrabold text-ink">APGAR distribution (training data)</div>
          <p className="muted mt-1 text-sm">
            Dataset histogram helps explain typical APGAR ranges and the frequency of lower scores.
          </p>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apgarHist}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#de6f97" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <div className="text-lg font-extrabold text-ink">Vital signs distribution (Heart rate)</div>
        <p className="muted mt-1 text-sm">
          A sample vital-sign histogram to demonstrate how monitoring data is distributed in the training set.
        </p>
        <div className="mt-4 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hrHist}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" hide />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Samples" fill="#7fb0ff" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 rounded-2xl border border-blush-200 bg-white/70 p-4 text-sm text-muted">
          Interpretation: higher risk tends to correlate with abnormal vitals and lower APGAR. This dashboard
          provides an intuitive view for demonstration of monitoring intelligence.
        </div>
      </section>
    </div>
  );
}

