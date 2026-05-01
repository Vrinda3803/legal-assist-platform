type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={`chat-row ${role === "user" ? "chat-row-user" : "chat-row-assistant"}`}>
      <div className={`chat-bubble ${role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"}`}>
        {content}
      </div>
    </div>
  );
}