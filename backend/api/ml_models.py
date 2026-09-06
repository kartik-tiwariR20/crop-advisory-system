"""
Loads the trained crop & fertilizer recommendation pipelines (built in the
`Recommendation models/*.ipynb` notebooks) and exposes simple, cached
`predict_crop(...)` / `predict_fertilizer(...)` helper functions for the API
views to use.

The pickles were created with `joblib.dump(pipeline, ...)` where `pipeline`
is an instance of a small custom class (`CropPipeline` / `FertilizerPipeline`)
that stores a Keras model as JSON + weights (so it doesn't depend on a
particular TF/Keras binary format) plus the fitted scikit-learn
preprocessing objects. To unpickle them we must define classes with the same
name/shape here - that's exactly what `CropPipeline` and `FertilizerPipeline`
below do.
"""
import os
import sys
import threading

import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ML_MODELS_DIR = os.path.join(BASE_DIR, "ml_models")

CROP_PIPELINE_PATH = os.path.join(ML_MODELS_DIR, "crop_pipeline.pkl")
FERTILIZER_PIPELINE_PATH = os.path.join(ML_MODELS_DIR, "fertilizer_pipeline.pkl")

# Order of numeric features the crop model was trained on.
CROP_FEATURE_ORDER = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]

# Columns (in any order, as a dict) the fertilizer model expects.
FERTILIZER_FEATURE_COLUMNS = [
    "Soil_Type", "Soil_pH", "Soil_Moisture", "Organic_Carbon",
    "Nitrogen_Level", "Phosphorus_Level", "Potassium_Level",
    "Temperature", "Humidity", "Rainfall",
    "Crop_Type", "Crop_Growth_Stage", "Season", "Irrigation_Type",
]

# Valid categorical values (as learned by the OneHotEncoder). Exposed via the
# /api/predict/options/ endpoint so the frontend can render dropdowns.
FERTILIZER_OPTIONS = {
    "Soil_Type": ["Clay", "Loamy", "Sandy", "Silt"],
    "Crop_Type": ["Cotton", "Maize", "Potato", "Rice", "Sugarcane", "Tomato", "Wheat"],
    "Crop_Growth_Stage": ["Flowering", "Harvest", "Sowing", "Vegetative"],
    "Season": ["Kharif", "Rabi", "Zaid"],
    "Irrigation_Type": ["Canal", "Drip", "Rainfed", "Sprinkler"],
}


class CropPipeline:
    """Mirrors the class defined in crop_recommendation_system.ipynb."""

    def __init__(self, model=None, scaler=None, label_encoder=None):
        self.model_config = model
        self.model_weights = model
        self.scaler = scaler
        self.label_encoder = label_encoder

    def predict(self, X):
        from keras.models import model_from_json

        model = model_from_json(self.model_config)
        model.set_weights(self.model_weights)
        X_scaled = self.scaler.transform(X)
        probs = model.predict(X_scaled, verbose=0)
        idx = probs.argmax(axis=1)
        confidence = probs.max(axis=1)
        return self.label_encoder.inverse_transform(idx), confidence


class FertilizerPipeline:
    """Mirrors the class defined in fertilizer_recommendation_system.ipynb."""

    def __init__(self, model=None, preprocessor=None, label_encoder=None):
        self.model_config = model
        self.model_weights = model
        self.preprocessor = preprocessor
        self.label_encoder = label_encoder

    def predict(self, X):
        from keras.models import model_from_json

        model = model_from_json(self.model_config)
        model.set_weights(self.model_weights)
        X_processed = self.preprocessor.transform(X)
        probs = model.predict(X_processed, verbose=0)
        idx = probs.argmax(axis=1)
        confidence = probs.max(axis=1)
        return self.label_encoder.inverse_transform(idx), confidence


# Make the classes resolvable under `__main__`, which is what joblib recorded
# them under when the notebooks pickled them.
sys.modules.setdefault("__main__", sys.modules[__name__])
if not hasattr(sys.modules["__main__"], "CropPipeline"):
    sys.modules["__main__"].CropPipeline = CropPipeline
if not hasattr(sys.modules["__main__"], "FertilizerPipeline"):
    sys.modules["__main__"].FertilizerPipeline = FertilizerPipeline

_lock = threading.Lock()
_crop_pipeline = None
_fertilizer_pipeline = None


def get_crop_pipeline():
    global _crop_pipeline
    if _crop_pipeline is None:
        with _lock:
            if _crop_pipeline is None:
                _crop_pipeline = joblib.load(CROP_PIPELINE_PATH)
    return _crop_pipeline


def get_fertilizer_pipeline():
    global _fertilizer_pipeline
    if _fertilizer_pipeline is None:
        with _lock:
            if _fertilizer_pipeline is None:
                _fertilizer_pipeline = joblib.load(FERTILIZER_PIPELINE_PATH)
    return _fertilizer_pipeline


def predict_crop(n, p, k, temperature, humidity, ph, rainfall):
    pipeline = get_crop_pipeline()
    row = [[float(n), float(p), float(k), float(temperature), float(humidity), float(ph), float(rainfall)]]
    labels, confidence = pipeline.predict(row)
    return str(labels[0]), float(confidence[0])


def predict_fertilizer(**kwargs):
    import pandas as pd

    pipeline = get_fertilizer_pipeline()
    row = {col: kwargs[col] for col in FERTILIZER_FEATURE_COLUMNS}
    df = pd.DataFrame([row])
    labels, confidence = pipeline.predict(df)
    return str(labels[0]), float(confidence[0])
