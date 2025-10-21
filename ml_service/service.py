from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import os

try:
    import tflite_runtime.interpreter as tflite  # type: ignore
except Exception:
    tflite = None  # optional

app = FastAPI(title="WarriorBot ML Service", version="0.2.0")

class Features(BaseModel):
    pain_level: int
    hydration_ml: int
    activity_level: int
    heart_rate: int
    spo2: int
    temperature_c: float
    relative_humidity: float
    pressure_hpa: float

_interpreter = None
_input_details = None
_output_details = None

FEATURE_ORDER = [
    "pain_level",
    "hydration_ml",
    "activity_level",
    "heart_rate",
    "spo2",
    "temperature_c",
    "relative_humidity",
    "pressure_hpa",
]

def _load_tflite():
    global _interpreter, _input_details, _output_details
    model_path = os.getenv("TFLITE_MODEL_PATH")
    if not model_path or not tflite:
        return False
    try:
        _interpreter = tflite.Interpreter(model_path=model_path)
        _interpreter.allocate_tensors()
        _input_details = _interpreter.get_input_details()
        _output_details = _interpreter.get_output_details()
        return True
    except Exception:
        _interpreter = None
        return False

_tflite_loaded = _load_tflite()

@app.get("/info")
async def info():
    return {"tflite_loaded": bool(_interpreter is not None)}


def _score_fallback(feat: Features):
    x = np.array([
        feat.pain_level/10,
        max(0, (1500 - feat.hydration_ml))/1500,
        feat.activity_level/10,
        max(0, (feat.heart_rate - 80))/80,
        max(0, (95 - feat.spo2))/10,
        max(0, (18 - feat.temperature_c))/18,
        max(0, (feat.relative_humidity - 85))/15,
    ], dtype=np.float32)
    w = np.array([1.2, 0.8, 0.4, 0.3, 0.7, 0.2, 0.2], dtype=np.float32)
    z = float(np.dot(x, w))
    prob = 1/(1+np.exp(-z))
    prob = max(0.0, min(1.0, prob))
    explanations = [
        {"factor": "pain", "weight": float(w[0]), "note": "Higher reported pain raises risk"},
        {"factor": "hydration", "weight": float(w[1]), "note": "Low hydration increases risk"},
        {"factor": "spo2", "weight": float(w[4]), "note": "Low oxygen saturation increases risk"},
    ]
    return prob, explanations


def _score_tflite(feat: Features):
    if _interpreter is None:
        return None
    try:
        vec = np.array([getattr(feat, k) for k in FEATURE_ORDER], dtype=np.float32)
        # reshape to (1, n)
        if _input_details:
            inp = _input_details[0]
            input_data = vec.reshape(inp['shape']).astype(inp['dtype']) if -1 in inp['shape'] or vec.size == np.prod(inp['shape']) else vec[np.newaxis, :].astype(inp['dtype'])
            _interpreter.set_tensor(inp['index'], input_data)
        else:
            return None
        _interpreter.invoke()
        out = _interpreter.get_tensor(_output_details[0]['index'])
        prob = float(out.flatten()[0])
        prob = max(0.0, min(1.0, prob))
        # No feature attribution from generic TFLite; return empty explanations
        return prob, []
    except Exception:
        return None

@app.post("/score")
async def score(feat: Features):
    if _interpreter is not None:
        res = _score_tflite(feat)
        if res is not None:
            prob, explanations = res
            return {"risk_score": round(prob, 3), "explanations": explanations}
    # fallback
    prob, explanations = _score_fallback(feat)
    return {"risk_score": round(prob, 3), "explanations": explanations}
