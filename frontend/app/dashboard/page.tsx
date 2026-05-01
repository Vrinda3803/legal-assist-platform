"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import QueryInput from "../components/QueryInput";
import ResponseCard from "../components/ResponseCard";
import UploadResultCard from "../components/UploadResultCard";
import LegalUpdatesPanel from "../components/LegalUpdatesPanel";
import ChatMessage from "../components/ChatMessage";
import {
  submitFollowUpQuery,
  submitLegalQuery,
  uploadPdf,
  fetchHistory,
  fetchSavedResponses,
  saveResponse,
  fetchSectionDetail,
  fetchLegalNews,
} from "../../lib/api";

export default function HomePage() {
  const router = useRouter();

  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [jurisdiction, setJurisdiction] = useState("India");
  const [status, setStatus] = useState("Ready to process input");
  const [originalQuery, setOriginalQuery] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [resetTrigger, setResetTrigger] = useState(0);
  const [answer, setAnswer] = useState(
    "Your legal response will appear here after submitting a query."
  );
  const [confidence, setConfidence] = useState(0);
  const [disclaimer, setDisclaimer] = useState(
    "This platform provides legal information for assistance and learning. It does not replace professional legal advice."
  );
  const [explanation, setExplanation] = useState(
    "The platform will explain how the answer was formed using legal retrieval and reasoning."
  );
  const [relevantSections, setRelevantSections] = useState<string[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [recommendLawyer, setRecommendLawyer] = useState(false);
  const [unsupportedQuery, setUnsupportedQuery] = useState(false);

  const [uploadedFilename, setUploadedFilename] = useState("");
  const [uploadedSummary, setUploadedSummary] = useState("");
  const [uploadedExtractedText, setUploadedExtractedText] = useState("");
  const [uploadedSections, setUploadedSections] = useState<string[]>([]);
  const [uploadedKeywords, setUploadedKeywords] = useState<string[]>([]);

  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [legalNews, setLegalNews] = useState<any[]>([]);

  const loadHistory = async () => {
  try {
    const username = localStorage.getItem("nyaya_user");

if (!username) {
  router.push("/login");
  return;
}
    await fetchHistory();
  } catch (error) {
    console.error("Failed to load history:", error);
  }
};

  const loadSavedResponses = async () => {
  try {
    const username = localStorage.getItem("nyaya_user");

if (!username) {
  router.push("/login");
  return;
}
  } catch (error) {
    console.error("Failed to load saved responses:", error);
  }
};

  const loadLegalNews = async () => {
    try {
      const data = await fetchLegalNews();
      setLegalNews(data);
    } catch (error) {
      console.error("Failed to load legal news:", error);
      setLegalNews([]);
    }
  };

useEffect(() => {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("nyaya_user");

  if (!token || !username) {
    router.push("/login");
    return;
  }

  loadHistory();
  loadSavedResponses();
  loadLegalNews();

  const handleOpenSectionDetail = async (event: Event) => {
    const customEvent = event as CustomEvent<{ act: string; section: string }>;

    try {
      const data = await fetchSectionDetail(
        customEvent.detail.act,
        customEvent.detail.section
      );
      setSelectedSection(data);
    } catch {
      alert("Failed to load section details");
    }
  };

  window.addEventListener("open-section-detail", handleOpenSectionDetail);

  return () => {
    window.removeEventListener("open-section-detail", handleOpenSectionDetail);
  };
}, [router]);
  const handleSubmit = async (
    question: string,
    selectedJurisdiction: string
  ) => {
    try {
      setLoading(true);
      setJurisdiction(selectedJurisdiction);
      setStatus("Processing query...");
      setOriginalQuery(question);
      setCurrentQuestion(question);

      setMessages((prev) => [...prev, { role: "user", content: question }]);
      const username = localStorage.getItem("nyaya_user");

if (!username) {
  router.push("/login");
  return;
}
const result = await submitLegalQuery({
  question,
  jurisdiction: selectedJurisdiction,
  document_text: uploadedExtractedText || undefined,
  document_name: uploadedFilename || undefined,
});

      setAnswer(result.answer);
      setConfidence(result.confidence);
      setDisclaimer(result.disclaimer);
      setExplanation(
        result.explanation ||
          "The answer was generated from the detected query intent and mapped legal knowledge."
      );
      setRelevantSections(result.relevant_sections || []);
      setWarning(result.warning || null);
      setFollowUpQuestions(result.follow_up_questions || []);
      setRecommendLawyer(result.recommend_lawyer || false);
      setUnsupportedQuery(result.unsupported_query || false);
      setStatus("Response generated successfully");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.answer },
      ]);

      await loadHistory();
    } catch (error) {
      console.error(error);
      setAnswer("Unable to get a response from the backend.");
      setConfidence(0);
      setExplanation("The request failed while communicating with the server.");
      setRelevantSections([]);
      setWarning("Something went wrong while processing the query.");
      setFollowUpQuestions([]);
      setRecommendLawyer(false);
      setUnsupportedQuery(false);
      setStatus("Error while processing query");
    } finally {
      setLoading(false);
    }
  };

  const handleSectionClick = async (type: string, section: string) => {
    try {
      const data = await fetchSectionDetail(type, section);
      setSelectedSection(data);
    } catch {
      alert("Failed to load section details");
    }
  };

  const handleFollowUpClick = async (followUpQuestion: string) => {
    if (!originalQuery) return;

    try {
      setLoading(true);
      setStatus("Processing follow-up query...");
      setCurrentQuestion(followUpQuestion);

      setMessages((prev) => [
        ...prev,
        { role: "user", content: followUpQuestion },
      ]);

      const result = await submitFollowUpQuery({
        original_query: originalQuery,
        follow_up_question: followUpQuestion,
        jurisdiction,
      });

      setAnswer(result.answer);
      setConfidence(result.confidence);
      setDisclaimer(result.disclaimer);
      setExplanation(
        result.explanation ||
          "The answer was generated from the detected query intent and mapped legal knowledge."
      );
      setRelevantSections(result.relevant_sections || []);
      setWarning(result.warning || null);
      setFollowUpQuestions(result.follow_up_questions || []);
      setRecommendLawyer(result.recommend_lawyer || false);
      setUnsupportedQuery(result.unsupported_query || false);
      setStatus("Follow-up response generated successfully");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.answer },
      ]);

      await loadHistory();
    } catch (error) {
      console.error(error);
      setStatus("Error while processing follow-up query");
    } finally {
      setLoading(false);
    }
  };
const handleSaveResponse = async () => {
  if (!currentQuestion || !answer || confidence === 0) return;

  try {
   const username = localStorage.getItem("nyaya_user");

if (!username) {
  router.push("/login");
  return;
}

    await saveResponse({
  question: currentQuestion,
  answer,
  confidence,
});

    await loadSavedResponses();
    alert("Response saved successfully.");
  } catch (error) {
    console.error(error);
    alert("Failed to save response.");
  }
};

  const handleNewQuery = () => {
    setJurisdiction("India");
    setStatus("Ready to process input");
    setOriginalQuery("");
    setCurrentQuestion("");
    setResetTrigger((prev) => prev + 1);
    setMessages([]);
    setAnswer("Your legal response will appear here after submitting a query.");
    setConfidence(0);
    setDisclaimer(
      "This platform provides legal information for assistance and learning. It does not replace professional legal advice."
    );
    setExplanation(
      "The platform will explain how the answer was formed using legal retrieval and reasoning."
    );
    setRelevantSections([]);
    setWarning(null);
    setFollowUpQuestions([]);
    setRecommendLawyer(false);
    setUnsupportedQuery(false);

    setUploadedFilename("");
    setUploadedSummary("");
    setUploadedExtractedText("");
    setUploadedSections([]);
    setUploadedKeywords([]);
  };

  const handleUpload = async (file: File) => {
    try {
      setLoading(true);
      setStatus("Uploading and analyzing document...");

      const result = await uploadPdf(file);

      setUploadedFilename(result.filename);
      setUploadedSummary(result.summary);
      setUploadedExtractedText(result.extracted_text);
      setUploadedSections(result.relevant_sections || []);
      setUploadedKeywords(result.keywords || []);
      setStatus("Document analyzed successfully");
    } catch (error) {
      console.error(error);
      setStatus("Error while uploading document");
      alert("Failed to upload and analyze PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell premium-bg">
      <Sidebar />

      <main className="main-area">
        <Navbar
          title="AI Legal Assistance Dashboard"
          subtitle="Plain-language legal help with explainable, ethical AI support."
        />

        <div className="home-action-bar compact-action-bar">
          <button
            className="primary-btn"
            type="button"
            onClick={handleNewQuery}
          >
            Start New Query
          </button>
        </div>

        <p className="muted-text" style={{ marginTop: "8px" }}>
          Start a fresh legal query session and reset uploaded document context.
        </p>

        <div className="workspace-grid">
          <section className="workspace-main">
            <QueryInput
              onSubmit={handleSubmit}
              onUpload={handleUpload}
              loading={loading}
              resetTrigger={resetTrigger}
            />

            {messages.length > 0 && (
              <div className="card">
                <h2 className="card-title">Conversation</h2>
                <div className="chat-thread">
                  {messages.map((msg, index) => (
                    <ChatMessage
                      key={`${index}-${msg.role}-${msg.content.slice(0, 10)}`}
                      role={msg.role}
                      content={msg.content}
                    />
                  ))}
                </div>
              </div>
            )}

            <ResponseCard
              question={currentQuestion}
              answer={answer}
              confidence={confidence}
              relevantSections={relevantSections}
              warning={warning}
              recommendLawyer={recommendLawyer}
              unsupportedQuery={unsupportedQuery}
              onSave={handleSaveResponse}
              canSave={!!currentQuestion && !!answer && confidence > 0}
              onSectionClick={handleSectionClick}
            />

            {uploadedFilename && (
              <UploadResultCard
                filename={uploadedFilename}
                summary={uploadedSummary}
                extractedText={uploadedExtractedText}
                relevantSections={uploadedSections}
                keywords={uploadedKeywords}
              />
            )}
          </section>

          <aside className="workspace-side">

            <div className="news-card-sticky">
              <LegalUpdatesPanel items={legalNews} />
            </div>
          </aside>
        </div>

        {selectedSection && (
          <div className="modal">
            <div className="modal-content">
              <h3>
                {selectedSection.act} - Section {selectedSection.section}
              </h3>

              <p>
                <strong>{selectedSection.section_title}</strong>
              </p>

              <p>{selectedSection.description}</p>

              <button
                className="secondary-btn"
                onClick={() => setSelectedSection(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}