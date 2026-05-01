type SessionSummaryProps = {
  jurisdiction: string;
  mode: string;
  status: string;
};

export default function SessionSummary({
  jurisdiction,
  mode,
  status,
}: SessionSummaryProps) {
  return (
    <div className="card">
      <h2 className="card-title">Session Summary</h2>

      <div className="list">
        <div className="list-item">
          <strong>Jurisdiction</strong>
          <p>{jurisdiction}</p>
        </div>

        <div className="list-item">
          <strong>Mode</strong>
          <p>{mode}</p>
        </div>

        <div className="list-item">
          <strong>Status</strong>
          <p>{status}</p>
        </div>
      </div>
    </div>
  );
}