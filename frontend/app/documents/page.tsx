"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { fetchDocuments, deleteDocument, DocumentItem } from "../../lib/api";

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDocuments = async () => {
  try {
    setLoading(true);
    const username = localStorage.getItem("nyaya_user") || "guest";
    const data = await fetchDocuments(username);
    setDocuments(data.reverse());
  } catch (error) {
    console.error("Failed to load documents:", error);
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (docId: number) => {
  try {
    const username = localStorage.getItem("nyaya_user") || "guest";
    await deleteDocument(docId, username);
    await loadDocuments();
  } catch (error) {
    console.error("Failed to delete document:", error);
    alert("Failed to delete document.");
  }
};

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-area">
        <Navbar
          title="My Documents"
          subtitle="Browse uploaded legal documents, summaries, extracted text, and matched provisions."
        />

        <section className="documents-grid">
          {loading ? (
            <div className="card">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="card">No uploaded documents yet.</div>
          ) : (
            documents.map((doc) => (
              <div className="card" key={doc.id}>
                <div className="card-header-row">
                  <div>
                    <h2 className="card-title">{doc.filename}</h2>
                    <p className="muted-text">Uploaded: {doc.uploaded_at}</p>
                    
                  </div>

                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                  >
                    Delete
                  </button>
                </div>

                <div style={{ height: 16 }} />

                <div className="list">
                  <div className="list-item">
                    <strong>Summary</strong>
                    <p className="response-text">{doc.summary}</p>
                  </div>

                  <div className="list-item">
                    <strong>Keywords</strong>
                    <p className="response-text">
                      {doc.keywords?.length > 0 ? doc.keywords.join(", ") : "No keywords available."}
                    </p>
                  </div>

                  <div className="list-item">
                    <strong>Matched Legal Sections</strong>
                    {doc.relevant_sections?.length > 0 ? (
                      doc.relevant_sections.map((section, index) => (
                        <div key={`${doc.id}-${index}`} className="list-item section-button">
                          {section}
                        </div>
                      ))
                    ) : (
                      <p>No matched sections available.</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}