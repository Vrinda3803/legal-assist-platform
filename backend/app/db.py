import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "nyaya_legal_db")

client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB_NAME]

users_collection = db["users"]
history_collection = db["query_history"]
saved_collection = db["saved_responses"]
documents_collection = db["documents"]