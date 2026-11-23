"""
Market Price Forecasting Engine for Oilseeds.
Uses linear & polynomial trend regression on historical Agmarknet & MSP series.
Calculates prediction intervals and transparent metrics.
"""

import os
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

class PricePredictionEngine:
    def __init__(self):
        self.data_df: Optional[pd.DataFrame] = None
        self.load_data()

    def load_data(self):
        price_path = os.path.join(DATA_DIR, "market_prices_agmarknet_historical.csv")
        if os.path.exists(price_path):
            self.data_df = pd.read_csv(price_path)

    def predict_price(
        self,
        crop_name: str,
        region: str,
        target_year: int = 2025,
        inflation_assumption_pct: float = 5.0
    ) -> Dict[str, Any]:
        if self.data_df is None:
            return {
                "error": "Market price dataset is not loaded."
            }

        filtered = self.data_df[
            (self.data_df["crop_name"] == crop_name) & (self.data_df["region"] == region)
        ].sort_values("year")

        if len(filtered) < 5:
            # Fallback to crop nationwide if state has few points
            filtered = self.data_df[self.data_df["crop_name"] == crop_name].sort_values("year")

        if len(filtered) < 5:
            return {
                "error": f"Insufficient price observations for {crop_name} in {region}."
            }

        X = filtered[["year"]].values
        y = filtered["wholesale_avg_price_quintal"].values

        model = Ridge(alpha=1.0)
        model.fit(X, y)

        y_pred_hist = model.predict(X)
        mae = float(mean_absolute_error(y, y_pred_hist))
        rmse = float(np.sqrt(mean_squared_error(y, y_pred_hist)))
        r2 = float(r2_score(y, y_pred_hist))

        # Predict target year
        base_pred = float(model.predict([[target_year]])[0])

        # Apply inflation adjustment if target year is past the latest historical year
        latest_yr = int(filtered["year"].max())
        if target_year > latest_yr:
            years_ahead = target_year - latest_yr
            inflation_factor = (1.0 + (inflation_assumption_pct / 100.0)) ** years_ahead
            # Weight between regression trend and inflation factor
            predicted_price_qtl = round(base_pred * (0.7 + (0.3 * inflation_factor)), 1)
        else:
            predicted_price_qtl = round(base_pred, 1)

        # Ensure positive
        predicted_price_qtl = max(1000.0, predicted_price_qtl)
        predicted_price_kg = round(predicted_price_qtl / 100.0, 2)

        # 90% Prediction Interval based on historical standard deviation of residuals
        pred_interval_low = round(max(500.0, predicted_price_qtl - (1.645 * rmse)), 1)
        pred_interval_high = round(predicted_price_qtl + (1.645 * rmse), 1)

        historical_trend = []
        for _, row in filtered.iterrows():
            historical_trend.append({
                "year": int(row["year"]),
                "msp_price_quintal": float(row["msp_price_quintal"]) if pd.notna(row.get("msp_price_quintal")) else None,
                "wholesale_avg_price_quintal": float(row["wholesale_avg_price_quintal"]),
                "price_per_kg": float(row["price_per_kg"])
            })

        return {
            "crop_name": crop_name,
            "region": region,
            "model_name": "Time-Series Ridge Trend Regression with Inflation Modulation",
            "target_year": target_year,
            "predicted_wholesale_price_quintal": predicted_price_qtl,
            "predicted_price_per_kg": predicted_price_kg,
            "prediction_interval_low": pred_interval_low,
            "prediction_interval_high": pred_interval_high,
            "historical_trend": historical_trend,
            "model_metrics": {
                "MAE": round(mae, 2),
                "RMSE": round(rmse, 2),
                "R2": round(r2, 4)
            },
            "disclaimer": "Predictions are mathematical projections based on historical Agmarknet & CACP trends. Actual future market realizations depend on global edible oil tariffs, monsoon progress, and export/import policy."
        }

price_ml_engine = PricePredictionEngine()
