# backend/main.py — Quick-Legal FastAPI Backend (v2.0)
# Run: uvicorn main:app --reload --port 8000

import os, json, re, logging
from typing import Optional

import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from dotenv import load_dotenv
from prompts import SYSTEM_PROMPT, build_user_prompt

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

# ── FastAPI ───────────────────────────────────────────────────────────────────
app = FastAPI(title="Quick-Legal API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Gemini Setup ──────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY missing. backend/.env file check karo.")

genai.configure(api_key=GEMINI_API_KEY)

# FIX 1: model_name= keyword nahi, positional argument use karo
# FIX 2: genai.GenerationConfig ki jagah plain dict use karo
# FIX 3: Auto-fallback — agar ek model kaam na kare toh dusra try karo
MODELS_TO_TRY = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.0-pro",
    "gemini-pro",
]

def get_working_model():
    """Available models mein se pehla working model return karta hai."""
    try:
        available = [m.name for m in genai.list_models()
                     if "generateContent" in m.supported_generation_methods]
        log.info(f"Available models: {available}")
        for model_name in MODELS_TO_TRY:
            full_name = f"models/{model_name}"
            if full_name in available or model_name in available:
                log.info(f"Using model: {model_name}")
                return model_name
        # Fallback: list mein se pehla generateContent wala
        if available:
            name = available[0].replace("models/", "")
            log.info(f"Fallback model: {name}")
            return name
    except Exception as e:
        log.warning(f"Could not list models: {e}")
    return "gemini-1.5-flash"

MODEL_NAME = get_working_model()

# FIX: Correct initialization — no keyword, plain dict config
gemini_model = genai.GenerativeModel(
    MODEL_NAME,
    system_instruction=SYSTEM_PROMPT,
    generation_config={
        "temperature": 0.2,
        "max_output_tokens": 4096,
    }
)

log.info(f"Quick-Legal API ready — Model: {MODEL_NAME}")

# ── Models ────────────────────────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    text: str

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 100:
            raise ValueError("Kam se kam 100 characters ka T&C paste karo.")
        return v

class RedFlag(BaseModel):
    title: str
    severity: str
    explanation: str
    quote: Optional[str] = None

class AnalyzeResponse(BaseModel):
    privacy_score: int
    score_label: str
    one_line_summary: str
    red_flags: list[RedFlag]
    positives: list[str]
    verdict: str
    truncated: bool = False
    model_used: str = MODEL_NAME

# ── JSON Extractor ────────────────────────────────────────────────────────────
def extract_json(raw: str) -> dict:
    """Gemini response se JSON extract karta hai — 3 fallback strategies."""
    # Strategy 1: Direct parse
    try:
        return json.loads(raw.strip())
    except json.JSONDecodeError:
        pass
    # Strategy 2: Markdown code blocks hataao
    cleaned = re.sub(r"```(?:json)?", "", raw).replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    # Strategy 3: Regex se { } dhundho
    match = re.search(r"\{[\s\S]*\}", raw)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    raise ValueError(f"Valid JSON nahi mila. Raw: {raw[:300]}")

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"status": "online", "service": "Quick-Legal API", "version": "2.0.0", "model": MODEL_NAME}

@app.get("/models")
async def list_available_models():
    """Available Gemini models check karne ke liye."""
    try:
        models = [
            {"name": m.name, "supports_generate": "generateContent" in m.supported_generation_methods}
            for m in genai.list_models()
        ]
        return {"models": models, "current": MODEL_NAME}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_document(request: AnalyzeRequest):
    """Main endpoint — T&C text analyze karta hai."""
    TEXT_LIMIT = 100000
    was_truncated = len(request.text) > TEXT_LIMIT
    log.info(f"Analyzing {len(request.text)} chars | truncated={was_truncated}")

    # Step 1: Prompt build karo
    prompt = build_user_prompt(request.text)

    # Step 2: Gemini call
    try:
        response = gemini_model.generate_content(prompt)
        raw = response.text
        log.info(f"Gemini responded: {len(raw)} chars")
    except Exception as e:
        log.error(f"Gemini error: {e}")
        # FIX: Better error messages
        err = str(e)
        if "429" in err or "quota" in err.lower():
            raise HTTPException(status_code=429, detail="API quota exceed ho gayi. Thodi der baad try karo.")
        if "404" in err or "not found" in err.lower():
            raise HTTPException(status_code=503, detail=f"Model '{MODEL_NAME}' available nahi. /models endpoint check karo.")
        raise HTTPException(status_code=503, detail=f"AI service error: {err}")

    # Step 3: JSON parse karo
    try:
        parsed = extract_json(raw)
    except ValueError as e:
        log.error(f"JSON parse failed: {e}")
        raise HTTPException(status_code=500, detail="AI ne galat format diya. Dobara try karo.")

    # Step 4: Score clamp + cleanup
    parsed["privacy_score"] = max(1, min(10, int(parsed.get("privacy_score", 5))))
    parsed["truncated"] = was_truncated
    parsed["model_used"] = MODEL_NAME

    # Step 5: Validate + return
    try:
        result = AnalyzeResponse(**parsed)
        log.info(f"Done — Score:{result.privacy_score}/10 | Verdict:{result.verdict} | Flags:{len(result.red_flags)}")
        return result
    except Exception as e:
        log.error(f"Validation error: {e}")
        raise HTTPException(status_code=500, detail=f"Response invalid: {str(e)}")