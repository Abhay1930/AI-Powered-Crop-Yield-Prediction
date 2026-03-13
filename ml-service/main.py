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
    ph: float
    nitrogen: float
    moisture: float
    fertilizer_usage: float

@app.get("/")
def read_root():
    return {"status": "ML Service is running"}

@app.post("/predict")
def predict(data: CropData):
    # Convert Pydantic model to dict
    data_dict = data.model_dump()
    
    # Get model prediction
    yield_prediction = predict_yield(data_dict)
    
    # Get smart advisory based on data
    advisory = get_smart_advisory(data_dict, yield_prediction)
    
    return {
        "yield_prediction": yield_prediction,
        "advisory": advisory
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
