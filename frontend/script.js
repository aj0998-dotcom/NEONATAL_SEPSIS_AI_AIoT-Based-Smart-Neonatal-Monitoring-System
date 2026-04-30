const API_BASE = window.location.protocol === "file:" ? "http://127.0.0.1:5000" : "";

const form = document.getElementById("predictionForm");
const resultText = document.getElementById("resultText");
const probabilityText = document.getElementById("probabilityText");
const probabilityBar = document.getElementById("probabilityBar");
const alertText = document.getElementById("alertText");
const accuracyText = document.getElementById("accuracyText");
const statusText = document.getElementById("statusText");
const spinner = document.getElementById("spinner");
const cmImage = document.getElementById("cmImage");
const rocImage = document.getElementById("rocImage");
const cmTN = document.getElementById("cmTN");
const cmFP = document.getElementById("cmFP");
const cmFN = document.getElementById("cmFN");
const cmTP = document.getElementById("cmTP");

const vitalApgar = document.getElementById("vitalApgar");
const vitalHeartRate = document.getElementById("vitalHeartRate");
const vitalTemperature = document.getElementById("vitalTemperature");
const vitalRespRate = document.getElementById("vitalRespRate");
const vitalOxygen = document.getElementById("vitalOxygen");
const sampleLowBtn = document.getElementById("sampleLowBtn");
const sampleHighBtn = document.getElementById("sampleHighBtn");
const totalPredictions = document.getElementById("totalPredictions");
const highCount = document.getElementById("highCount");
const lowCount = document.getElementById("lowCount");
const precisionValue = document.getElementById("precisionValue");
const recallValue = document.getElementById("recallValue");
const f1Value = document.getElementById("f1Value");
const rocAucValue = document.getElementById("rocAucValue");
const historyTableBody = document.getElementById("historyTableBody");
const datasetCountText = document.getElementById("datasetCountText");

let accuracyChart;
let typeChart;
let trendChart;
let datasetOutputChart;
const histogramCharts = {};

function setTelemetry(values) {
  // values is the same shape as getPayload() output.
  vitalApgar.textContent = values.Apgar !== undefined ? Number(values.Apgar).toFixed(1) : "-";
  vitalHeartRate.textContent =
    values.HeartRate !== undefined ? Number(values.HeartRate).toFixed(1) : "-";
  vitalTemperature.textContent =
    values.Temperature !== undefined ? Number(values.Temperature).toFixed(1) : "-";
  vitalRespRate.textContent =
    values.RespRate !== undefined ? Number(values.RespRate).toFixed(1) : "-";
  vitalOxygen.textContent =
    values.OxygenLevel !== undefined ? Number(values.OxygenLevel).toFixed(1) : "-";
}

function showSpinner(show) {
  spinner.classList.toggle("hidden", !show);
}

function setButtonState(isLoading) {
  const button = document.getElementById("predictBtn");
  if (!button) {
    return;
  }
  button.disabled = isLoading;
  button.textContent = isLoading ? "Predicting..." : "Predict";
}

function getPayload() {
  return {
    Apgar: document.getElementById("Apgar").value,
    HeartRate: document.getElementById("HeartRate").value,
    Temperature: document.getElementById("Temperature").value,
    RespRate: document.getElementById("RespRate").value,
    OxygenLevel: document.getElementById("OxygenLevel").value,
  };
}

function setFormValues(values) {
  document.getElementById("Apgar").value = values.Apgar;
  document.getElementById("HeartRate").value = values.HeartRate;
  document.getElementById("Temperature").value = values.Temperature;
  document.getElementById("RespRate").value = values.RespRate;
  document.getElementById("OxygenLevel").value = values.OxygenLevel;
}

function validatePayload(payload) {
  const ranges = {
    Apgar: [0, 10],
    HeartRate: [60, 220],
    Temperature: [30, 43],
    RespRate: [10, 120],
    OxygenLevel: [40, 100],
  };

  for (const [key, [min, max]] of Object.entries(ranges)) {
    const value = Number(payload[key]);
    if (Number.isNaN(value)) {
      return `${key} must be a valid number.`;
    }
    if (value < min || value > max) {
      return `${key} must be between ${min} and ${max}.`;
    }
  }

  return null;
}

function setAlertTone(level) {
  const tones = {
    High: "var(--danger)",
    Medium: "var(--warning)",
    Low: "var(--success)",
  };
  alertText.style.color = tones[level] || "var(--text)";
}

async function loadHealthStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    if (data.status === "ok") {
      statusText.textContent = `Backend connected • Model loaded: ${data.model_loaded ? "Yes" : "No"}`;
      statusText.style.background = "rgba(47, 156, 104, 0.10)";
      statusText.style.color = "var(--success)";
    }
  } catch (error) {
    statusText.textContent = "Backend not reachable. Start the Flask server on 127.0.0.1:5000.";
    statusText.style.background = "rgba(200, 76, 108, 0.10)";
    statusText.style.color = "var(--danger)";
  }
}

function drawAccuracyChart(accuracy) {
  const accuracyPercent = +(accuracy * 100).toFixed(2);
  const errorPercent = +(100 - accuracyPercent).toFixed(2);
  const config = {
    type: "doughnut",
    data: {
      labels: ["Accuracy", "Error"],
      datasets: [
        {
          data: [accuracyPercent, errorPercent],
          backgroundColor: ["#de6f97", "#f8dbe4"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      cutout: "72%",
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  };

  if (accuracyChart) {
    accuracyChart.destroy();
  }
  accuracyChart = new Chart(document.getElementById("accuracyChart"), config);
}

async function loadMetrics() {
  try {
    const res = await fetch(`${API_BASE}/metrics`);
    const data = await res.json();

    if (typeof data.accuracy === "number") {
      accuracyText.textContent = `Model Accuracy: ${(data.accuracy * 100).toFixed(2)}%`;
      drawAccuracyChart(data.accuracy);
    }

    precisionValue.textContent = typeof data.precision === "number" ? `${(data.precision * 100).toFixed(2)}%` : "-";
    recallValue.textContent = typeof data.recall === "number" ? `${(data.recall * 100).toFixed(2)}%` : "-";
    f1Value.textContent = typeof data.f1_score === "number" ? `${(data.f1_score * 100).toFixed(2)}%` : "-";
    rocAucValue.textContent = typeof data.roc_auc === "number" ? `${(data.roc_auc * 100).toFixed(2)}%` : "-";

    if (data.confusion_matrix_url) {
      cmImage.src = data.confusion_matrix_url;
    }
    if (data.roc_curve_url) {
      rocImage.src = data.roc_curve_url;
    }

    const cmCounts = data.confusion_matrix_counts;
    if (cmCounts && typeof cmCounts === "object") {
      if (cmTN) cmTN.textContent = cmCounts.tn ?? "-";
      if (cmFP) cmFP.textContent = cmCounts.fp ?? "-";
      if (cmFN) cmFN.textContent = cmCounts.fn ?? "-";
      if (cmTP) cmTP.textContent = cmCounts.tp ?? "-";
    }
  } catch (error) {
    accuracyText.textContent = "Model metrics unavailable.";
    precisionValue.textContent = "-";
    recallValue.textContent = "-";
    f1Value.textContent = "-";
    rocAucValue.textContent = "-";
  }
}

function drawPieChart(canvasId, existingChart, labels, values, colors) {
  const ctx = document.getElementById(canvasId);
  if (existingChart) {
    existingChart.destroy();
  }
  return new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}

function drawTrendChart(labels, probabilities) {
  const ctx = document.getElementById("trendChart");
  if (trendChart) {
    trendChart.destroy();
  }
  trendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Sepsis Probability (%)",
          data: probabilities.map((value) => +(value * 100).toFixed(2)),
          borderColor: "#de6f97",
          backgroundColor: "rgba(222, 111, 151, 0.14)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: {
            color: "rgba(180, 102, 132, 0.14)",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

function drawBarChart(canvasId, labels, data, chartLabel, color, existingKey) {
  const ctx = document.getElementById(canvasId);
  if (histogramCharts[existingKey]) {
    histogramCharts[existingKey].destroy();
  }
  histogramCharts[existingKey] = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: chartLabel,
          data,
          backgroundColor: color,
          borderRadius: 10,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(180, 102, 132, 0.12)",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

async function loadPredictionSummary() {
  try {
    const res = await fetch(`${API_BASE}/prediction-summary`);
    const data = await res.json();
    totalPredictions.textContent = data.total_predictions ?? 0;
    highCount.textContent = data.high_risk_count ?? 0;
    lowCount.textContent = data.low_risk_count ?? 0;
    typeChart = drawPieChart(
      "typeChart",
      typeChart,
      ["High Risk", "Low Risk"],
      [data.high_risk_count ?? 0, data.low_risk_count ?? 0],
      ["#de6f97", "#8fd3b6"]
    );
    drawTrendChart(data.last_probability_labels ?? [], data.last_probabilities ?? []);
  } catch (error) {
    totalPredictions.textContent = "0";
    highCount.textContent = "0";
    lowCount.textContent = "0";
  }
}

function renderHistoryRows(rows) {
  if (!rows.length) {
    historyTableBody.innerHTML =
      '<tr><td colspan="8" class="muted">No predictions yet. Run a prediction to see history.</td></tr>';
    return;
  }

  historyTableBody.innerHTML = rows
    .map((row) => {
      const probability = `${(Number(row.sepsis_probability) * 100).toFixed(2)}%`;
      return `
        <tr>
          <td>${new Date(row.created_at).toISOString().replace("T", " ").slice(0, 19)}</td>
          <td>${Number(row.apgar).toFixed(1)}</td>
          <td>${Number(row.heart_rate).toFixed(1)}</td>
          <td>${Number(row.temperature).toFixed(1)}</td>
          <td>${Number(row.resp_rate).toFixed(1)}</td>
          <td>${Number(row.oxygen_level).toFixed(1)}</td>
          <td class="${row.result.includes("High") ? "risk-high" : "risk-low"}">${row.result}</td>
          <td>${probability}</td>
        </tr>
      `;
    })
    .join("");
}

async function loadPredictionHistory() {
  try {
    const res = await fetch(`${API_BASE}/predictions`);
    const rows = await res.json();
    renderHistoryRows(rows);
  } catch (error) {
    historyTableBody.innerHTML =
      '<tr><td colspan="8" class="risk-high">Unable to load prediction history.</td></tr>';
  }
}

async function loadDatasetAnalytics() {
  try {
    const res = await fetch(`${API_BASE}/dataset-analytics`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to load dataset analytics");
    }

    datasetCountText.textContent = `Total Dataset Samples: ${data.sample_count}`;

    const output = data.output_distribution || {};
    datasetOutputChart = drawPieChart(
      "datasetOutputChart",
      datasetOutputChart,
      ["Low Risk", "High Risk"],
      [output.low_risk || 0, output.high_risk || 0],
      ["#8fd3b6", "#de6f97"]
    );

    const hist = data.feature_histograms || {};
    drawBarChart("apgarHistChart", hist.Apgar?.labels || [], hist.Apgar?.counts || [], "Apgar", "#f4acc3", "apgarHistChart");
    drawBarChart(
      "heartRateHistChart",
      hist.HeartRate?.labels || [],
      hist.HeartRate?.counts || [],
      "HeartRate",
      "#f7c1d0",
      "heartRateHistChart"
    );
    drawBarChart(
      "temperatureHistChart",
      hist.Temperature?.labels || [],
      hist.Temperature?.counts || [],
      "Temperature",
      "#f0a7be",
      "temperatureHistChart"
    );
    drawBarChart(
      "respRateHistChart",
      hist.RespRate?.labels || [],
      hist.RespRate?.counts || [],
      "RespRate",
      "#eaa0b9",
      "respRateHistChart"
    );
    drawBarChart(
      "oxygenHistChart",
      hist.OxygenLevel?.labels || [],
      hist.OxygenLevel?.counts || [],
      "OxygenLevel",
      "#f8c7d6",
      "oxygenHistChart"
    );
  } catch (error) {
    datasetCountText.textContent = "Unable to load full dataset graphs.";
  }
}

function updatePredictionUI(data) {
  const riskClass = data.prediction === 1 ? "risk-high" : "risk-low";
  resultText.textContent = data.result;
  resultText.className = `result-text ${riskClass}`;
  probabilityText.textContent = `Sepsis probability: ${(data.sepsis_probability * 100).toFixed(2)}%`;
  probabilityBar.style.width = `${Math.max(4, data.sepsis_probability * 100)}%`;
  probabilityBar.style.background = data.prediction === 1
    ? "linear-gradient(90deg, #e65e86, #c84c6c)"
    : "linear-gradient(90deg, #8fd3b6, #2f9c68)";
  alertText.textContent = data.alert_message || "No alert generated.";
  setAlertTone(data.alert_level || (data.prediction === 1 ? "High" : "Low"));
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showSpinner(true);
  setButtonState(true);
  resultText.textContent = "Predicting...";
  resultText.className = "result-text";
  probabilityText.textContent = "Processing vital signs...";
  alertText.textContent = "Generating medical alert...";
  probabilityBar.style.width = "12%";

  const payload = getPayload();
  const validationError = validatePayload(payload);
  if (validationError) {
    resultText.textContent = validationError;
    resultText.className = "result-text risk-high";
    probabilityText.textContent = "";
    alertText.textContent = "Please correct the input values and try again.";
    showSpinner(false);
    setButtonState(false);
    return;
  }

  setTelemetry(payload);

  try {
    const response = await fetch(`${API_BASE}/generate-alert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Prediction failed");
    }

    updatePredictionUI(data);
    await loadPredictionSummary();
    await loadPredictionHistory();
  } catch (error) {
    resultText.textContent = `Error: ${error.message}`;
    resultText.className = "result-text risk-high";
    probabilityText.textContent = "";
    alertText.textContent = "Prediction could not be completed.";
  } finally {
    showSpinner(false);
    setButtonState(false);
  }
});

sampleLowBtn.addEventListener("click", () => {
  setFormValues({ Apgar: 9, HeartRate: 138, Temperature: 36.8, RespRate: 42, OxygenLevel: 98 });
});

sampleHighBtn.addEventListener("click", () => {
  setFormValues({ Apgar: 5, HeartRate: 176, Temperature: 38.9, RespRate: 70, OxygenLevel: 85 });
});

loadHealthStatus();
loadMetrics();
loadPredictionSummary();
loadPredictionHistory();
loadDatasetAnalytics();

setInterval(() => {
  loadPredictionSummary();
  loadPredictionHistory();
}, 30000);
