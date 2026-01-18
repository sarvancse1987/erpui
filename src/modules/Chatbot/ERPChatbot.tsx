import React, { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { storage } from "../../services/storageService";
import "../../asset/basiclayout/erp-chatbot.css";

export interface ChatMessage {
  id: string;
  sender: "user" | "agent" | "bot";
  message: string;
  image?: string;
  video?: string;
  fileUrl?: string;
  fileName?: string;
  sessionId?: number;
}

export const ERPChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const sessionIdRef = useRef<number | null>(null);

  const user = storage.getUser();
  const userId = user?.userId ?? 0;
  const userName = user?.userProfileName ?? "Guest";

  // ------------------------------
  // CONNECT TO HUB
  // ------------------------------
  useEffect(() => {
    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:19448/chathub?role=user", {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    hubConnection.on("ReceiveMessage", (res: any) => {
      // Save session ID from server
      if (!sessionIdRef.current && res.sessionId) {
        sessionIdRef.current = res.sessionId;
        console.log("Session established:", res.sessionId);
      }

      // Correct sender logic: user = LEFT, agent = RIGHT
      const senderType: "user" | "agent" | "bot" =
        res.sender || (res.userId === userId ? "user" : "agent");

      const newMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: senderType,
        message: res.message,
        image: res.imageUrl,
        video: res.videoUrl,
        fileUrl: res.fileUrl,
        fileName: res.fileName,
      };

      setMessages(prev => [...prev, newMsg]);
    });

    hubConnection
      .start()
      .then(() => {
        console.log("✅ User connected to ERP ChatHub");
      })
      .catch(err => console.error("❌ SignalR error", err));

    connectionRef.current = hubConnection;

    return () => {
      hubConnection.stop();
    };
  }, [userId]);

  // ------------------------------
  // SEND MESSAGE
  // ------------------------------
  const sendMessage = async (file?: File) => {
    if (!input.trim() && !file) return;
    if (!connectionRef.current) return;

    const messageText = input || file?.name || "";
    setInput(""); // clear input

    try {
      await connectionRef.current.invoke(
        "SendMessage",
        userId,
        userName,
        messageText
      );
    } catch (err) {
      console.error("❌ Send failed", err);
    }
  };

  return (
    <>
      <button className="erp-chatbot-fab" onClick={() => setOpen(!open)}>
        💬
      </button>

      {open && (
        <div className="erp-chatbot-window">
          <div className="erp-chatbot-header">
            <span>ERP Assistant</span>
            <button className="erp-chatbot-close" onClick={() => setOpen(false)}>
              ✖
            </button>
          </div>

          <div className="erp-chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`erp-chatbot-row ${msg.sender}`}>
                <div className={`erp-chatbot-bubble ${msg.sender}`}>
                  {msg.message && <div>{msg.message}</div>}
                  {msg.image && <img src={msg.image} className="erp-chatbot-image" alt="chat-img" />}
                  {msg.video && <video src={msg.video} controls className="erp-chatbot-video" />}
                  {msg.fileUrl && (
                    <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                      📎 {msg.fileName}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="erp-chatbot-input">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask ERP..."
              className="erp-chatbot-textbox"
            />
            <input
              type="file"
              hidden
              ref={fileRef}
              onChange={e => e.target.files?.[0] && sendMessage(e.target.files[0])}
            />
            <button onClick={() => fileRef.current?.click()}>📎</button>
            <button onClick={() => sendMessage()}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};
