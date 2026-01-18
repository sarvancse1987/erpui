import React, { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { ChatMessage } from "../../models/ChatMessage";
import "../../asset/basiclayout/erp-chatbot.css";

export const ERPChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  const userId = 1;
  const userName = "Boss";
  const numericSessionId = 123; // Must exist in DB or create via hub

  useEffect(() => {
    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:19448/chathub", { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    const startHub = async () => {
      try {
        await hubConnection.start();
        console.log("✅ SignalR connected");

        // Join session safely
        await hubConnection.invoke("JoinSession", numericSessionId);
        console.log(`Joined session ${numericSessionId}`);

        // Listen for messages from hub
        hubConnection.on("ReceiveMessage", (res: any) => {
          const senderType: "user" | "agent" | "bot" = res.isBot
            ? "bot"
            : res.userId === userId
            ? "user"
            : "agent";

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

        setConnection(hubConnection);
      } catch (err) {
        console.error("❌ SignalR connection error", err);
      }
    };

    startHub();

    // Cleanup on unmount
    return () => {
      if (hubConnection.state === signalR.HubConnectionState.Connected) {
        hubConnection
          .invoke("LeaveSession", numericSessionId)
          .catch(err => console.error("LeaveSession failed", err));
        hubConnection.stop().catch(err => console.error("SignalR stop failed", err));
      }
    };
  }, []);

  // Send a message
  const sendMessage = async (file?: File) => {
    if (!input.trim() && !file) return;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      console.error("SignalR not connected");
      return;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      message: input || file?.name || "",
      fileName: file?.name,
      fileUrl: "", // Optional: handle file upload
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      await connection.invoke("SendMessage", userId, userName, input || "");
      console.log("Message sent to hub");
    } catch (err) {
      console.error("SignalR send error:", err);
    }
  };

  return (
    <>
      <button className="erp-chatbot-fab" onClick={() => setOpen(!open)}>💬</button>

      {open && (
        <div className="erp-chatbot-window">
          <div className="erp-chatbot-header">
            <span>ERP Assistant</span>
            <button className="erp-chatbot-close" onClick={() => setOpen(false)}>✖</button>
          </div>

          <div className="erp-chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`erp-chatbot-row ${msg.sender}`}>
                <div className={`erp-chatbot-bubble ${msg.sender}`}>
                  {msg.message && <div>{msg.message}</div>}
                  {msg.image && <img src={msg.image} className="erp-chatbot-image" />}
                  {msg.video && <video src={msg.video} controls className="erp-chatbot-video" />}
                  {msg.fileUrl && <a href={msg.fileUrl} target="_blank" rel="noreferrer">📎 {msg.fileName}</a>}
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
