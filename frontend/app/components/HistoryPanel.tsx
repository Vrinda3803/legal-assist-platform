type HistoryItem = {
  question: string;
  answer: string;
  confidence: number;
};

type HistoryPanelProps = {
  items: HistoryItem[];
};

export default function HistoryPanel({ items }: HistoryPanelProps) {
  return (
    <div className="card">
      <h2 className="card-title">Query History</h2>

      <div className="list">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div className="list-item" key={index}>
              <strong>Q:</strong> {item.question}
              <div style={{ height: 8 }} />
              <p className="muted-text">{item.answer}</p>
              <div style={{ height: 8 }} />
              <span className="badge confidence">
                Confidence: {item.confidence}%
              </span>
            </div>
          ))
        ) : (
          <div className="list-item">No query history available.</div>
        )}
      </div>
    </div>
  );
}