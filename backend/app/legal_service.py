from .schemas import QueryResponse
from .kb_search import search_legal_knowledge


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


def format_section(record: dict, act_name: str) -> str:
    section_no = get_section_number(record)
    title = get_title(record)
    return f"{act_name} - Section {section_no}: {title}"


def is_document_followup_query(question: str, document_text: str | None) -> bool:
    if not document_text:
        return False

    q = question.lower().strip()

    document_followups = [
        "explain this",
        "explain this simply",
        "can you explain this",
        "can you explain this simply",
        "what does this mean",
        "summarize this",
        "what is written here",
        "tell me this simply",
        "explain the document",
        "explain this to me",
        "explain this simply",
        "can you explain this simply",
    ]

    return any(phrase in q for phrase in document_followups)


def build_document_context_answer(
    question: str,
    document_name: str | None,
    document_text: str,
) -> str:
    clean_text = " ".join(document_text.split())

    if not clean_text:
        return "The uploaded document does not contain enough readable text to explain."

    intro = "This explanation is based on the uploaded document"
    if document_name:
        intro += f" ({document_name})"
    intro += ". "

    if "summarize" in question.lower():
        return intro + clean_text[:700] + ("..." if len(clean_text) > 700 else "")

    return (
        intro
        + "In simple terms, the document appears to discuss the following content: "
        + clean_text[:700]
        + ("..." if len(clean_text) > 700 else "")
    )


def is_incomplete_input(question: str) -> bool:
    q = question.strip().lower()

    if len(q) < 12:
        return True

    vague_inputs = {
        "help",
        "legal help",
        "problem",
        "case",
        "issue",
        "law",
        "ipc",
        "crpc",
        "section",
        "tell me law",
        "what to do",
    }

    vague_phrases = [
        "explain this",
        "explain to me",
        "tell me simply",
        "explain simply",
        "can you explain",
        "can you explain this",
        "help me understand",
        "explain this to me",
        "tell me this",
        "explain it",
    ]

    if q in vague_inputs:
        return True

    if any(phrase in q for phrase in vague_phrases):
        return True

    return False


def detect_ambiguity(question: str) -> bool:
    q = question.lower()

    ambiguous_terms = [
        "problem",
        "issue",
        "case",
        "matter",
        "legal issue",
        "something happened",
        "trouble",
        "dispute",
        "this",
        "that",
    ]

    count = sum(1 for term in ambiguous_terms if term in q)
    return count >= 1 and len(q.split()) < 10


def generate_follow_up_questions(question: str) -> list[str]:
    q = question.lower()
    follow_ups = []

    if "arrest" in q:
        follow_ups.extend([
            "Was the arrest made with a warrant or without a warrant?",
            "Which state or jurisdiction is this related to?",
        ])

    elif "theft" in q or "stolen" in q:
        follow_ups.extend([
            "What exactly was stolen?",
            "Do you know when and where the theft happened?",
        ])

    elif "cheating" in q or "fraud" in q:
        follow_ups.extend([
            "What was the nature of the fraud or cheating involved?",
            "Did any money, property, or documents change hands?",
        ])

    elif "bail" in q:
        follow_ups.extend([
            "Is this a regular bail or anticipatory bail situation?",
            "Which offence sections are involved in the case?",
        ])

    elif "fir" in q or "first information report" in q:
        follow_ups.extend([
            "Is the matter related to a cognizable offence?",
            "Do you want the procedure for filing an FIR or its legal meaning?",
        ])

    elif "property" in q or "succession" in q:
        follow_ups.extend([
            "Is the property ancestral or self-acquired?",
            "What is the relationship between the parties involved?",
        ])

    elif "marriage" in q or "divorce" in q:
        follow_ups.extend([
            "Which personal law applies in this case?",
            "Can you share the main facts or issue involved?",
        ])

    else:
        follow_ups.extend([
            "Can you describe the legal issue more specifically?",
            "Do you want information about a law, a section number, or a procedure?",
        ])

    return follow_ups[:3]
def build_structured_answer(
    overview: str,
    ipc_matches: list,
    crpc_matches: list,
) -> str:
    lines = []

    lines.append("Overview:")
    lines.append(overview)
    lines.append("")

    if ipc_matches or crpc_matches:
        lines.append("Relevant provisions include:")

        for record in ipc_matches[:2]:
            lines.append(
                f"- IPC Section {get_section_number(record)}: {get_title(record)}"
            )

        for record in crpc_matches[:3]:
            lines.append(
                f"- CrPC Section {get_section_number(record)}: {get_title(record)}"
            )

        lines.append("")

    lines.append("Practical note:")
    lines.append(
        "The exact legal position depends on the specific facts, the applicable law, and the procedural context."
    )

    return "\n".join(lines)

def build_plain_answer(question: str, ipc_matches: list, crpc_matches: list) -> str:
    q = question.lower().strip()

    if not ipc_matches and not crpc_matches:
        return (
            "The system could not find a strong direct provision match in the current "
            "knowledge base. Please refine the query with more legal details or keywords."
        )

    if "bail" in q:
        overview = (
            "Bail is a legal mechanism through which a person accused of an offence may "
            "be released from custody, usually on certain conditions, while ensuring "
            "that the person appears before the court when required. The rules differ "
            "depending on whether the offence is bailable or non-bailable, and whether "
            "the matter involves regular bail or anticipatory bail."
        )
        return build_structured_answer(overview, ipc_matches, crpc_matches)

    elif "fir" in q or "first information report" in q:
        overview = (
            "An FIR, or First Information Report, is the initial information recorded by "
            "the police when they receive information about the commission of a cognizable "
            "offence. It is important because it formally starts the criminal law process."
        )
        return build_structured_answer(overview, ipc_matches, crpc_matches)

    elif "arrest" in q:
        overview = (
            "Arrest is the legal act of taking a person into custody under the authority "
            "of law. The legality of an arrest depends on procedural safeguards, the nature "
            "of the offence, and whether the arrest is made with or without a warrant."
        )
        return build_structured_answer(overview, ipc_matches, crpc_matches)

    elif "cheating" in q or "ipc 420" in q or "section 420" in q:
        overview = (
            "Section 420 IPC generally deals with cheating and dishonestly inducing delivery "
            "of property. It applies where a person deceives another and dishonestly causes "
            "that person to deliver property or alter valuable security."
        )
        return build_structured_answer(overview, ipc_matches, crpc_matches)

    elif "theft" in q:
        overview = (
            "Theft generally refers to dishonestly taking movable property out of another "
            "person’s possession without that person’s consent. The IPC defines theft and "
            "also provides punishment provisions related to it."
        )
        return build_structured_answer(overview, ipc_matches, crpc_matches)

    elif "murder" in q or "section 302" in q or "ipc 302" in q:
        overview = (
            "Murder is one of the most serious offences under criminal law. Under the IPC, "
            "it refers to culpable homicide that satisfies the specific legal conditions for "
            "being treated as murder."
        )
        return build_structured_answer(overview, ipc_matches, crpc_matches)

    elif "divorce" in q:
        overview = (
            "Divorce is the legal dissolution of marriage through a competent court. "
            "The applicable grounds and procedure depend on the personal law governing "
            "the parties, such as Hindu law, Muslim law, or other applicable family law systems."
        )
        return build_structured_answer(overview, ipc_matches, crpc_matches)

    elif "marriage" in q:
        overview = (
            "Marriage in law refers to a legally recognized union governed by the applicable "
            "personal law or statutory law. Legal validity depends on conditions such as age, "
            "consent, prohibited relationship rules, and required ceremony or registration requirements."
        )
        return build_structured_answer(overview, ipc_matches, crpc_matches)

    elif "property" in q or "succession" in q or "inheritance" in q:
        overview = (
            "Property and succession law deal with ownership, inheritance, and transfer of "
            "property rights. The exact legal position depends on whether the property is "
            "ancestral or self-acquired, the relationship between the parties, and the law that applies."
        )
        return build_structured_answer(overview, ipc_matches, crpc_matches)

    elif "domestic violence" in q:
        overview = (
            "Domestic violence refers to abuse or harmful conduct within a domestic relationship. "
            "The legal response may involve both protective civil remedies and, in some situations, "
            "criminal law provisions depending on the facts."
        )
        return build_structured_answer(overview, ipc_matches, crpc_matches)

    else:
        top_match = ipc_matches[0] if ipc_matches else (crpc_matches[0] if crpc_matches else None)
        title = get_title(top_match)
        description = get_description(top_match)

        answer = f"The query appears related to {title}."
        if description:
            short_desc = description.strip().replace("\n", " ")
            answer += f" {short_desc[:400]}"
            if len(short_desc) > 400:
                answer += "..."

        summary_lines = []

        for record in ipc_matches[:2]:
            summary_lines.append(
                f"IPC - Section {get_section_number(record)}: {get_title(record)}"
            )

        for record in crpc_matches[:3]:
            summary_lines.append(
                f"CrPC - Section {get_section_number(record)}: {get_title(record)}"
            )

        if summary_lines:
            answer += "\n\nRelevant provisions include:\n"
            for line in summary_lines:
                answer += f"- {line}\n"

        return answer

def compute_confidence(
    ipc_matches: list,
    crpc_matches: list,
    ambiguous: bool,
    incomplete: bool,
    vague_nonlegal: bool,
) -> int:
    total_matches = len(ipc_matches) + len(crpc_matches)

    if incomplete or vague_nonlegal:
        return 30

    if total_matches >= 5:
        score = 88
    elif total_matches >= 3:
        score = 80
    elif total_matches >= 1:
        score = 72
    else:
        score = 45

    if ambiguous:
        score -= 12

    return max(score, 25)


def build_warning(
    incomplete: bool,
    ambiguous: bool,
    confidence: int,
    vague_nonlegal: bool,
) -> str | None:
    if vague_nonlegal:
        return (
            "Your query is too general or unclear. Please mention the legal topic, "
            "section number, offence, document, or procedure you want explained."
        )

    if incomplete:
        return (
            "The input appears incomplete. Please provide more details so the system "
            "can identify the relevant legal provisions more accurately."
        )

    if ambiguous:
        return (
            "The query appears ambiguous. The system may need clarification before "
            "giving a more precise legal information response."
        )

    if confidence < 50:
        return (
            "The system has low confidence in this response because the query could "
            "not be matched strongly to the current knowledge base."
        )

    return None


def build_explanation(document_mode: bool = False) -> str:
    if document_mode:
        return (
            "The response was generated using the uploaded document as context, "
            "with a simplified explanation based on the extracted document text."
        )

    return (
        "The response was generated by matching your query against the IPC and CrPC "
        "knowledge base using keyword-based retrieval over section titles and descriptions, "
        "followed by plain-language summarization and confidence estimation."
    )


def build_disclaimer() -> str:
    return (
        "This platform provides legal information for educational and assistance "
        "purposes only. It does not replace advice from a qualified lawyer."
    )


def is_unsupported_query(question: str, ipc_matches: list, crpc_matches: list) -> bool:
    q = question.lower()

    unsupported_topics = [
        "predict court outcome",
        "who will win",
        "draft legal notice",
        "draft contract",
        "file case for me",
        "give final legal advice",
        "write affidavit",
    ]

    if any(term in q for term in unsupported_topics):
        return True

    if len(ipc_matches) == 0 and len(crpc_matches) == 0 and len(q.split()) > 4:
        return True

    return False


def is_vague_nonlegal_query(question: str) -> bool:
    q = question.strip().lower()

    vague_only_phrases = [
        "can you explain this to me",
        "can you explain this to me easily",
        "can you explain this simply",
        "explain this to me easily",
        "explain this simply",
        "explain this",
        "tell me this",
        "help me understand this",
        "what is this",
    ]

    if q in vague_only_phrases:
        return True

    nonlegal_words = {
        "this", "that", "easy", "easily", "simple", "simply", "explain",
        "tell", "help", "understand", "please", "me", "you", "can"
    }

    words = [w for w in q.split() if w]
    if words and all(w in nonlegal_words for w in words):
        return True

    return False


def recommend_lawyer(confidence: int, unsupported_query: bool) -> bool:
    return confidence < 50 or unsupported_query


def process_legal_query(
    question: str,
    jurisdiction: str,
    document_text: str | None = None,
    document_name: str | None = None,
) -> QueryResponse:
    document_followup = is_document_followup_query(question, document_text)

    if document_followup:
        answer = build_document_context_answer(question, document_name, document_text or "")
        return QueryResponse(
            answer=answer,
            confidence=82,
            jurisdiction=jurisdiction,
            disclaimer=build_disclaimer(),
            explanation=build_explanation(document_mode=True),
            relevant_sections=[],
            warning=None,
            follow_up_questions=[
                "Do you want a short summary of this document?",
                "Do you want me to explain the important legal sections in this document?",
            ],
            recommend_lawyer=False,
            unsupported_query=False,
            ambiguity_detected=False,
        )

    incomplete = is_incomplete_input(question)
    ambiguous = detect_ambiguity(question)
    vague_nonlegal = is_vague_nonlegal_query(question)

    ipc_matches = []
    crpc_matches = []

    if not vague_nonlegal:
        result = search_legal_knowledge(question)
        ipc_matches = result.get("ipc_matches", [])
        crpc_matches = result.get("crpc_matches", [])

    relevant_sections = []

    for record in ipc_matches:
        relevant_sections.append(format_section(record, "IPC"))

    for record in crpc_matches:
        relevant_sections.append(format_section(record, "CrPC"))

    unsupported_query = is_unsupported_query(question, ipc_matches, crpc_matches)

    if vague_nonlegal:
        answer = (
            "Please provide the legal topic or issue you want explained. "
            "For example, you can ask things like 'What is bail?', 'What is IPC 420?', "
            "or 'Explain FIR in simple language.'"
        )
    elif unsupported_query and not relevant_sections:
        answer = (
            "This query is either outside the supported scope of the current legal "
            "information system or needs more specific legal details. The platform can "
            "help with legal information retrieval and explanation, but not with final "
            "legal advice, drafting, or outcome prediction."
        )
    else:
        answer = build_plain_answer(question, ipc_matches, crpc_matches)

    confidence = compute_confidence(
        ipc_matches=ipc_matches,
        crpc_matches=crpc_matches,
        ambiguous=ambiguous,
        incomplete=incomplete,
        vague_nonlegal=vague_nonlegal,
    )

    warning = build_warning(
        incomplete=incomplete,
        ambiguous=ambiguous,
        confidence=confidence,
        vague_nonlegal=vague_nonlegal,
    )

    follow_up_questions = []
    if vague_nonlegal or incomplete or ambiguous or confidence < 75:
        follow_up_questions = generate_follow_up_questions(question)

    return QueryResponse(
        answer=answer,
        confidence=confidence,
        jurisdiction=jurisdiction,
        disclaimer=build_disclaimer(),
        explanation=build_explanation(),
        relevant_sections=relevant_sections,
        warning=warning,
        follow_up_questions=follow_up_questions,
        recommend_lawyer=recommend_lawyer(confidence, unsupported_query),
        unsupported_query=unsupported_query,
        ambiguity_detected=ambiguous,
    )


def process_followup_query(
    original_query: str,
    follow_up_question: str,
    jurisdiction: str,
) -> QueryResponse:
    combined_query = f"{original_query}. Additional details: {follow_up_question}"
    return process_legal_query(combined_query, jurisdiction)

