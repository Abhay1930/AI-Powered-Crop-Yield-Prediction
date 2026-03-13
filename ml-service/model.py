import numpy as np
import pandas as pd

# This is a dummy model representation.
# In a real scenario, you would load a trained model:
# model = xgb.XGBRegressor()
# model.load_model("crop_yield_model.json")

def predict_yield(data: dict) -> float:
    """
    Predict crop yield based on environmental factors.
    Returns yield in kg/hectare.
    """
    # Simple heuristic for dummy prediction
    # Higher N and moisture generally increase yield to a point.
    base_yield = {
        "wheat": 3000,
        "rice": 4000,
        "corn": 5000,
        "cotton": 2000,
        "sugarcane": 70000
    }.get(data.get("crop_type", "").lower(), 3000)

    # Add some variations based on inputs
    temp_factor = 1.0 - abs(25 - data["temperature"]) * 0.02
    rain_factor = 1.0 if data["rainfall"] > 100 else 0.8
    n_factor = 1.0 + (data["nitrogen"] / 100) * 0.2
    
    final_yield = base_yield * max(0.5, temp_factor) * rain_factor * n_factor
    
    # Add random noise for realism
    final_yield += np.random.normal(0, base_yield * 0.05)
    
    return round(float(final_yield), 2)

def get_smart_advisory(data: dict, predicted_yield: float) -> dict:
    """
    Generate advisory based on crop environment data.
    """
    advisory = {
        "irrigation": "Normal schedule.",
        "fertilizer": "Optimal levels detected.",
        "pest_risk": "Low"
    }

    # Irrigation rules
    if data["moisture"] < 30 and data["rainfall"] < 50:
        advisory["irrigation"] = "Critical: Immediate irrigation required due to low moisture and rainfall."
    elif data["moisture"] < 50:
        advisory["irrigation"] = "Schedule irrigation within 2-3 days."
        
    # Fertilizer rules
    if data["nitrogen"] < 40:
        advisory["fertilizer"] = "Low Nitrogen detected. Apply Urea or N-rich fertilizer."
    elif data["ph"] < 5.5:
        advisory["fertilizer"] = "Soil is acidic. Consider adding lime."
        
    # Pest rules
    if data["humidity"] > 80 and data["temperature"] > 28:
        advisory["pest_risk"] = "High Risk: Conditions favor fungal and pest growth. Prepare fungicide."
        
    return advisory
