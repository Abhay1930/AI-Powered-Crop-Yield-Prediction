from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
import json
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Global variables for model and encoders
model = None
scaler = None
le_state = None
le_district = None
le_season = None
le_crop = None
unique_values = None

def load_model_and_encoders():
    """Load the trained model and encoders"""
    global model, scaler, le_state, le_district, le_season, le_crop, unique_values
    
    try:
        # Load model and scaler
        model = joblib.load('crop_yield_model.pkl')
        scaler = joblib.load('scaler.pkl')
        
        # Load label encoders
        le_state = joblib.load('label_encoders/state_encoder.pkl')
        le_district = joblib.load('label_encoders/district_encoder.pkl')
        le_season = joblib.load('label_encoders/season_encoder.pkl')
        le_crop = joblib.load('label_encoders/crop_encoder.pkl')
        
        # Load unique values
        with open('data/unique_values.json', 'r') as f:
            unique_values = json.load(f)
        
        print("✅ Model and encoders loaded successfully!")
        return True
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy" if model is not None else "model_not_loaded",
        "timestamp": datetime.now().isoformat(),
        "service": "Crop Yield ML API",
        "model_loaded": model is not None
    })

@app.route('/unique-values', methods=['GET'])
def get_unique_values():
    """Get unique values for dropdowns"""
    if unique_values is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    return jsonify(unique_values)

@app.route('/districts/<state>', methods=['GET'])
def get_districts_for_state(state):
    """Get districts for a specific state"""
    if unique_values is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    districts = unique_values.get('district_state_mapping', {}).get(state, [])
    return jsonify({"districts": districts})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({"error": "Model not loaded. Please train the model first."}), 500
        
        data = request.get_json()
        
        # Extract input values
        state_name = data.get('state_name', '').strip()
        district_name = data.get('district_name', '').strip()
        season = data.get('season', '').strip()
        crop = data.get('crop', '').strip()
        crop_year = int(data.get('crop_year', 2024))
        area = float(data.get('area', 0))
        
        # Validate inputs
        if not all([state_name, district_name, season, crop, area > 0]):
            return jsonify({"error": "All fields are required and area must be positive"}), 400
        
        # Check if values exist in training data
        if state_name not in unique_values['states']:
            return jsonify({"error": f"State '{state_name}' not found in training data"}), 400
        
        if district_name not in unique_values['districts']:
            return jsonify({"error": f"District '{district_name}' not found in training data"}), 400
        
        if season not in unique_values['seasons']:
            return jsonify({"error": f"Season '{season}' not found in training data"}), 400
        
        if crop not in unique_values['crops']:
            return jsonify({"error": f"Crop '{crop}' not found in training data"}), 400
        
        # Encode categorical variables
        state_encoded = le_state.transform([state_name])[0]
        district_encoded = le_district.transform([district_name])[0]
        season_encoded = le_season.transform([season])[0]
        crop_encoded = le_crop.transform([crop])[0]
        
        # Normalize year (assuming training data range)
        year_min = 2000  # Approximate minimum year from dataset
        year_max = 2024  # Approximate maximum year
        year_normalized = (crop_year - year_min) / (year_max - year_min)
        
        # Create feature vector
        features = np.array([[
            state_encoded,
            district_encoded,
            season_encoded,
            crop_encoded,
            year_normalized,
            area
        ]])
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Make prediction
        predicted_production = model.predict(features_scaled)[0]
        
        # Calculate yield per hectare
        yield_per_hectare = predicted_production / area if area > 0 else 0
        
        # Generate insights and recommendations
        insights = generate_insights(state_name, district_name, season, crop, predicted_production, yield_per_hectare)
        
        response = {
            "success": True,
            "prediction": {
                "predicted_production": round(predicted_production, 2),
                "yield_per_hectare": round(yield_per_hectare, 2),
                "area_hectares": area,
                "unit": "tons"
            },
            "inputs": {
                "state": state_name,
                "district": district_name,
                "season": season,
                "crop": crop,
                "year": crop_year,
                "area": area
            },
            "insights": insights,
            "prediction_timestamp": datetime.now().isoformat()
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500

def generate_insights(state, district, season, crop, production, yield_per_hectare):
    """Generate insights and recommendations based on prediction"""
    
    insights = {
        "production_analysis": "",
        "yield_analysis": "",
        "recommendations": []
    }
    
    # Production analysis
    if production > 1000:
        insights["production_analysis"] = f"Excellent production potential! Expected {production:.0f} tons of {crop}."
    elif production > 500:
        insights["production_analysis"] = f"Good production potential with {production:.0f} tons expected."
    else:
        insights["production_analysis"] = f"Moderate production expected: {production:.0f} tons."
    
    # Yield analysis
    if yield_per_hectare > 5:
        insights["yield_analysis"] = f"High yield potential: {yield_per_hectare:.1f} tons/hectare."
    elif yield_per_hectare > 2:
        insights["yield_analysis"] = f"Average yield expected: {yield_per_hectare:.1f} tons/hectare."
    else:
        insights["yield_analysis"] = f"Lower yield expected: {yield_per_hectare:.1f} tons/hectare."
    
    # Recommendations
    recommendations = []
    
    if season.lower() in ['kharif', 'rabi']:
        recommendations.append("Consider crop rotation to maintain soil health")
    
    if yield_per_hectare < 3:
        recommendations.append("Implement precision farming techniques")
        recommendations.append("Consider soil testing and nutrient management")
    
    if crop.lower() in ['rice', 'wheat']:
        recommendations.append("Ensure proper irrigation scheduling")
    
    recommendations.append(f"Monitor weather conditions for {season} season")
    recommendations.append("Follow recommended planting dates for optimal yield")
    
    insights["recommendations"] = recommendations
    
    return insights

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "service": "Crop Yield Prediction ML API",
        "status": "running",
        "model_loaded": model is not None,
        "endpoints": [
            "/health",
            "/unique-values", 
            "/districts/<state>",
            "/predict"
        ]
    })

if __name__ == '__main__':
    print("🚀 Starting ML API on port 8000...")
    
    # Load model on startup
    if load_model_and_encoders():
        print("✅ Model loaded successfully!")
    else:
        print("⚠️  Model not loaded. Please train the model first.")
    
    app.run(host='0.0.0.0', port=8000, debug=False)
