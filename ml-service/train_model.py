import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.preprocessing import LabelEncoder
import os

# Define paths
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
FINAL_DATASET_PATH = os.path.join(DATA_DIR, 'final_dataset.csv')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.joblib')
ENCODER_PATH = os.path.join(os.path.dirname(__file__), 'crop_encoder.joblib')

def train_models():
    print("Loading prepared dataset...")
    df = pd.read_csv(FINAL_DATASET_PATH)

    # 1. Encode categorical features (crop)
    print("Encoding categorical features...")
    le = LabelEncoder()
    df['crop'] = le.fit_transform(df['crop'])
    
    # Save encoder
    joblib.dump(le, ENCODER_PATH)
    print(f"Saved crop encoder to {ENCODER_PATH}")

    # Prepare features (X) and target (y)
    # Exclude 'state' and 'year' from features as requested/implied (or keep if desired, but crop/weather/soil are key)
    # We'll include everything except 'state' and 'year' as they might be less generalizable
    # Actually, keep them if you want, but the prompt says rainfall, temperature, humidity, fertilizer, pesticide, soil_N, soil_P, soil_K, soil_pH
    features = ['crop', 'rainfall', 'temperature', 'humidity', 'fertilizer', 'pesticide', 'soil_N', 'soil_P', 'soil_K', 'soil_pH']
    X = df[features]
    y = df['yield']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 2. Train Models
    print("Training Random Forest...")
    rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)

    print("Training XGBoost...")
    xgb_model = XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=6, random_state=42)
    xgb_model.fit(X_train, y_train)

    # 3. Evaluate
    def evaluate(model, name):
        y_pred = model.predict(X_test)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        print(f"\nResults for {name}:")
        print(f"  RMSE: {rmse:.6f}")
        print(f"  MAE: {mae:.6f}")
        print(f"  R² Score: {r2:.6f}")
        return r2, model

    rf_r2, _ = evaluate(rf_model, "Random Forest")
    xgb_r2, _ = evaluate(xgb_model, "XGBoost")

    # 4. Save Best Model
    best_model = xgb_model if xgb_r2 >= rf_r2 else rf_model
    print(f"\nBest Model: {'XGBoost' if best_model == xgb_model else 'Random Forest'}")
    
    # Save the model
    joblib.dump(best_model, MODEL_PATH)
    print(f"Saved best model to {MODEL_PATH}")

    # 5. Output Feature Importance
    importances = best_model.feature_importances_
    feat_imp = pd.Series(importances, index=features).sort_values(ascending=False)
    print("\nFeature Importances:")
    print(feat_imp)

if __name__ == "__main__":
    train_models()
