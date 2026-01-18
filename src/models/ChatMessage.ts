export interface ChatMessage {
  id: string;
  sender: "user" | "bot" | "agent";
  message?: string;
  image?: string;
  video?: string;
  fileUrl?: string;
  fileName?: string;
}
