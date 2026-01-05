// hooks/useVoiceRecognition.ts
import { useState, useEffect, useRef } from "react";

export const useVoiceRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Browser does not support SpeechRecognition");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false; // listen once per click
        recognition.interimResults = false;
        recognition.lang = "en-IN";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const lastResult = event.results[event.results.length - 1][0].transcript;
            setTranscript(lastResult.trim());
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event);
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => recognition.stop();
    }, []);

    const startListening = () => {
        recognitionRef.current?.start();
        setIsListening(true);
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    return { transcript, isListening, startListening, stopListening, setTranscript };
};
