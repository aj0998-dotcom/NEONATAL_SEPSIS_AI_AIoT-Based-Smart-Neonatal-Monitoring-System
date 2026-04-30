# AI-Based Neonatal Sepsis Prediction using CatBoost

A beginner-friendly full-stack mini project for neonatal sepsis risk prediction.

## Project Structure

```text
neonatal_sepsis_catboost/
├── backend/
│   ├── app.py
│   ├── model.py
│   ├── dataset.csv            # generated after training
│   ├── model.cbm              # generated after training
│   ├── metrics.json           # generated after training
│   ├── plots/
│   │   ├── confusion_matrix.png
│   │   └── roc_curve.png
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── style.css
    └── script.js
```

## Features

- Input form for `Apgar`, `HeartRate`, `Temperature`, `RespRate`, `OxygenLevel`
- Flask API endpoint: `POST /predict`
- CatBoost model training and loading
- Accuracy, confusion matrix, and ROC curve generation
- Precision, Recall, F1, ROC-AUC display
- Professional UI styling + loading spinner
- Frontend-backend integration using Fetch API
- Live dashboard for prediction-type distribution and trend
- Persistent prediction history in SQLite (`backend/predictions.db`)

## Quick Demo Run (Best for Presentation)

1. Go to project folder:

```powershell
cd "C:\Users\Asus\OneDrive\Documents\Desktop\AIOT PROJECT\neonatal_sepsis_catboost"
```

2. Start app (single command):

```powershell
run_demo.bat
```

3. Open in browser:

`http://127.0.0.1:5000`

Notes:
- If `model.cbm` is missing, backend auto-trains model once.
- Frontend is served by Flask directly for easier demo setup.

## Step-by-Step Run Guide (Windows)

### 1) Open terminal in backend folder

```powershell
cd "C:\Users\Asus\OneDrive\Documents\Desktop\AIOT PROJECT\neonatal_sepsis_catboost\backend"
```

### 2) Create virtual environment (recommended)

```powershell
python -m venv venv
venv\Scripts\activate
```

### 3) Install dependencies

```powershell
pip install -r requirements.txt
```

### 4) Train CatBoost model from your provided dataset

```powershell
python model.py
```

This creates:
- `dataset.csv`
- `model.cbm`
- `metrics.json`
- `plots/confusion_matrix.png`
- `plots/roc_curve.png`

Source dataset used by training:
`AIOT PROJECT/neonatal_digital_twin/dataset/sepsis_africa_extra_large_10000.csv`

### 5) Start Flask backend

```powershell
python app.py
```

Backend runs at: `http://127.0.0.1:5000`

### 5b) Production-style run (recommended for deployment demo)

```powershell
python serve.py
```

### 6) Open frontend in browser

```text
http://127.0.0.1:5000
```

Then:
- Enter patient values
- Click **Predict**
- View risk result and probability
- Check model accuracy + confusion matrix + ROC curve

## Notes

- This project is for educational demonstration only, not for real medical diagnosis.
- You can improve the model later with a real clinical dataset.
