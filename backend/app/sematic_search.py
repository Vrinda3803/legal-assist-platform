from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def build_corpus(records):
    texts = []
    for r in records:
        text = f"{r.get('title')} {r.get('description')}"
        texts.append(text)
    return texts


def semantic_search(query, records, top_k=5):
    corpus = build_corpus(records)

    vectorizer = TfidfVectorizer(stop_words="english")
    X = vectorizer.fit_transform(corpus)
    q_vec = vectorizer.transform([query])

    scores = cosine_similarity(q_vec, X)[0]

    ranked = sorted(
        zip(records, scores),
        key=lambda x: x[1],
        reverse=True
    )

    return [r[0] for r in ranked[:top_k]]