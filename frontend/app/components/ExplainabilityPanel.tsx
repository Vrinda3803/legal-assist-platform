type ExplainabilityPanelProps = {
  explanation: string;
  disclaimer: string;
  followUpQuestions: string[];
  onFollowUpClick: (question: string) => Promise<void>;
  loading: boolean;
};

export default function ExplainabilityPanel({
  explanation,
  disclaimer,
  followUpQuestions,
  onFollowUpClick,
  loading,
}: ExplainabilityPanelProps) {
  return (
    <div className="card">
      <h2 className="card-title">Explainability & Safety</h2>

      <div className="list">
        <div className="list-item">
          <strong>Why this answer?</strong>
          <p className="muted-text">{explanation}</p>
        </div>

        <div className="list-item">
          <strong>Ambiguity / Clarification Support</strong>
          <p className="muted-text">
            The system checks whether the query is incomplete, ambiguous, or
            needs more details before giving a stronger legal explanation.
          </p>
        </div>
      </div>

      <div style={{ height: 16 }} />

      <h3 className="card-title">Suggested Follow-up Questions</h3>
      <div className="list">
        {followUpQuestions.length > 0 ? (
          followUpQuestions.map((question, index) => (
            <button
              key={index}
              className="followup-btn"
              onClick={() => onFollowUpClick(question)}
              disabled={loading}
              type="button"
            >
              {question}
            </button>
          ))
        ) : (
          <div className="list-item">No follow-up questions suggested.</div>
        )}
      </div>

      <div style={{ height: 16 }} />

      <div className="disclaimer">{disclaimer}</div>
    </div>
  );
}