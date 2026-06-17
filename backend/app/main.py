from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import dataset_routes, model_routes, assessment_routes

app = FastAPI(
    title="E-Nose Diabetes Detection AI Healthcare Platform API",
    description="Refactored production-grade MVC API supporting hyperparameter tuning, model training, SHAP explainability, and patient diagnostic reporting.",
    version="2.0.0"
)

# Enable CORS for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount MVC sub-routers
app.include_router(dataset_routes.router)
app.include_router(model_routes.router)
app.include_router(assessment_routes.router)

@app.get("/")
def read_root():
    return {
        "status": "healthy", 
        "service": "E-Nose Diabetes Detection AI Healthcare Platform API",
        "description": "Electronic Nose (E-Nose) Sensor Data Processing, Prediction, and Diagnostics"
    }

