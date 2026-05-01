"use client";

import { useEffect, useRef, useState } from "react";

type QueryInputProps = {
  onSubmit: (question: string, jurisdiction: string) => Promise<void>;
  onUpload: (file: File) => Promise<void>;
  loading: boolean;
  resetTrigger: number;
};

export default function QueryInput({
  onSubmit,
  onUpload,
  loading,
  resetTrigger,
}: QueryInputProps) {
  const [question, setQuestion] = useState("");
  const [jurisdiction, setJurisdiction] = useState("India");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuestion("");
    setJurisdiction("India");
    setIsListening(false);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, [resetTrigger]);

  const handleSubmit = async () => {
    if (!question.trim()) {
      alert("Please enter a legal question.");
      return;
    }

    await onSubmit(question, jurisdiction);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please upload a PDF file only.");
      return;
    }

    await onUpload(file);
    e.target.value = "";
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuestion((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert("Voice input failed. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Ask a Legal Question</h2>

      <div className="query-box">
        <textarea
          className="textarea"
          placeholder="Type your legal question here or use voice input..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <div className="toolbar">
          <select
            className="select"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
          >
            <option>India</option>
            <option>Kerala</option>
            <option>General</option>
          </select>

          <button
            className="secondary-btn"
            type="button"
            onClick={handleUploadClick}
            disabled={loading}
          >
            Upload PDF
          </button>

          {!isListening ? (
            <button
              className="secondary-btn"
              type="button"
              onClick={startVoiceInput}
              disabled={loading}
            >
              Start Voice Input
            </button>
          ) : (
            <button
              className="secondary-btn"
              type="button"
              onClick={stopVoiceInput}
            >
              Stop Listening...
            </button>
          )}

          <button
            className="primary-btn"
            type="button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Query"}
          </button>
        </div>

        {isListening && (
          <p className="muted-text">Listening... please speak clearly.</p>
        )}
      </div>
    </div>
  );
}