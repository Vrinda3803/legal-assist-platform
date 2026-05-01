import re
from .kb_loader import load_json_file
from .semantic_search import semantic_rerank


def normalize_text(text: str) -> str:
    return str(text).lower().strip()


def get_section_number(record: dict):
    return (
        record.get("section")
        or record.get("Section")
        or record.get("section_number")
        or record.get("id")
        or "Unknown"
    )


def get_title(record: dict):
    return (
        record.get("section_title")
        or record.get("title")
        or record.get("heading")
        or record.get("name")
        or record.get("offence")
        or "No title available"
    )


def get_description(record: dict):
    return (
        record.get("section_desc")
        or record.get("description")
        or record.get("text")
        or record.get("content")
        or record.get("definition")
        or ""
    )


def extract_section_references(question: str) -> list[str]:
    q = normalize_text(question)

    patterns = [
        r"\bsection\s+(\d+[a-zA-Z]?)\b",
        r"\bipc\s+(\d+[a-zA-Z]?)\b",
        r"\bcrpc\s+(\d+[a-zA-Z]?)\b",
        r"\bu/s\s+(\d+[a-zA-Z]?)\b",
    ]

    refs = []
    for pattern in patterns:
        matches = re.findall(pattern, q)
        refs.extend(matches)

    return list(set(refs))


def extract_search_terms(question: str):
    question = normalize_text(question)

    keyword_map = {
        "theft": ["theft", "steal", "stolen", "stealing", "robbery"],
        "cheating": ["cheating", "cheat", "fraud", "dishonest", "scam"],
        "criminal intimidation": ["criminal intimidation", "threat", "intimidation"],
        "hurt": ["hurt", "injury", "assault", "beating"],
        "murder": ["murder", "kill", "homicide"],
        "arrest": ["arrest", "police arrest", "arrest procedure", "detained"],
        "bail": ["bail", "anticipatory bail", "regular bail"],
        "fir": ["fir", "first information report", "complaint"],
        "dowry": ["dowry", "dowry harassment"],
        "domestic violence": ["domestic violence", "abuse", "cruelty"],
        "divorce": ["divorce", "grounds for divorce"],
        "marriage": ["marriage", "valid marriage"],
        "succession": ["succession", "inheritance", "property rights", "ancestral property"],
        "property": ["property", "ownership", "partition"],
        "kidnapping": ["kidnap", "kidnapping", "abduction"],
        "defamation": ["defamation", "reputation", "false statement"],
    }

    matched_terms = []

    for _, words in keyword_map.items():
        for word in words:
            if word in question:
                matched_terms.append(word)

    matched_terms.extend(extract_section_references(question))

    if not matched_terms:
        stop_words = {
    "what", "how", "why", "when", "where", "is", "are", "the", "a", "an",
    "for", "of", "to", "in", "on", "and", "or", "with", "under", "about",
    "please", "tell", "me", "my", "case", "issue", "problem",
    "can", "you", "this", "that", "explain", "easy", "easily",
    "simple", "simply", "understand", "help"
}
        matched_terms = [
            w for w in question.split()
            if len(w) > 2 and w not in stop_words
        ]

    return list(set(matched_terms))


def score_record(record: dict, search_terms: list[str]) -> int:
    title = normalize_text(get_title(record))
    desc = normalize_text(get_description(record))
    section_no = normalize_text(get_section_number(record))

    score = 0

    for term in search_terms:
        term = normalize_text(term)

        if not term:
            continue

        if term == section_no:
            score += 15

        if term == title:
            score += 10

        if term in title:
            score += 6

        if term in desc:
            score += 3

        if term.isdigit():
            if term in title:
                score += 4
            if term in desc:
                score += 2

    return score


def deduplicate_records(records: list[dict]) -> list[dict]:
    seen = set()
    unique_records = []

    for record in records:
        key = (
            normalize_text(get_section_number(record)),
            normalize_text(get_title(record)),
        )
        if key not in seen:
            seen.add(key)
            unique_records.append(record)

    return unique_records


def search_sections_in_records(records, search_terms):
    scored_matches = []

    for record in records:
        score = score_record(record, search_terms)
        if score > 0:
            scored_matches.append((score, record))

    scored_matches.sort(key=lambda x: x[0], reverse=True)

    top_records = [record for score, record in scored_matches]
    top_records = deduplicate_records(top_records)

    return top_records[:5]


def filter_by_section_refs(records: list[dict], section_refs: list[str]) -> list[dict]:
    if not section_refs:
        return records

    ref_set = {normalize_text(ref) for ref in section_refs}

    filtered = []
    for record in records:
        section_no = normalize_text(get_section_number(record))
        if section_no in ref_set:
            filtered.append(record)

    return filtered


def search_legal_knowledge(question: str):
    ipc_records = load_json_file("ipc.json")
    crpc_records = load_json_file("crpc.json")

    question_lower = normalize_text(question)
    search_terms = extract_search_terms(question)
    section_refs = extract_section_references(question)

    ipc_matches = []
    crpc_matches = []

    if "ipc" in question_lower:
        ipc_matches = search_sections_in_records(ipc_records, search_terms)
        ipc_matches = filter_by_section_refs(ipc_matches, section_refs) or ipc_matches
        ipc_matches = semantic_rerank(question, ipc_matches, top_k=5)
        crpc_matches = []

    elif "crpc" in question_lower:
        crpc_matches = search_sections_in_records(crpc_records, search_terms)
        crpc_matches = filter_by_section_refs(crpc_matches, section_refs) or crpc_matches
        crpc_matches = semantic_rerank(question, crpc_matches, top_k=5)
        ipc_matches = []

    else:
        ipc_matches = search_sections_in_records(ipc_records, search_terms)
        crpc_matches = search_sections_in_records(crpc_records, search_terms)

        ipc_matches = semantic_rerank(question, ipc_matches, top_k=5)
        crpc_matches = semantic_rerank(question, crpc_matches, top_k=5)

    return {
        "search_terms": search_terms,
        "ipc_matches": ipc_matches,
        "crpc_matches": crpc_matches,
    }