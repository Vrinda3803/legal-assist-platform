from datetime import datetime
from .db import db


history_collection = db["query_history"]


def save_query_history(username, question, response, jurisdiction="India"):
    record = {
        "username": username,
        "question": question,
        "answer": response.answer,
        "confidence": response.confidence,
        "jurisdiction": jurisdiction,
        "relevant_sections": response.relevant_sections,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }

    history_collection.insert_one(record)


def get_user_history(username):
    records = history_collection.find({"username": username}).sort("timestamp", -1)

    history = []
    for item in records:
        item["_id"] = str(item["_id"])
        history.append(item)

    return history


def clear_user_history(username):
    history_collection.delete_many({"username": username})