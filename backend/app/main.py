from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi import Depends
from .auth_middleware import get_current_username
from fastapi.middleware.cors import CORSMiddleware
from .schemas import LoginRequest, LoginResponse, RegisterRequest
from .auth_service import login_user, register_user
from .news_service import fetch_legal_news
from .document_service import add_document_record, list_documents, delete_document
from .schemas import (
    QueryRequest,
    QueryResponse,
    UploadResponse,
    SectionDetailResponse,
    HistoryItem,
    SavedResponseItem,
    SaveResponseRequest,
    FollowUpRequest,
    SessionDeleteResponse,
    DocumentItem,
    DeleteDocumentResponse,

    LegalNewsItem,
)
from .legal_service import process_legal_query, process_followup_query
from .upload_service import (
    save_uploaded_file,
    extract_text_from_pdf,
    build_summary,
    extract_keywords,
)
from .kb_search import search_legal_knowledge
from .section_service import find_section_detail
from .history_service import (
    save_query_history,
    get_user_history,
    clear_user_history
)
from .saved_service import save_response, get_all_saved_responses

app = FastAPI(title="Nyaya Legal Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.post("/register")
def register(payload: RegisterRequest):
    return register_user(payload.username, payload.password)

@app.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    return login_user(payload.username, payload.password)


@app.get("/")
def home():
    return {"message": "Nyaya backend is running"}

@app.post("/register")
def register(payload: RegisterRequest):
    return register_user(payload.username, payload.password)

@app.post("/query", response_model=QueryResponse)
def handle_query(
    payload: QueryRequest,
    username: str = Depends(get_current_username),
):
    result = process_legal_query(payload.question, payload.jurisdiction)
    save_query_history(username, payload.question, result, payload.jurisdiction)
    return result


@app.post("/follow-up", response_model=QueryResponse)
def handle_follow_up(
    payload: FollowUpRequest,
    username: str = Depends(get_current_username),
):
    result = process_followup_query(
        original_query=payload.original_query,
        follow_up_question=payload.follow_up_question,
        jurisdiction=payload.jurisdiction,
    )

    save_query_history(username, payload.follow_up_question, result, payload.jurisdiction)
    return result

@app.get("/history")
def get_history(username: str = Depends(get_current_username)):
    return get_user_history(username)

@app.delete("/session", response_model=SessionDeleteResponse)
def delete_session(username: str = Depends(get_current_username)):
    clear_user_history(username)
    return SessionDeleteResponse(message="Session cleared successfully.")

@app.post("/save-response", response_model=SavedResponseItem)
def create_saved_response(
    payload: SaveResponseRequest,
    username: str = Depends(get_current_username),
):
    return save_response(username, payload)

@app.get("/saved-responses", response_model=list[SavedResponseItem])
def fetch_saved_responses(username: str = Depends(get_current_username)):
    return get_all_saved_responses(username)


@app.post("/upload-pdf", response_model=UploadResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    username: str = Depends(get_current_username),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    file_bytes = await file.read()
    saved_path = save_uploaded_file(file.filename, file_bytes)

    extracted_text = extract_text_from_pdf(saved_path)

    if not extracted_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract readable text from the PDF."
        )

    summary = build_summary(extracted_text)
    keywords = extract_keywords(extracted_text)
    kb_result = search_legal_knowledge(extracted_text[:2000])

    ipc_matches = kb_result.get("ipc_matches", [])
    crpc_matches = kb_result.get("crpc_matches", [])

    relevant_sections = []

    for r in ipc_matches:
        section_value = r.get("Section") or r.get("section")
        title_value = r.get("section_title") or r.get("title") or ""
        relevant_sections.append(
            f"IPC - Section {section_value}: {title_value}".strip()
        )

    for r in crpc_matches:
        section_value = r.get("section")
        title_value = r.get("section_title") or r.get("title") or ""
        relevant_sections.append(
            f"CrPC - Section {section_value}: {title_value}".strip()
        )

    add_document_record(
        filename=file.filename,
        username=username,
        summary=summary,
        extracted_text=extracted_text,
        keywords=keywords,
        relevant_sections=relevant_sections,
    )

    return UploadResponse(
        filename=file.filename,
        summary=summary,
        extracted_text=extracted_text[:3000],
        relevant_sections=relevant_sections,
        keywords=keywords,
    )

@app.get("/section-detail", response_model=SectionDetailResponse)
def get_section_detail(
    act: str = Query(...),
    section: str = Query(...),
):
    result = find_section_detail(act, section)

    if not result:
        raise HTTPException(status_code=404, detail="Section not found.")

    return SectionDetailResponse(**result)


@app.get("/documents", response_model=list[DocumentItem])
def fetch_documents(username: str = Depends(get_current_username)):
    return list_documents(username)


@app.delete("/documents/{doc_id}", response_model=DeleteDocumentResponse)
def remove_document(
    doc_id: int,
    username: str = Depends(get_current_username),
):
    deleted = delete_document(doc_id, username)

    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found.")

    return DeleteDocumentResponse(message="Document deleted successfully.")

@app.get("/legal-news")
async def get_legal_news():
    return fetch_legal_news()
