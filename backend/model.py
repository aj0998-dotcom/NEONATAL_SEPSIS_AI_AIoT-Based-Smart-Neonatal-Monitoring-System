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
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression


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

    # Cross-validation (report generalization stability).
    cv_results = None
    try:
        cv_model = CatBoostClassifier(
            iterations=200,
            learning_rate=0.08,
            depth=6,
            loss_function="MultiClass",
            eval_metric="Accuracy",
            verbose=False,
            random_seed=42,
        )
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        cv_results = cross_validate(
            cv_model,
            X,
            y,
            cv=cv,
            scoring={"accuracy": "accuracy", "f1_macro": "f1_macro", "f1_weighted": "f1_weighted"},
            n_jobs=None,
            return_train_score=False,
        )
    except Exception:
        cv_results = None

    # Cross-validation accuracy comparison across multiple models (Fig/table).
    cv_model_comparison: list[dict] = []
    cv_model_comparison_error: str | None = None
    cv_accuracy_comparison_image: str | None = None
    try:
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

        models = [
            (
                "LogisticRegression",
                LogisticRegression(
                    max_iter=2000,
                    solver="lbfgs",
                ),
            ),
            (
                "RandomForest",
                RandomForestClassifier(
                    n_estimators=400,
                    random_state=42,
                    n_jobs=-1,
                ),
            ),
            (
                "CatBoost",
                CatBoostClassifier(
                    iterations=200,
                    learning_rate=0.08,
                    depth=6,
                    loss_function="MultiClass",
                    eval_metric="Accuracy",
                    verbose=False,
                    random_seed=42,
                ),
            ),
        ]

        for name, estimator in models:
            scores = cross_validate(
                estimator,
                X,
                y,
                cv=cv,
                scoring={"accuracy": "accuracy", "f1_macro": "f1_macro"},
                n_jobs=None,
                return_train_score=False,
            )
            cv_model_comparison.append(
                {
                    "model": name,
                    "cv_folds": 5,
                    "accuracy_mean": round(float(np.mean(scores["test_accuracy"])), 4),
                    "accuracy_std": round(float(np.std(scores["test_accuracy"])), 4),
                    "f1_macro_mean": round(float(np.mean(scores["test_f1_macro"])), 4),
                    "f1_macro_std": round(float(np.std(scores["test_f1_macro"])), 4),
                }
            )
        cv_model_comparison.sort(key=lambda x: x["accuracy_mean"], reverse=True)

        # Plot CV accuracy comparison (Fig/table visual).
        names = [r["model"] for r in cv_model_comparison]
        means = [r["accuracy_mean"] for r in cv_model_comparison]
        stds = [r["accuracy_std"] for r in cv_model_comparison]
        plt.figure(figsize=(7.5, 4.5))
        x = np.arange(len(names))
        plt.bar(x, means, yerr=stds, capsize=6, color="#16a34a", alpha=0.9)
        plt.xticks(x, names, rotation=15, ha="right")
        plt.ylim(0.0, 1.0)
        plt.ylabel("Cross-Validation Accuracy")
        plt.title("Cross-Validation Accuracy Comparison Across Models (5-Fold)")
        plt.tight_layout()
        cv_img_path = PLOTS_DIR / "cv_accuracy_comparison.png"
        plt.savefig(cv_img_path, dpi=150)
        plt.close()
        cv_accuracy_comparison_image = "plots/cv_accuracy_comparison.png"
    except Exception as exc:
        cv_model_comparison = []
        cv_model_comparison_error = str(exc)
        cv_accuracy_comparison_image = None

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
    f1_weighted = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    # Feature importance (CatBoost) bar chart (Fig 6.4).
    feature_importance = None
    feature_importance_image = None
    try:
        importances = np.asarray(model.get_feature_importance(), dtype=float).ravel()
        feature_importance = [
            {"feature": feature_cols[i], "importance": round(float(importances[i]), 6)}
            for i in range(min(len(feature_cols), len(importances)))
        ]
        feature_importance.sort(key=lambda x: x["importance"], reverse=True)

        labels = [x["feature"] for x in feature_importance]
        values = [x["importance"] for x in feature_importance]
        plt.figure(figsize=(7.5, 4.5))
        plt.barh(labels[::-1], values[::-1], color="#2563eb")
        plt.title("CatBoost Feature Importance")
        plt.xlabel("Importance")
        plt.tight_layout()
        fi_path = PLOTS_DIR / "feature_importance.png"
        plt.savefig(fi_path, dpi=150)
        plt.close()
        feature_importance_image = "plots/feature_importance.png"
    except Exception:
        feature_importance = None
        feature_importance_image = None

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

    # Composite "all performance" figure for reports/slides.
    performance_overview_image = None
    try:
        fig, axes = plt.subplots(2, 2, figsize=(12, 9))

        # (1) Confusion matrix heatmap
        ax = axes[0, 0]
        im = ax.imshow(cm.astype(float), cmap="Blues")
        ax.set_title("Confusion Matrix")
        ax.set_xticks(range(len(labels)), labels)
        ax.set_yticks(range(len(labels)), labels)
        ax.set_xlabel("Predicted")
        ax.set_ylabel("Actual")
        for i in range(len(labels)):
            for j in range(len(labels)):
                ax.text(j, i, int(cm[i, j]), ha="center", va="center", color="#111827", fontsize=10)
        fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)

        # (2) Feature importance
        ax = axes[0, 1]
        if feature_importance:
            fi_labels = [x["feature"] for x in feature_importance]
            fi_values = [x["importance"] for x in feature_importance]
            ax.barh(fi_labels[::-1], fi_values[::-1], color="#2563eb")
            ax.set_title("CatBoost Feature Importance")
            ax.set_xlabel("Importance")
        else:
            ax.axis("off")
            ax.text(0.5, 0.5, "Feature importance not available", ha="center", va="center")

        # (3) CV model comparison
        ax = axes[1, 0]
        if cv_model_comparison:
            names = [r["model"] for r in cv_model_comparison]
            means = [r["accuracy_mean"] for r in cv_model_comparison]
            stds = [r["accuracy_std"] for r in cv_model_comparison]
            x = np.arange(len(names))
            ax.bar(x, means, yerr=stds, capsize=6, color="#16a34a", alpha=0.9)
            ax.set_xticks(x, names, rotation=15, ha="right")
            ax.set_ylim(0.0, 1.0)
            ax.set_ylabel("CV Accuracy")
            ax.set_title("CV Accuracy Comparison (5-Fold)")
        else:
            ax.axis("off")
            ax.text(0.5, 0.5, "CV comparison not available", ha="center", va="center")

        # (4) Key metrics text
        ax = axes[1, 1]
        ax.axis("off")
        summary_lines = [
            f"Holdout Accuracy: {accuracy:.4f}",
            f"Precision (macro): {precision:.4f}",
            f"Recall (macro): {recall:.4f}",
            f"F1 (macro): {f1:.4f}",
            f"F1 (weighted): {f1_weighted:.4f}",
        ]
        if cv_results is not None:
            summary_lines += [
                f"CV Accuracy (mean±std): {np.mean(cv_results['test_accuracy']):.4f} ± {np.std(cv_results['test_accuracy']):.4f}",
                f"CV F1 Macro (mean±std): {np.mean(cv_results['test_f1_macro']):.4f} ± {np.std(cv_results['test_f1_macro']):.4f}",
            ]
        ax.text(
            0.02,
            0.98,
            "Model Performance Summary\n\n" + "\n".join(summary_lines),
            ha="left",
            va="top",
            fontsize=11,
            color="#111827",
        )

        plt.tight_layout()
        overview_path = PLOTS_DIR / "performance_overview.png"
        fig.savefig(overview_path, dpi=150)
        plt.close(fig)
        performance_overview_image = "plots/performance_overview.png"
    except Exception:
        performance_overview_image = None

    metrics = {
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1_score": round(float(f1), 4),
        "f1_weighted": round(float(f1_weighted), 4),
        "cv_folds": 5,
        "cv_accuracy_mean": (
            round(float(np.mean(cv_results["test_accuracy"])), 4) if cv_results else None
        ),
        "cv_accuracy_std": (
            round(float(np.std(cv_results["test_accuracy"])), 4) if cv_results else None
        ),
        "cv_f1_macro_mean": (
            round(float(np.mean(cv_results["test_f1_macro"])), 4) if cv_results else None
        ),
        "cv_f1_macro_std": (
            round(float(np.std(cv_results["test_f1_macro"])), 4) if cv_results else None
        ),
        "cv_f1_weighted_mean": (
            round(float(np.mean(cv_results["test_f1_weighted"])), 4) if cv_results else None
        ),
        "cv_f1_weighted_std": (
            round(float(np.std(cv_results["test_f1_weighted"])), 4) if cv_results else None
        ),
        "cv_accuracy_comparison": cv_model_comparison,
        "cv_accuracy_comparison_error": cv_model_comparison_error,
        "cv_accuracy_comparison_image": cv_accuracy_comparison_image,
        "feature_importance": feature_importance,
        "feature_importance_image": feature_importance_image,
        "performance_overview_image": performance_overview_image,
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
