from pydantic import BaseModel, Field
from typing import List, Optional


class QueryRequest(BaseModel):
    question: str
    jurisdiction: str="India"
    username: str="guest"
    document_text: Optional[str] = None
    document_name: Optional[str] = None


class QueryResponse(BaseModel):
    answer: str
    confidence: int
    jurisdiction: str
    disclaimer: str
    explanation: Optional[str] = None
    relevant_sections: List[str] = Field(default_factory=list)
    warning: Optional[str] = None
    follow_up_questions: List[str] = Field(default_factory=list)
    recommend_lawyer: bool = False
    unsupported_query: bool = False
    ambiguity_detected: bool = False



class UploadResponse(BaseModel):
    filename: str
    summary: str
    extracted_text: str
    relevant_sections: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)


class SectionDetailResponse(BaseModel):
    act: str
    section: str
    section_title: str
    description: str
   


class HistoryItem(BaseModel):
    question: str
    answer: str
    confidence: int
 


class SavedResponseItem(BaseModel):
    id: int
    username: str = "guest"
    question: str
    answer: str
    confidence: int
  


class SaveResponseRequest(BaseModel):
    username: str = "guest"
    question: str
    answer: str
    confidence: int
   


class FollowUpRequest(BaseModel):
    original_query: str
    follow_up_question: str
    jurisdiction: str="India"
    username: str = "guest"
    


class SessionDeleteResponse(BaseModel):
    message: str
   
class DocumentItem(BaseModel):
    id: int
    filename: str
    summary: str
    extracted_text: str
    keywords: List[str] = []
    relevant_sections: List[str] = []
    uploaded_at: str
    


class DeleteDocumentResponse(BaseModel):
    message: str
    

class LegalNewsItem(BaseModel):
    title: str
    link: str
    published: str
    source: str
    


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    username: str
  

class LoginRequest(BaseModel):
    username: str
    password: str
    


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    username: str


class RegisterRequest(BaseModel):
    username: str
    password: str