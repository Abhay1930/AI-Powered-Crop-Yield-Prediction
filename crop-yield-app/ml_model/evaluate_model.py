import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    mean_squared_error, 
    r2_score, 
    mean_absolute_error,
    mean_absolute_percentage_error,
    explained_variance_score,
    max_error
)
import joblib
import warnings
warnings.filterwarnings('ignore')

def evaluate_crop_yield_model():
    print("🌾 Loading crop production dataset...")
    
    # Load the dataset
    df = pd.read_csv('data/crop_production.csv')
    
    # Clean the data (same as training)
    df = df.dropna()
    df['Area'] = pd.to_numeric(df['Area'], errors='coerce')
    df['Production'] = pd.to_numeric(df['Production'], errors='coerce')
    df['Crop_Year'] = pd.to_numeric(df['Crop_Year'], errors='coerce')
    df = df.dropna(subset=['Area', 'Production', 'Crop_Year'])
    df = df[(df['Area'] > 0) & (df['Production'] > 0) & (df['Crop_Year'] > 1900)]
    
    df['State_Name'] = df['State_Name'].str.strip()
    df['District_Name'] = df['District_Name'].str.strip()
    df['Season'] = df['Season'].str.strip()
    df['Crop'] = df['Crop'].str.strip()
    
    df = df[(df['State_Name'] != '') & (df['District_Name'] != '') & 
            (df['Season'] != '') & (df['Crop'] != '')]
    
    # Create features
    le_state = LabelEncoder()
    le_district = LabelEncoder()
    le_season = LabelEncoder()
    le_crop = LabelEncoder()
    
    df['state_encoded'] = le_state.fit_transform(df['State_Name'])
    df['district_encoded'] = le_district.fit_transform(df['District_Name'])
    df['season_encoded'] = le_season.fit_transform(df['Season'])
    df['crop_encoded'] = le_crop.fit_transform(df['Crop'])
    
    df['year_normalized'] = (df['Crop_Year'] - df['Crop_Year'].min()) / (df['Crop_Year'].max() - df['Crop_Year'].min())
    df['yield_per_hectare'] = df['Production'] / df['Area']
    
    q95 = df['yield_per_hectare'].quantile(0.95)
    df = df[df['yield_per_hectare'] <= q95]
    
    # Select features
    feature_columns = ['state_encoded', 'district_encoded', 'season_encoded', 
                      'crop_encoded', 'year_normalized', 'Area']
    
    X = df[feature_columns]
    y = df['Production']
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    print("🤖 Training Random Forest model...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train_scaled, y_train)
    
    # Make predictions
    y_pred = model.predict(X_test_scaled)
    
    # Calculate comprehensive regression metrics
    print("\n" + "="*60)
    print("📊 COMPREHENSIVE REGRESSION MODEL EVALUATION")
    print("="*60)
    
    # 1. R² Score (Coefficient of Determination)
    r2 = r2_score(y_test, y_pred)
    print(f"\n1. R² Score (Coefficient of Determination): {r2:.4f}")
    print(f"   → Model explains {r2*100:.2f}% of the variance in crop production")
    print(f"   → This is your primary accuracy metric")
    
    # 2. Mean Squared Error (MSE)
    mse = mean_squared_error(y_test, y_pred)
    print(f"\n2. Mean Squared Error (MSE): {mse:,.2f}")
    print(f"   → Average squared difference between predicted and actual values")
    
    # 3. Root Mean Squared Error (RMSE)
    rmse = np.sqrt(mse)
    print(f"\n3. Root Mean Squared Error (RMSE): {rmse:,.2f} tons")
    print(f"   → Average prediction error in the same units as production (tons)")
    
    # 4. Mean Absolute Error (MAE)
    mae = mean_absolute_error(y_test, y_pred)
    print(f"\n4. Mean Absolute Error (MAE): {mae:,.2f} tons")
    print(f"   → Average absolute difference between predicted and actual values")
    
    # 5. Mean Absolute Percentage Error (MAPE)
    mape = mean_absolute_percentage_error(y_test, y_pred) * 100
    print(f"\n5. Mean Absolute Percentage Error (MAPE): {mape:.2f}%")
    print(f"   → Average percentage error in predictions")
    
    # 6. Explained Variance Score
    ev_score = explained_variance_score(y_test, y_pred)
    print(f"\n6. Explained Variance Score: {ev_score:.4f}")
    print(f"   → Proportion of variance explained by the model")
    
    # 7. Max Error
    max_err = max_error(y_test, y_pred)
    print(f"\n7. Maximum Error: {max_err:,.2f} tons")
    print(f"   → Largest prediction error in the test set")
    
    # 8. Cross-Validation Score
    print(f"\n8. Cross-Validation R² Score (5-fold):")
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='r2')
    print(f"   → CV Scores: {cv_scores}")
    print(f"   → Mean CV R²: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    
    # 9. Additional Metrics
    print(f"\n9. Additional Performance Metrics:")
    
    # Calculate percentage of predictions within different error ranges
    errors = np.abs(y_test - y_pred)
    within_10_percent = np.mean(errors <= 0.1 * y_test) * 100
    within_20_percent = np.mean(errors <= 0.2 * y_test) * 100
    within_50_percent = np.mean(errors <= 0.5 * y_test) * 100
    
    print(f"   → Predictions within 10% of actual: {within_10_percent:.1f}%")
    print(f"   → Predictions within 20% of actual: {within_20_percent:.1f}%")
    print(f"   → Predictions within 50% of actual: {within_50_percent:.1f}%")
    
    # 10. Model Summary
    print(f"\n" + "="*60)
    print("🎯 MODEL SUMMARY")
    print("="*60)
    print(f"✅ Primary Accuracy (R²): {r2*100:.2f}%")
    print(f"✅ Average Error (RMSE): {rmse:,.0f} tons")
    print(f"✅ Percentage Error (MAPE): {mape:.1f}%")
    print(f"✅ Predictions within 20%: {within_20_percent:.1f}%")
    
    # Performance Rating
    if r2 >= 0.9:
        rating = "EXCELLENT"
    elif r2 >= 0.8:
        rating = "VERY GOOD"
    elif r2 >= 0.7:
        rating = "GOOD"
    elif r2 >= 0.6:
        rating = "FAIR"
    else:
        rating = "POOR"
    
    print(f"\n🏆 Overall Performance Rating: {rating}")
    
    return {
        'r2': r2,
        'mse': mse,
        'rmse': rmse,
        'mae': mae,
        'mape': mape,
        'ev_score': ev_score,
        'max_error': max_err,
        'cv_mean': cv_scores.mean(),
        'cv_std': cv_scores.std(),
        'within_10_percent': within_10_percent,
        'within_20_percent': within_20_percent,
        'within_50_percent': within_50_percent
    }

if __name__ == "__main__":
    evaluate_crop_yield_model()
