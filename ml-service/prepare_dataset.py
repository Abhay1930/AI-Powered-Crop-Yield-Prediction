import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import os

# Define paths
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
CROP_YIELD_PATH = os.path.join(DATA_DIR, 'crop_yield.csv')
SOIL_DATA_PATH = os.path.join(DATA_DIR, 'state_soil_data.csv')
WEATHER_DATA_PATH = os.path.join(DATA_DIR, 'state_weather_data_1997_2020.csv')
OUTPUT_PATH = os.path.join(DATA_DIR, 'final_dataset.csv')

def prepare_dataset():
    print("Loading datasets...")
    # Load datasets
    # Handle possible BOM in state_soil_data.csv
    crop_yield = pd.read_csv(CROP_YIELD_PATH)
    soil = pd.read_csv(SOIL_DATA_PATH, encoding='utf-8-sig') # Handle potential BOM
    weather = pd.read_csv(WEATHER_DATA_PATH)

    print("Initial column names:")
    print(f"Crop Yield: {crop_yield.columns.tolist()}")
    print(f"Soil: {soil.columns.tolist()}")
    print(f"Weather: {weather.columns.tolist()}")

    # 1. Standardize column names for Weather
    # Weather: state,year,avg_temp_c,total_rainfall_mm,avg_humidity_percent
    weather.rename(columns={
        'total_rainfall_mm': 'rainfall',
        'avg_temp_c': 'temperature',
        'avg_humidity_percent': 'humidity'
    }, inplace=True)

    # 2. Standardize column names for Soil
    # Soil: state,N,P,K,pH
    soil.rename(columns={
        'N': 'soil_N',
        'P': 'soil_P',
        'K': 'soil_K',
        'pH': 'soil_pH'
    }, inplace=True)

    # 3. Merge weather into crop_yield (state + year)
    print("Merging crop_yield and weather...")
    # Clean up state names (strip whitespace)
    crop_yield['state'] = crop_yield['state'].str.strip()
    weather['state'] = weather['state'].str.strip()
    soil['state'] = soil['state'].str.strip()

    # Inner merge crop_yield and weather on state + year
    df = pd.merge(crop_yield, weather, on=['state', 'year'], how='inner')

    # 4. Merge soil data (state)
    print("Adding soil data...")
    df = pd.merge(df, soil, on='state', how='left')

    # 5. Cleaning
    print("Cleaning data...")
    # Remove duplicates
    initial_rows = len(df)
    df.drop_duplicates(inplace=True)
    print(f"Removed {initial_rows - len(df)} duplicates.")

    # Fill missing values with mean for numeric columns
    numeric_cols = df.select_dtypes(include=['number']).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())

    # 6. Normalize numeric features
    # Columns to normalize: rainfall, temperature, humidity, fertilizer, pesticide, soil_N, soil_P, soil_K, soil_pH, yield
    cols_to_normalize = ['rainfall', 'temperature', 'humidity', 'fertilizer', 'pesticide', 'soil_N', 'soil_P', 'soil_K', 'soil_pH', 'yield']
    
    # Ensure all target columns exist before normalizing
    available_cols = [col for col in cols_to_normalize if col in df.columns]
    print(f"Normalizing columns: {available_cols}")

    scaler = MinMaxScaler()
    df[available_cols] = scaler.fit_transform(df[available_cols])
    
    # Save scaler for future use in prediction
    import joblib
    scaler_path = os.path.join(os.path.dirname(__file__), 'scaler.joblib')
    joblib.dump(scaler, scaler_path)
    print(f"Saved scaler to {scaler_path}")
    target_columns = ['state', 'year', 'crop', 'rainfall', 'temperature', 'humidity', 'fertilizer', 'pesticide', 'soil_N', 'soil_P', 'soil_K', 'soil_pH', 'yield']
    # Keep only columns that exist (in case some are missing in source)
    final_cols = [col for col in target_columns if col in df.columns]
    df = df[final_cols]

    # Save final dataset
    print(f"Saving final dataset to {OUTPUT_PATH}...")
    df.to_csv(OUTPUT_PATH, index=False)
    print("Done!")

if __name__ == "__main__":
    prepare_dataset()
