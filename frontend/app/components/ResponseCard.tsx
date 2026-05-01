type ResponseCardProps = {
  question: string;
  answer: string;
  confidence: number;
  relevantSections: string[];
  warning?: string | null;
  recommendLawyer?: boolean;
  unsupportedQuery?: boolean;
  onSave?: () => Promise<void>;
  canSave?: boolean;
  onSectionClick?: (act: string, section: string) => void;
};

export default function ResponseCard({
  question,
  answer,
  confidence,
  relevantSections,
  warning,
  recommendLawyer,
  unsupportedQuery,
  onSave,
  canSave,
  onSectionClick,
}: ResponseCardProps) {
  const isEmptyResponse =
    confidence === 0 &&
    (answer === "Your legal response will appear here after submitting a query." ||
      !answer.trim());

  return (
    <div className="card">
      <div className="card-header-row">
        <h2 className="card-title">AI Response</h2>

        {onSave && (
          <button
            className="secondary-btn"
            type="button"
            onClick={onSave}
            disabled={!canSave}
          >
            Save Response
          </button>
        )}
      </div>

      <span className="badge confidence">Confidence: {confidence}%</span>

      <div style={{ height: 12 }} />

      {isEmptyResponse ? (
        <div className="empty-state">
          Ask a legal question to get AI-powered legal guidance.
        </div>
      ) : (
        <p className="response-text">{answer}</p>
      )}

      {warning && (
        <>
          <div style={{ height: 12 }} />
          <div className="warning-box">{warning}</div>
        </>
      )}

      {unsupportedQuery && (
        <>
          <div style={{ height: 12 }} />
          <div className="warning-box">
            This query appears outside the supported scope of the current legal
            information system.
          </div>
        </>
      )}

      {recommendLawyer && (
        <>
          <div style={{ height: 12 }} />
          <div className="lawyer-box">
            Recommendation: Please consult a qualified legal professional for a
            more reliable interpretation.
          </div>
        </>
      )}

      <div style={{ height: 18 }} />

      <h3 className="card-title">Relevant Legal Provisions</h3>

      <div className="list">
        {relevantSections.length > 0 ? (
          relevantSections.map((section, index) => {
            const match = section.match(
              /(IPC|CrPC)\s*-\s*Section\s+([0-9A-Za-z]+)/i
            );

            const act = match ? match[1] : "";
            const secNo = match ? match[2] : "";

            if (act && secNo && onSectionClick) {
              return (
                <button
                  key={`${section}-${index}`}
                  className="list-item section-button"
                  type="button"
                  onClick={() => onSectionClick(act, secNo)}
                >
                  {section}
                </button>
              );
            }

            return (
              <div className="list-item" key={`${section}-${index}`}>
                {section}
              </div>
            );
          })
        ) : (
          <div className="list-item">No specific sections identified yet.</div>
        )}
      </div>
    </div>
  );
}