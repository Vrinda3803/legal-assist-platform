from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from typing import Optional
import PyPDF2
import json
import os

router = APIRouter()

# ====================== LOAD ALL KNOWLEDGE BASE FILES ======================
KNOWLEDGE_BASE = []

knowledge_dir = os.path.join(os.path.dirname(__file__), "../../knowledge_base")

# List of all your JSON files
json_files = ["laws.json", "ipc.json", "crpc.json"]

for filename in json_files:
    filepath = os.path.join(knowledge_dir, filename)
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                # If the file contains a list, extend directly
                if isinstance(data, list):
                    KNOWLEDGE_BASE.extend(data)
                # If it's a dict with "laws" or similar key, handle it
                elif isinstance(data, dict):
                    for key in data:
                        if isinstance(data[key], list):
                            KNOWLEDGE_BASE.extend(data[key])
        except Exception as e:
            print(f"Warning: Could not load {filename} - {e}")

print(f"✅ Loaded {len(KNOWLEDGE_BASE)} legal provisions from knowledge base")

# ====================== REQUEST MODEL ======================
class QueryRequest(BaseModel):
    query: str
    jurisdiction: str = "India"

# ====================== MAIN ENDPOINT ======================
@router.post("/query")
async def get_legal_answer(
    query: str = None,
    jurisdiction: str = "India",
    file: UploadFile = File(None)
):
    # Handle file upload (PDF or TXT)
    extracted_text = ""
    if file:
        if file.filename.lower().endswith(".pdf"):
            pdf = PyPDF2.PdfReader(file.file)
            for page in pdf.pages:
                extracted_text += page.extract_text() or ""
        else:
            extracted_text = (await file.read()).decode("utf-8", errors="ignore")

    # Combine text query + document content
    full_query = (query or "") + " " + extracted_text

    # ====================== RAG - Find Best Matching Law ======================
    best_match = None
    max_score = 0

    q_lower = full_query.lower()

    for law in KNOWLEDGE_BASE:
        score = 0

        # Jurisdiction bonus
        if str(law.get("jurisdiction", "")).lower() == jurisdiction.lower():
            score += 30

        # Keyword matching
        keywords = law.get("keywords", []) or [law.get("section", "").lower()]
        for kw in keywords:
            if isinstance(kw, str) and kw.lower() in q_lower:
                score += 15

        # Title / Section matching
        if str(law.get("section", "")).lower() in q_lower or str(law.get("title", "")).lower() in q_lower:
            score += 25

        if score > max_score:
            max_score = score
            best_match = law

    # ====================== Generate Response ======================
    if best_match and max_score >= 20:
        answer = best_match.get("plain_summary") or best_match.get("description", "No summary available.")
        confidence = min(75 + (max_score * 2), 95)
    else:
        answer = "I have reviewed your query and the uploaded document. Please provide more specific details (section number, act name, or key facts) for a more accurate response."
        confidence = 45

    return {
        "answer": answer,
        "jurisdiction": jurisdiction,
        "confidence": confidence,
        "disclaimer": "⚠️ This is AI-generated information for educational purposes only. It is NOT a substitute for professional legal advice. Always consult a qualified lawyer.",
        "ambiguity": "Query looks clear." if len(full_query.strip()) > 40 else "Please add more details for higher accuracy."
    }