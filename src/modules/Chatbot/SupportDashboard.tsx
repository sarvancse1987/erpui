import React, { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { storage } from "../../services/storageService";

// Chat message interface
interface ChatMessage {
    id: string;
    sender: "user" | "agent" | "bot";
    message: string;
    sessionId: number;
}

// Chat session interface
interface ChatSession {
    id: number;
    userName: string;
}

export const SupportDashboard: React.FC = () => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [selectedSession, setSelectedSession] = useState<number | null>(null);
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const [input, setInput] = useState("");

    // ------------------------------
    // Initialize SignalR connection
    // ------------------------------
    useEffect(() => {
        const user = storage.getUser();
        const hubConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:19448/chathub?role=agent")
            .withAutomaticReconnect()
            .build();

        const startConnection = async () => {
            try {
                await hubConnection.start();
                console.log("Agent connected to SignalR hub");

                debugger
                // Join support team group (no arguments)
                await hubConnection.invoke("JoinSession", Number(user?.userId));

                // Listen for new messages from users
                hubConnection.on("NewUserMessage", (msg: ChatMessage) => {
                    // Add session if not exists
                    setSessions(prev => {
                        if (!prev.find(s => s.id === msg.sessionId)) {
                            return [...prev, { id: msg.sessionId, userName: msg.sender === "user" ? "User" : "Unknown" }];
                        }
                        return prev;
                    });

                    // Add message to state
                    setMessages(prev => [...prev, msg]);
                });

                connectionRef.current = hubConnection;
            } catch (err) {
                console.error("SignalR connection error:", err);
            }
        };

        startConnection();

        // Cleanup on unmount
        return () => {
            hubConnection.stop().catch(err => console.error("Error stopping hub connection:", err));
        };
    }, []);

    // ------------------------------
    // Send agent message
    // ------------------------------
    const sendMessage = async () => {
        if (!input.trim() || !selectedSession || !connectionRef.current) return;

        const msg: ChatMessage = {
            id: crypto.randomUUID(),
            sender: "agent",
            message: input,
            sessionId: selectedSession
        };

        // Optimistic UI update
        setMessages(prev => [...prev, msg]);
        setInput("");

        try {
            await connectionRef.current.invoke("SendMessageFromAgent", selectedSession, msg.message);
        } catch (err) {
            console.error("Send message error:", err);
        }
    };

    // ------------------------------
    // Select a session
    // ------------------------------
    const selectSession = async (id: number) => {
        setSelectedSession(id);

        // Join session group for multi-device support
        try {
            await connectionRef.current?.invoke("JoinSession", id);
        } catch (err) {
            console.error("JoinSession error:", err);
        }
    };

    return (
        <div style={{ display: "flex", height: "90vh" }}>
            {/* Left panel: sessions */}
            <div style={{ width: "250px", borderRight: "1px solid #ccc", padding: "10px" }}>
                <h3>Active Sessions</h3>
                {sessions.map(s => (
                    <div
                        key={s.id}
                        onClick={() => selectSession(s.id)}
                        style={{
                            cursor: "pointer",
                            marginBottom: "5px",
                            fontWeight: selectedSession === s.id ? "bold" : "normal"
                        }}
                    >
                        {s.userName} (Session {s.id})
                    </div>
                ))}
            </div>

            {/* Right panel: chat messages */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "10px" }}>
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        border: "1px solid #ccc",
                        padding: "10px",
                        backgroundColor: "#f9f9f9"
                    }}
                >
                    {messages
                        .filter(m => m.sessionId === selectedSession)
                        .map(msg => (
                            <div
                                key={msg.id}
                                style={{
                                    margin: "5px 0",
                                    textAlign: msg.sender === "agent" ? "right" : "left"
                                }}
                            >
                                <b>{msg.sender === "agent" ? "You" : msg.sender}:</b> {msg.message}
                            </div>
                        ))}
                </div>

                {/* Input area */}
                <div style={{ marginTop: "10px", display: "flex" }}>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type message..."
                        style={{ flex: 1, marginRight: "5px", padding: "5px" }}
                        onKeyDown={e => e.key === "Enter" && sendMessage()}
                    />
                    <button onClick={sendMessage} style={{ padding: "5px 10px" }}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};
