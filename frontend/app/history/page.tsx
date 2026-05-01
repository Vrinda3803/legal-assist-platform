"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { fetchHistory, HistoryItem } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const router = useRouter();
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
const token = localStorage.getItem("token");

if (!token) {
  router.push("/login");
  return;
}

const result = await fetchHistory();
        setHistory(result);
      } catch (err) {
        console.error(err);
        setError("Failed to load query history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-area">
        <Navbar
          title="Query History"
          subtitle="Review your previous legal conversations and saved answers."
        />

        {loading ? (
          <div className="history-empty">Loading history...</div>
        ) : error ? (
          <div className="history-empty">{error}</div>
        ) : history.length === 0 ? (
          <div className="history-empty">No history available yet.</div>
        ) : (
          <div className="card">
            <h2 className="card-title">Conversation Timeline</h2>

            <div className="chat-flow">
              {history.map((item, index) => (
                <div key={`${item.question}-${index}`}>
                  <div className="chat-user-row">
                    <div className="chat-user-bubble">{item.question}</div>
                  </div>

                  <div className="chat-ai-row">
                    <div className="chat-avatar">N</div>

                    <div className="chat-ai-bubble">
                      <div className="chat-header">
                        <span>Nyaya Assistant</span>
                        <span className="badge confidence">
                          Confidence: {item.confidence}%
                        </span>
                      </div>

                      <p className="history-answer">{item.answer}</p>

                      {(item.jurisdiction || item.timestamp) && (
                        <div className="history-small-meta">
                          {item.jurisdiction && <span>{item.jurisdiction}</span>}
                          {item.timestamp && <span>{item.timestamp}</span>}
                        </div>
                      )}

                      {item.relevant_sections?.length > 0 && (
                        <div className="chat-sections">
                          {item.relevant_sections.map((section, secIndex) => (
                            <span
                              key={`${section}-${secIndex}`}
                              className="section-chip"
                            >
                              {section}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}