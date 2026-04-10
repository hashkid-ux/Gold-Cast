from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
import json
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load model
try:
    with open(os.path.join(BASE_DIR, "gold_model.pkl"), "rb") as f:
        model = pickle.load(f)
except FileNotFoundError:
    print("WARNING: gold_model.pkl not found. Run train.py first.")
    model = None

# Load insights
try:
    with open(os.path.join(BASE_DIR, "model_insights.json"), "r") as f:
        insights = json.load(f)
except FileNotFoundError:
    print("WARNING: model_insights.json not found. Run train.py first.")
    insights = {}

# ─── Prediction ───
@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded. Run train.py first."}), 500
    try:
        data = request.json
        features = np.array([[
            float(data.get('inflation_rate', 0)),
            float(data.get('crude_oil_price', 0)),
            float(data.get('stock_market_index', 0)),
            float(data.get('currency_exchange_rate', 0))
        ]])
        prediction = model.predict(features)[0]
        return jsonify({"predicted_gold_price": round(prediction, 2)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ─── Dataset with pagination ───
@app.route('/api/dataset', methods=['GET'])
def get_dataset():
    try:
        df = pd.read_csv(os.path.join(BASE_DIR, "gold_dataset.csv"))
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        total = len(df)
        start = (page - 1) * limit
        end = start + limit
        rows = df.iloc[start:end].to_dict(orient="records")
        return jsonify({
            "dataset": rows,
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": (total + limit - 1) // limit
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 404

# ─── Full model insights (correlations, OOB, scatter, metrics) ───
@app.route('/api/model-insights', methods=['GET'])
def get_model_insights():
    if insights:
        return jsonify(insights)
    return jsonify({"error": "Insights not found. Run train.py."}), 404

# ─── Chart data: Real prices + model predictions ───
@app.route('/api/chart-data', methods=['GET'])
def get_chart_data():
    """Returns real gold prices from dataset with model predictions overlaid."""
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
    try:
        df = pd.read_csv(os.path.join(BASE_DIR, "gold_dataset.csv"))
        # Sort by gold_price to simulate a time-ordered trend
        df_sorted = df.sort_values("gold_price").reset_index(drop=True)
        # Sample 30 evenly-spaced rows to create a clean chart
        indices = np.linspace(0, len(df_sorted) - 1, 30, dtype=int)
        sample = df_sorted.iloc[indices].copy()
        
        # Get model prediction for each row
        X_sample = sample[["inflation_rate", "crude_oil_price", "stock_market_index", "currency_exchange_rate"]]
        predictions = model.predict(X_sample)
        
        chart_points = []
        for i, (_, row) in enumerate(sample.iterrows()):
            actual = round(float(row["gold_price"]), 2)
            predicted = round(float(predictions[i]), 2)
            chart_points.append({
                "index": i + 1,
                "label": f"S{i+1}",
                "actual": actual,
                "predicted": predicted,
                "residual": round(actual - predicted, 2),
                "inflation": round(float(row["inflation_rate"]), 2),
                "oil": round(float(row["crude_oil_price"]), 2),
                "stock": round(float(row["stock_market_index"]), 2),
                "fx": round(float(row["currency_exchange_rate"]), 2),
            })
        
        return jsonify({"chart": chart_points})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── Download routes ───
@app.route('/api/download/dataset', methods=['GET'])
def download_dataset():
    path = os.path.join(BASE_DIR, "gold_dataset.csv")
    if os.path.exists(path):
        return send_file(path, as_attachment=True, download_name="gold_dataset.csv")
    return jsonify({"error": "File not found"}), 404

@app.route('/api/download/model', methods=['GET'])
def download_model():
    path = os.path.join(BASE_DIR, "gold_model.pkl")
    if os.path.exists(path):
        return send_file(path, as_attachment=True, download_name="gold_model.pkl")
    return jsonify({"error": "File not found"}), 404

@app.route('/api/download/insights', methods=['GET'])
def download_insights():
    path = os.path.join(BASE_DIR, "model_insights.json")
    if os.path.exists(path):
        return send_file(path, as_attachment=True, download_name="model_insights.json")
    return jsonify({"error": "File not found"}), 404

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=False)