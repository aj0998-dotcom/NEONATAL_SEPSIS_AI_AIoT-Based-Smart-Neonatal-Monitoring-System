import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from catboost import CatBoostClassifier
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "dataset.csv"
MODEL_PATH = BASE_DIR / "model.cbm"
METRICS_PATH = BASE_DIR / "metrics.json"
PLOTS_DIR = BASE_DIR / "plots"
SOURCE_DATASET_PATH = (
    BASE_DIR.parent.parent / "neonatal_digital_twin" / "dataset" / "sepsis_africa_extra_large_10000.csv"
)


def _to_int_bool(series: pd.Series) -> pd.Series:
    """Convert True/False string-like values to 1/0."""
    lowered = series.astype(str).str.strip().str.lower()
    return lowered.map({"true": 1, "false": 0, "1": 1, "0": 0}).fillna(0).astype(int)


def _prepare_dataset_from_user_csv(random_state: int = 42) -> pd.DataFrame:
    """
    Build the project's 5-feature training dataset from user-provided CSV.
    The source CSV does not include all required vitals directly, so we derive
    beginner-friendly surrogate vitals from available clinical signals.
    """
    if not SOURCE_DATASET_PATH.exists():
        raise FileNotFoundError(f"Source dataset not found at: {SOURCE_DATASET_PATH}")

    source = pd.read_csv(SOURCE_DATASET_PATH)
    rng = np.random.default_rng(random_state)

    fever = _to_int_bool(source["fever"])
    hypothermia = _to_int_bool(source["hypothermia"])
    distress = _to_int_bool(source["respiratory_distress"])
    sepsis_score = pd.to_numeric(source["sepsis_probability_score"], errors="coerce").fillna(0.5)
    apgar_5min = pd.to_numeric(source["apgar_5min"], errors="coerce").fillna(7).clip(0, 10)

    heart_rate = 132 + (sepsis_score * 32) + (distress * 7) + rng.normal(0, 5, size=len(source))
    temperature = 36.7 + (fever * 1.3) - (hypothermia * 1.5) + rng.normal(0, 0.2, size=len(source))
    resp_rate = 40 + (distress * 16) + (sepsis_score * 10) + rng.normal(0, 3, size=len(source))
    oxygen = 97 - (distress * 7) - (sepsis_score * 6) - (hypothermia * 1.5) + rng.normal(
        0, 2, size=len(source)
    )

    sepsis_status = source["sepsis_status"].astype(str).str.strip().str.lower()
    sepsis_onset = source.get("sepsis_onset", pd.Series([""] * len(source))).astype(str).str.strip().str.lower()

    # 3-class target:
    # - NEG: No sepsis
    # - EOS: Early-onset sepsis
    # - LOS: Late-onset sepsis
    output = np.where(
        sepsis_status.eq("positive"),
        np.where(
            sepsis_onset.str.startswith("early"),
            "EOS",
            np.where(sepsis_onset.str.startswith("late"), "LOS", "LOS"),
        ),
        "NEG",
    )

    # Dummy variables (one-hot) for convenience/analytics.
    # NOTE: These are derived from the same source labels and should NOT be used
    # as model input features (label leakage). We keep them in `dataset.csv` only.
    eos = (output == "EOS").astype(int)
    los = (output == "LOS").astype(int)

    return pd.DataFrame(
        {
            "Apgar": np.round(apgar_5min, 1),
            "HeartRate": np.round(np.clip(heart_rate, 90, 220), 1),
            "Temperature": np.round(np.clip(temperature, 34.0, 41.5), 1),
            "RespRate": np.round(np.clip(resp_rate, 20, 95), 1),
            "OxygenLevel": np.round(np.clip(oxygen, 65, 100), 1),
            "SepsisType": output,
            "EOS": eos,
            "LOS": los,
            "Output": output,
        }
    )


def train_and_save_model() -> dict:
    PLOTS_DIR.mkdir(parents=True, exist_ok=True)

    df = _prepare_dataset_from_user_csv()
    df.to_csv(DATA_PATH, index=False)

    feature_cols = ["Apgar", "HeartRate", "Temperature", "RespRate", "OxygenLevel"]
    X = df[feature_cols]
    y = df["Output"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = CatBoostClassifier(
        iterations=200,
        learning_rate=0.08,
        depth=6,
        loss_function="MultiClass",
        eval_metric="Accuracy",
        verbose=False,
        random_seed=42,
    )
    model.fit(X_train, y_train)
    model.save_model(MODEL_PATH)

    y_pred = pd.Series(model.predict(X_test).ravel()).astype(str)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average="macro", zero_division=0)
    recall = recall_score(y_test, y_pred, average="macro", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="macro", zero_division=0)

    # Confusion Matrix plot
    labels = ["NEG", "EOS", "LOS"]
    cm = confusion_matrix(y_test, y_pred, labels=labels)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=labels)
    disp.plot(cmap="Blues")
    plt.title("Confusion Matrix - Neonatal Sepsis Type (NEG/EOS/LOS)")
    plt.tight_layout()
    cm_path = PLOTS_DIR / "confusion_matrix.png"
    plt.savefig(cm_path, dpi=150)
    plt.close()

    # Export confusion-matrix counts for dashboard display.
    # For multiclass, export the full matrix + labels.
    confusion_matrix_counts = {
        "labels": labels,
        "matrix": cm.astype(int).tolist(),
    }

    metrics = {
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1_score": round(float(f1), 4),
        "roc_auc": None,
        "confusion_matrix_counts": confusion_matrix_counts,
        "confusion_matrix_image": "plots/confusion_matrix.png",
        "roc_curve_image": None,
        "num_samples": int(len(df)),
        "class_labels": labels,
    }
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return metrics


if __name__ == "__main__":
    results = train_and_save_model()
    print("Model training complete.")
    print(json.dumps(results, indent=2))

    # Show EOS/LOS in the generated training data (dummy variables + distribution).
    try:
        df_preview = pd.read_csv(DATA_PATH)
        if "SepsisType" in df_preview.columns:
            print("\nSepsisType distribution:")
            print(df_preview["SepsisType"].value_counts(dropna=False).to_string())
        if "EOS" in df_preview.columns and "LOS" in df_preview.columns:
            print("\nEOS/LOS dummy totals:")
            print(
                json.dumps(
                    {
                        "EOS_total": int(df_preview["EOS"].sum()),
                        "LOS_total": int(df_preview["LOS"].sum()),
                    },
                    indent=2,
                )
            )
            print("\nSample rows (including EOS/LOS):")
            cols = ["Apgar", "HeartRate", "Temperature", "RespRate", "OxygenLevel", "SepsisType", "EOS", "LOS"]
            print(df_preview[cols].head(10).to_string(index=False))
    except Exception as exc:
        print(f"\nNote: could not print EOS/LOS preview ({exc}).")
