from model import predict_yield, get_smart_advisory

sample_data = {
    "crop_type": "Wheat",
    "temperature": 25.0,
    "humidity": 60.0,
    "rainfall": 150.0,
    "soil_ph": 6.5,
    "soil_n": 80.0,
    "soil_p": 40.0,
    "soil_k": 40.0,
    "fertilizer": 100.0,
    "pesticide": 100.0
}

print("Running Prediction Test (Refined Schema)...")
result = predict_yield(sample_data)
if "error" in result:
    print(f"Prediction Error: {result['error']}")
else:
    print(f"Yield: {result['yield']}")
    print(f"Confidence: {result['confidence']}")
    print("Feature Importance Sample:")
    for feat, imp in list(result['feature_importance'].items())[:3]:
        print(f"  {feat}: {imp:.4f}")

    advisory = get_smart_advisory(sample_data, result)
    print("\nAdvisory Preview:")
    print(f"  Irrigation: {advisory['irrigation']}")
