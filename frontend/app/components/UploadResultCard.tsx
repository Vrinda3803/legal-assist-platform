type UploadResultCardProps = {
  filename: string;
  summary: string;
  extractedText: string;
  relevantSections: string[];
  keywords: string[];
};

export default function UploadResultCard({
  filename,
  summary,
  extractedText,
  relevantSections,
  keywords,
}: UploadResultCardProps) {
  return (
    <div className="card upload-card">
      <h2 className="card-title">Uploaded Document Analysis</h2>

      <div className="list">
        <div className="list-item">
          <strong>Filename</strong>
          <p>{filename}</p>
        </div>

        <div className="list-item">
          <strong>Summary</strong>
          <p>{summary}</p>
        </div>

        <div className="list-item">
          <strong>Extracted Text Preview</strong>
          <p className="muted-text">{extractedText}</p>
        </div>

        <div className="list-item">
          <strong>Keywords</strong>
          <p>{keywords.length > 0 ? keywords.join(", ") : "No keywords extracted."}</p>
        </div>
      </div>

      <div style={{ height: 16 }} />

      <h3 className="card-title">Matched Legal Sections</h3>

<div className="list">
  {relevantSections.length > 0 ? (
    relevantSections.map((section, index) => {
      const match = section.match(/^(IPC|CrPC)\s*-\s*Section\s*([0-9A-Za-z]+)/i);

      return (
        <button
          key={index}
          className="list-item section-button"
          type="button"
          onClick={() => {
            if (!match) return;

            const act = match[1];
            const sectionNumber = match[2];

            window.dispatchEvent(
              new CustomEvent("open-section-detail", {
                detail: { act, section: sectionNumber },
              })
            );
          }}
        >
          {section}
        </button>
      );
    })
  ) : (
    <div className="list-item">No relevant legal sections identified.</div>
  )}
</div>
    </div>
  );
}