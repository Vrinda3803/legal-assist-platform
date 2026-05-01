from pathlib import Path
from pypdf import PdfReader
import re
from collections import Counter


BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def save_uploaded_file(file_name: str, file_bytes: bytes) -> Path:
    safe_name = file_name.replace(" ", "_")
    save_path = UPLOAD_DIR / safe_name

    with open(save_path, "wb") as f:
        f.write(file_bytes)

    return save_path


def extract_text_from_pdf(pdf_path: Path) -> str:
    try:
        reader = PdfReader(str(pdf_path))
        extracted_pages = []

        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_pages.append(text)

        return "\n".join(extracted_pages).strip()

    except Exception:
        return ""


def build_summary(text: str, max_length: int = 500) -> str:
    clean_text = " ".join(text.split())

    if not clean_text:
        return "No readable text could be extracted from the uploaded document."

    if len(clean_text) <= max_length:
        return clean_text

    return clean_text[:max_length] + "..."


def extract_keywords(text: str, top_n: int = 10) -> list[str]:
    words = re.findall(r"[A-Za-z]{4,}", text.lower())

    stop_words = {
        "this", "that", "with", "from", "have", "been", "were", "they",
        "their", "which", "shall", "under", "into", "about", "here",
        "there", "where", "when", "what", "your", "such", "more",
        "than", "also", "would", "could", "should", "section"
    }

    filtered = [w for w in words if w not in stop_words]
    counts = Counter(filtered)

    return [word for word, _ in counts.most_common(top_n)]