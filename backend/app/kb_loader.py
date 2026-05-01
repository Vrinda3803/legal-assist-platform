from pathlib import Path
import json

BASE_DIR = Path(__file__).resolve().parent.parent
KB_DIR = BASE_DIR / "knowledge_base"


def load_json_file(filename: str):
    path = KB_DIR / filename

    if not path.exists():
        raise FileNotFoundError(f"Knowledge base file not found: {filename}")

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_knowledge_base():
    return {
        "ipc": load_json_file("ipc.json"),
        "crpc": load_json_file("crpc.json"),
    }