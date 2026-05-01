from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

_model = SentenceTransformer("all-MiniLM-L6-v2")


def build_record_text(record: dict) -> str:
    parts = [
        str(record.get("section", "")),
        str(record.get("Section", "")),
        str(record.get("section_title", "")),
        str(record.get("title", "")),
        str(record.get("heading", "")),
        str(record.get("description", "")),
        str(record.get("section_desc", "")),
        str(record.get("text", "")),
        str(record.get("content", "")),
    ]
    return " ".join([p for p in parts if p]).strip()


def semantic_rerank(query: str, records: list[dict], top_k: int = 5) -> list[dict]:
    if not records:
        return []

    query_embedding = _model.encode([query])
    record_texts = [build_record_text(record) for record in records]
    record_embeddings = _model.encode(record_texts)

    scores = cosine_similarity(query_embedding, record_embeddings)[0]

    ranked = sorted(
        zip(scores, records),
        key=lambda x: x[0],
        reverse=True,
    )

    return [record for _, record in ranked[:top_k]]