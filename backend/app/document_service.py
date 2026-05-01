from datetime import datetime
from .db import documents_collection


def add_document_record(
    username: str,
    filename: str,
    summary: str,
    extracted_text: str,
    keywords: list[str],
    relevant_sections: list[str],
):
    last_doc = documents_collection.find_one(sort=[("id", -1)])
    next_id = 1 if not last_doc else last_doc["id"] + 1

    record = {
        "id": next_id,
        "username": username,
        "filename": filename,
        "summary": summary,
        "extracted_text": extracted_text[:3000],
        "keywords": keywords,
        "relevant_sections": relevant_sections,
        "uploaded_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }

    documents_collection.insert_one(record)

    record["_id"] = str(record["_id"])
    return record


def list_documents(username: str):
    items = list(documents_collection.find({"username": username}, {"_id": 0}))
    return items[::-1]


def delete_document(doc_id: int, username: str):
    result = documents_collection.delete_one({
        "id": doc_id,
        "username": username,
    })
    return result.deleted_count > 0