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
    Generate advisory based on crop environment data and model output.
    """
    if "error" in prediction_result:
        return {"error": prediction_result["error"]}
        
    advisory = {
        "irrigation": "Normal schedule.",
        "fertilizer": "Optimal levels detected.",
        "pest_risk": "Low"
    }

    # Simplified advisory logic
    if data["humidity"] < 30 and data["rainfall"] < 50:
        advisory["irrigation"] = "Critical: Immediate irrigation required."
    elif data["humidity"] < 50:
        advisory["irrigation"] = "Schedule irrigation within 2-3 days."
        
    if data["soil_n"] < 40:
        advisory["fertilizer"] = "Low Nitrogen detected. Apply Urea."
    elif data["soil_ph"] < 5.5:
        advisory["fertilizer"] = "Soil is acidic. Consider adding lime."
        
    if data["humidity"] > 80 and data["temperature"] > 28:
        advisory["pest_risk"] = "High Risk: Conditions favor fungal and pest growth."
        
    return advisory
