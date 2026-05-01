export type QueryRequest = {
  question: string;
  jurisdiction: string;
  document_text?: string;
  document_name?: string;
};

export type FollowUpRequest = {
  original_query: string;
  follow_up_question: string;
  jurisdiction: string;
};

export type QueryResponse = {
  answer: string;
  confidence: number;
  jurisdiction: string;
  disclaimer: string;
  explanation?: string;
  relevant_sections?: string[];
  warning?: string | null;
  follow_up_questions?: string[];
  recommend_lawyer?: boolean;
  unsupported_query?: boolean;
  ambiguity_detected?: boolean;
};

export type UploadResponse = {
  filename: string;
  summary: string;
  extracted_text: string;
  relevant_sections: string[];
  keywords: string[];
};

export type HistoryItem = {
  question: string;
  answer: string;
  confidence: number;
  jurisdiction?: string;
  timestamp?: string;
  relevant_sections?: string[];
};

export type SaveResponseRequest = {
  question: string;
  answer: string;
  confidence: number;
};

export type SavedResponseItem = {
  id: number;
  username: string;
  question: string;
  answer: string;
  confidence: number;
};

export type SectionDetailResponse = {
  act: string;
  section: string;
  section_title: string;
  description: string;
};

export type DocumentItem = {
  id: number;
  filename: string;
  summary: string;
  extracted_text: string;
  keywords: string[];
  relevant_sections: string[];
  uploaded_at: string;
};

export type LegalNewsItem = {
  title: string;
  link?: string;
  url?: string;
  published?: string;
  source?: string;
};

export type RegisterRequest = {
  username: string;
  password: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  username: string;
};

const API_BASE_URL = "http://127.0.0.1:8000";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

function authUploadHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function registerUser(payload: RegisterRequest) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Registration failed");
  }

  return response.json();
}

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Login failed");
  }

  return response.json();
}

export async function submitLegalQuery(
  payload: QueryRequest
): Promise<QueryResponse> {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch response from backend");
  }

  return response.json();
}

export async function submitFollowUpQuery(
  payload: FollowUpRequest
): Promise<QueryResponse> {
  const response = await fetch(`${API_BASE_URL}/follow-up`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch follow-up response");
  }

  return response.json();
}

export async function uploadPdf(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload-pdf`, {
    method: "POST",
    headers: authUploadHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to upload PDF");
  }

  return response.json();
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/history`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }

  return response.json();
}

export async function saveResponse(
  payload: SaveResponseRequest
): Promise<SavedResponseItem> {
  const response = await fetch(`${API_BASE_URL}/save-response`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to save response");
  }

  return response.json();
}

export async function fetchSavedResponses(): Promise<SavedResponseItem[]> {
  const response = await fetch(`${API_BASE_URL}/saved-responses`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch saved responses");
  }

  return response.json();
}

export async function fetchSectionDetail(
  act: string,
  section: string
): Promise<SectionDetailResponse> {
  const response = await fetch(
    `${API_BASE_URL}/section-detail?act=${act}&section=${section}`
  );

  if (!response.ok) {
    throw new Error("Failed to load section details");
  }

  return response.json();
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch documents");
  }

  return response.json();
}

export async function deleteDocument(
  docId: number
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/documents/${docId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to delete document");
  }

  return response.json();
}

export async function fetchLegalNews(): Promise<LegalNewsItem[]> {
  const response = await fetch(`${API_BASE_URL}/legal-news`);

  if (!response.ok) {
    throw new Error("Failed to fetch legal news");
  }

  return response.json();
}

export const getSavedResponses = fetchSavedResponses;
export const getQueryHistory = fetchHistory;