import numpy as np
import pandas as pd
import joblib
import os
import warnings

# Suppress sklearn warnings about feature names when we use DataFrames
warnings.filterwarnings("ignore", category=UserWarning)

# Load model artifacts
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, 'model.joblib')
ENCODER_PATH = os.path.join(BASE_DIR, 'crop_encoder.joblib')
SCALER_PATH = os.path.join(BASE_DIR, 'scaler.joblib')

# Global variables for loaded artifacts
_model = None
_encoder = None
_scaler = None

def load_artifacts():
    global _model, _encoder, _scaler
    if _model is None:
        try:
            _model = joblib.load(MODEL_PATH)
            _encoder = joblib.load(ENCODER_PATH)
            _scaler = joblib.load(SCALER_PATH)
        except Exception as e:
            print(f"Error loading model artifacts: {e}")

def predict_yield(data: dict) -> dict:
    """
    Predict crop yield using the trained model.
    Returns a dictionary with yield_prediction, confidence_score, and feature_importance.
    """
    load_artifacts()
    
    if _model is None:
        return {"error": "Model not loaded"}

    try:
        # 1. Encode crop
        crop_type = data['crop_type'].strip()
        try:
            crop_encoded = _encoder.transform([crop_type])[0]
        except ValueError:
            # Handle unseen crop types gracefully or default to most common
            crop_encoded = _encoder.transform([_encoder.classes_[0]])[0]
        
        # 2. Extract and scale numeric features
        # Scaler columns (from prepare_dataset.py): 
        # ['rainfall', 'temperature', 'humidity', 'fertilizer', 'pesticide', 'soil_N', 'soil_P', 'soil_K', 'soil_pH', 'yield']
        
        input_data_for_scaler = pd.DataFrame([{
            'rainfall': data['rainfall'],
            'temperature': data['temperature'],
            'humidity': data['humidity'],
            'fertilizer': data['fertilizer'],
            'pesticide': data['pesticide'],
            'soil_N': data['soil_n'],
            'soil_P': data['soil_p'],
            'soil_K': data['soil_k'],
            'soil_pH': data['soil_ph'],
            'yield': 0 # Placeholder for scaling
        }])
        
        scaled_df = pd.DataFrame(_scaler.transform(input_data_for_scaler), columns=input_data_for_scaler.columns)
        
        # 3. Construct input vector for model
        # Model features: ['crop', 'rainfall', 'temperature', 'humidity', 'fertilizer', 'pesticide', 'soil_N', 'soil_P', 'soil_K', 'soil_pH']
        model_inputs = pd.DataFrame([{
            'crop': crop_encoded,
            'rainfall': scaled_df.at[0, 'rainfall'],
            'temperature': scaled_df.at[0, 'temperature'],
            'humidity': scaled_df.at[0, 'humidity'],
            'fertilizer': scaled_df.at[0, 'fertilizer'],
            'pesticide': scaled_df.at[0, 'pesticide'],
            'soil_N': scaled_df.at[0, 'soil_N'],
            'soil_P': scaled_df.at[0, 'soil_P'],
            'soil_K': scaled_df.at[0, 'soil_K'],
            'soil_pH': scaled_df.at[0, 'soil_pH']
        }])
        
        # 4. Predict
        prediction_normalized = _model.predict(model_inputs)[0]
        
        # 5. Inverse transform yield
        # Construct vector for inverse scaler
        inverse_vec = scaled_df.copy()
        inverse_vec.at[0, 'yield'] = prediction_normalized
        yield_raw = _scaler.inverse_transform(inverse_vec)[0, -1]
        
        # Convert from tonnes/hectare (CSV unit) to kg/hectare as requested
        yield_final = yield_raw * 1000
        
        # 6. Confidence Score
        # For RF, use prediction variance across trees
        if hasattr(_model, 'estimators_'):
            # Using DataFrame to avoid warnings in tree predictions
            all_tree_preds = [tree.predict(model_inputs.values)[0] for tree in _model.estimators_]
            std_dev = np.std(all_tree_preds)
            # Normalize confidence: 1 - min(1, std_dev / threshold)
            # Higher variance = lower confidence. Threshold calibrated for typical yield variance.
            confidence = max(0.5, 1 - (std_dev * 10)) # Heuristic adjustment
        else:
            confidence = 0.85
            
        # 7. Feature Importance
        importances = _model.feature_importances_
        feature_names = model_inputs.columns.tolist()
        importance_dict = dict(zip(feature_names, importances.tolist()))
        
        return {
            "yield": round(float(yield_final), 2),
            "confidence": round(float(min(0.99, confidence)), 2),
            "feature_importance": importance_dict
        }
        
    except Exception as e:
        return {"error": str(e)}

def get_smart_advisory(data: dict, prediction_result: dict) -> dict:
    """
    Generate crop-specific, data-driven precision agriculture advisory.
    Uses crop-specific optimal ranges to create actionable recommendations.
    """
    if "error" in prediction_result:
        return {"error": prediction_result[str("error")]}

    crop = data.get("crop_type", "wheat").strip().lower()
    temp = float(data.get("temperature", 25))
    humidity = float(data.get("humidity", 60))
    rainfall = float(data.get("rainfall", 100))
    soil_n = float(data.get("soil_n", 40))
    soil_ph = float(data.get("soil_ph", 6.5))
    fertilizer = float(data.get("fertilizer", 100))
    yield_estimate = prediction_result.get("yield", 0)

    # Crop-specific optimal ranges (based on agronomic science)
    crop_profiles = {
        "rice": {
            "opt_temp": (22, 32), "opt_humidity": (70, 90), "opt_rainfall": (150, 300),
            "opt_ph": (5.5, 7.0), "opt_n": (80, 120), "irrigation": "flooded",
            "n_dose": "120 kg Urea/ha in 3 splits"
        },
        "wheat": {
            "opt_temp": (15, 25), "opt_humidity": (50, 70), "opt_rainfall": (75, 150),
            "opt_ph": (6.0, 7.5), "opt_n": (60, 100), "irrigation": "2-3 irrigations",
            "n_dose": "90 kg Urea/ha in 2 splits"
        },
        "maize": {
            "opt_temp": (20, 35), "opt_humidity": (50, 80), "opt_rainfall": (100, 200),
            "opt_ph": (5.8, 7.0), "opt_n": (100, 150), "irrigation": "drip/sprinkler",
            "n_dose": "150 kg Urea/ha in 3 splits"
        },
        "cotton": {
            "opt_temp": (25, 35), "opt_humidity": (40, 70), "opt_rainfall": (50, 150),
            "opt_ph": (6.0, 8.0), "opt_n": (60, 90), "irrigation": "furrow",
            "n_dose": "80 kg Urea/ha in 2 splits"
        },
        "potato": {
            "opt_temp": (15, 25), "opt_humidity": (60, 80), "opt_rainfall": (100, 200),
            "opt_ph": (5.5, 6.5), "opt_n": (80, 120), "irrigation": "drip",
            "n_dose": "120 kg Urea/ha in 3 splits"
        }
    }

    profile = crop_profiles.get(crop, crop_profiles["wheat"])

    # ─── IRRIGATION ADVISORY ────────────────────────────────────────────────
    min_rain, max_rain = profile["opt_rainfall"]
    min_hum, max_hum = profile["opt_humidity"]
    irrigation_msg = ""
    if rainfall < min_rain * 0.5 and humidity < min_hum - 15:
        deficit = round(min_rain - rainfall, 1)
        irrigation_msg = f"🚨 Critical: Severe water stress. Apply {deficit}mm immediately via {profile['irrigation']} system. Crop loss imminent without intervention."
    elif rainfall < min_rain:
        deficit = round(min_rain - rainfall, 1)
        irrigation_msg = f"⚠️ Moderate deficit: {deficit}mm below optimal range. Schedule {profile['irrigation']} irrigation within 48 hours to prevent yield reduction."
    elif rainfall > max_rain:
        irrigation_msg = f"💧 Excess water ({rainfall}mm). Ensure drainage is open to prevent root rot. Reduce irrigation frequency."
    else:
        irrigation_msg = f"✅ Water status optimal ({rainfall}mm, {humidity}% humidity). Maintain current {profile['irrigation']} schedule."

    # ─── FERTILIZER / NUTRIENT ADVISORY ─────────────────────────────────────
    min_n, max_n = profile["opt_n"]
    ph_min, ph_max = profile["opt_ph"]
    nutrient_parts = []
    if soil_n < min_n * 0.6:
        deficit = round(min_n - soil_n, 1)
        nutrient_parts.append(f"🚨 Nitrogen critically low ({soil_n} kg/ha). Apply {profile['n_dose']} urgently.")
    elif soil_n < min_n:
        nutrient_parts.append(f"⚠️ Nitrogen deficient ({soil_n} kg/ha, optimal: {min_n}-{max_n}). Add 40-60 kg Urea now.")
    elif soil_n > max_n:
        nutrient_parts.append(f"⬇️ Nitrogen excess ({soil_n} kg/ha). Risk of lodging and leaching. Reduce next dose.")
    else:
        nutrient_parts.append(f"✅ Nitrogen optimal ({soil_n} kg/ha).")

    if soil_ph < ph_min:
        nutrient_parts.append(f"🧪 Soil acidic (pH {soil_ph}). Apply 2-3 tons/ha of agricultural lime to raise pH to {ph_min}-{ph_max}.")
    elif soil_ph > ph_max:
        nutrient_parts.append(f"🧪 Soil alkaline (pH {soil_ph}). Apply gypsum or sulfur to lower pH. Reduces micronutrient availability.")

    if fertilizer < 50:
        nutrient_parts.append("💊 Supplement with NPK 17:17:17 complex at 50 kg/ha for balanced nutrition.")

    nutrient_msg = " ".join(nutrient_parts) if nutrient_parts else "✅ Soil nutrients are within optimal range for this crop."

    # ─── PEST & DISEASE RISK ─────────────────────────────────────────────────
    pest_score = 0
    pest_parts = []
    if humidity > 80 and temp > 25:
        pest_score += 3
        pest_parts.append("High humidity + temperature → fungal disease risk (blast, rust, blight).")
    if humidity > 70 and crop == "rice":
        pest_score += 2
        pest_parts.append("Rice blast conditions active. Scout fields for leaf discoloration.")
    if temp > 32:
        pest_score += 1
        pest_parts.append("Heat conditions favor aphid and thrip populations.")
    if rainfall < 50 and crop in ["cotton", "maize"]:
        pest_score += 1
        pest_parts.append("Dry spell favors whitefly and mealybug on this crop.")

    if pest_score >= 4:
        pest_msg = f"🚨 HIGH RISK (Score {pest_score}/7): {' '.join(pest_parts)} Apply fungicide (Mancozeb 75WP @ 2kg/ha) and monitor every 48h."
    elif pest_score >= 2:
        pest_msg = f"⚠️ MODERATE RISK (Score {pest_score}/7): {' '.join(pest_parts)} Scout fields twice a week. Keep preventive spray ready."
    else:
        pest_msg = f"✅ LOW RISK: Current conditions (Temp {temp}°C, Humidity {humidity}%) are not conducive to major pest outbreaks. Routine weekly scouting recommended."

    return {
        "irrigation": irrigation_msg,
        "fertilizer": nutrient_msg,
        "pest_risk": pest_msg
    }
