"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { fetchSavedResponses, SavedResponseItem } from "../../lib/api";

export default function SavedPage() {
  const router = useRouter();
  const [savedResponses, setSavedResponses] = useState<SavedResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSavedResponses = async () => {
      try {
        setLoading(true);
        const username = localStorage.getItem("nyaya_user");

if (!username) {
  router.push("/login");
  return;
}

const result = await fetchSavedResponses(username);
        setSavedResponses(result);
      } catch (err) {
        console.error(err);
        setError("Failed to load saved responses.");
      } finally {
        setLoading(false);
      }
    };

    loadSavedResponses();
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-area">
        <Navbar
          title="Saved Responses"
          subtitle="Access your bookmarked legal explanations and results."
        />

        <div className="card">
          <h2 className="card-title">Bookmarked Legal Responses</h2>

          {loading ? (
            <p className="muted-text">Loading saved responses...</p>
          ) : error ? (
            <p className="muted-text">{error}</p>
          ) : savedResponses.length === 0 ? (
            <p className="muted-text">No saved responses yet.</p>
          ) : (
            <div className="list">
              {savedResponses.map((item) => (
                <div key={item.id} className="list-item">
                  <p>
                    <strong>Question:</strong> {item.question}
                  </p>
                  <div style={{ height: 8 }} />
                  <p className="muted-text">
                    <strong>Answer:</strong> {item.answer}
                  </p>
                  <div style={{ height: 8 }} />
                  <p className="muted-text">
                    <strong>Confidence:</strong> {item.confidence}%
                  </p>
                  <p className="muted-text">
                    <strong>Jurisdiction:</strong> {item.jurisdiction}
                  </p>
                  <p className="muted-text">
                    <strong>Timestamp:</strong> {item.timestamp}
                  </p>

                  {item.relevant_sections?.length > 0 && (
                    <>
                      <div style={{ height: 10 }} />
                      <p>
                        <strong>Relevant Sections:</strong>
                      </p>
                      <div className="list" style={{ marginTop: 8 }}>
                        {item.relevant_sections.map((section, index) => (
                          <div key={index} className="list-item">
                            {section}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}