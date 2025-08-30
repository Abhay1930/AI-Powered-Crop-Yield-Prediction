

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import warnings
warnings.filterwarnings('ignore')

def train_crop_yield_model():
    print("🌾 Loading crop production dataset...")
    
    # Load the dataset
    df = pd.read_csv('data/crop_production.csv')
    
    print(f"Dataset shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()}")
    
    # Clean the data
    print("🧹 Cleaning data...")
    
    # Remove rows with missing values
    df = df.dropna()
    
    # Clean numeric columns
    df['Area'] = pd.to_numeric(df['Area'], errors='coerce')
    df['Production'] = pd.to_numeric(df['Production'], errors='coerce')
    df['Crop_Year'] = pd.to_numeric(df['Crop_Year'], errors='coerce')
    
    # Remove rows with invalid numeric values
    df = df.dropna(subset=['Area', 'Production', 'Crop_Year'])
    
    # Remove rows with zero or negative values
    df = df[(df['Area'] > 0) & (df['Production'] > 0) & (df['Crop_Year'] > 1900)]
    
    # Clean text columns
    df['State_Name'] = df['State_Name'].str.strip()
    df['District_Name'] = df['District_Name'].str.strip()
    df['Season'] = df['Season'].str.strip()
    df['Crop'] = df['Crop'].str.strip()
    
    # Remove rows with empty text values
    df = df[(df['State_Name'] != '') & (df['District_Name'] != '') & 
            (df['Season'] != '') & (df['Crop'] != '')]
    
    print(f"Cleaned dataset shape: {df.shape}")
    
    # Create features
    print("🔧 Creating features...")
    
    # Encode categorical variables
    le_state = LabelEncoder()
    le_district = LabelEncoder()
    le_season = LabelEncoder()
    le_crop = LabelEncoder()
    
    df['state_encoded'] = le_state.fit_transform(df['State_Name'])
    df['district_encoded'] = le_district.fit_transform(df['District_Name'])
    df['season_encoded'] = le_season.fit_transform(df['Season'])
    df['crop_encoded'] = le_crop.fit_transform(df['Crop'])
    
    # Create additional features
    df['year_normalized'] = (df['Crop_Year'] - df['Crop_Year'].min()) / (df['Crop_Year'].max() - df['Crop_Year'].min())
    
    # Calculate yield per hectare
    df['yield_per_hectare'] = df['Production'] / df['Area']
    
    # Remove outliers from yield_per_hectare (keep 95th percentile)
    q95 = df['yield_per_hectare'].quantile(0.95)
    df = df[df['yield_per_hectare'] <= q95]
    
    print(f"Final dataset shape: {df.shape}")
    
    # Select features for training
    feature_columns = ['state_encoded', 'district_encoded', 'season_encoded', 
                      'crop_encoded', 'year_normalized', 'Area']
    
    X = df[feature_columns]
    y = df['Production']  # Predict production
    
    print(f"Feature columns: {feature_columns}")
    print(f"Target: Production")
    
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
    
    # Evaluate model
    y_pred = model.predict(X_test_scaled)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"📊 Model Performance:")
    print(f"Mean Squared Error: {mse:.2f}")
    print(f"R² Score: {r2:.4f}")
    print(f"Root Mean Squared Error: {np.sqrt(mse):.2f}")
    
    # Save model and encoders
    print("💾 Saving model and encoders...")
    joblib.dump(model, 'crop_yield_model.pkl')
    joblib.dump(scaler, 'scaler.pkl')
    joblib.dump(le_state, 'label_encoders/state_encoder.pkl')
    joblib.dump(le_district, 'label_encoders/district_encoder.pkl')
    joblib.dump(le_season, 'label_encoders/season_encoder.pkl')
    joblib.dump(le_crop, 'label_encoders/crop_encoder.pkl')
    
    # Save unique values for frontend
    unique_states = sorted(df['State_Name'].unique())
    unique_districts = sorted(df['District_Name'].unique())
    unique_seasons = sorted(df['Season'].unique())
    unique_crops = sorted(df['Crop'].unique())
    
    # Create a mapping for districts by state
    district_state_mapping = {}
    for state in unique_states:
        districts = sorted(df[df['State_Name'] == state]['District_Name'].unique())
        district_state_mapping[state] = districts
    
    # Save mappings
    import json
    with open('data/unique_values.json', 'w') as f:
        json.dump({
            'states': unique_states,
            'districts': unique_districts,
            'seasons': unique_seasons,
            'crops': unique_crops,
            'district_state_mapping': district_state_mapping
        }, f, indent=2)
    
    print("✅ Model training completed successfully!")
    print(f"📈 Model can predict crop production for:")
    print(f"   - {len(unique_states)} states")
    print(f"   - {len(unique_districts)} districts")
    print(f"   - {len(unique_seasons)} seasons")
    print(f"   - {len(unique_crops)} crops")

if __name__ == "__main__":
    # Create label_encoders directory if it doesn't exist
    import os
    os.makedirs('label_encoders', exist_ok=True)
    
    train_crop_yield_model()
