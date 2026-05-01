from .db import saved_collection
from .schemas import SaveResponseRequest, SavedResponseItem


def save_response(username: str, payload: SaveResponseRequest) -> SavedResponseItem:
    last_item = saved_collection.find_one(sort=[("id", -1)])
    next_id = 1 if not last_item else last_item["id"] + 1

    item = {
        "id": next_id,
        "username": username,
        "question": payload.question,
        "answer": payload.answer,
        "confidence": payload.confidence,
    }

    saved_collection.insert_one(item)
    return SavedResponseItem(**item)


def get_all_saved_responses(username: str) -> list[SavedResponseItem]:
    items = list(saved_collection.find({"username": username}, {"_id": 0}))
    return [SavedResponseItem(**item) for item in items[::-1]]