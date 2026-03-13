from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from model import predict_yield, get_smart_advisory

app = FastAPI(title="KrishiAI ML Service")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CropData(BaseModel):
    crop_type: str
    temperature: float
    humidity: float
    rainfall: float
    soil_ph: float
    soil_n: float
    soil_p: float
    soil_k: float
    fertilizer: float
    pesticide: float

@app.get("/")
def read_root():
    return {"status": "ML Service is running"}

@app.post("/predict")
def predict(data: CropData):
    # Convert Pydantic model to dict
    data_dict = data.model_dump()
    
    # Get model prediction
    prediction_result = predict_yield(data_dict)
    
    if "error" in prediction_result:
        return prediction_result

    # Get smart advisory based on data
    advisory = get_smart_advisory(data_dict, prediction_result)
    
    return {
        "yield": prediction_result["yield"],
        "confidence": prediction_result["confidence"],
        "feature_importance": prediction_result["feature_importance"],
        "advisory": advisory
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
