"use client";

import { useRef, useState } from "react";
import { Conversation } from "@elevenlabs/client";
import './styles.css';


interface Section {
  id: string;
  title: string;
  listen_url: string;
}

export default function Home() {
  const [conversation, setConversation] = useState<any>(null);
  const [status, setStatus] = useState("disconnected");
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🎧 Client tool
  const clientTools = {
    playAudioBook: async ({ title }: { title: string }) => {
      console.log("User requested audiobook:", title);

      const res = await fetch(`/api/librivox?title=${encodeURIComponent(title)}&extended=1`);
      const data = await res.json();

      if (!data.books || data.books.length === 0) return "No audiobook found";

      const book = data.books[0];
      if (!book.sections || book.sections.length === 0) return "No playable sections found";

      // Store sections in state so UI renders buttons
      setSections(book.sections);
      const response = {
        success: "true",
        message: `Found ${book.sections.length} sections for ${book.title}. Pick one below.`
      }

      return `Found ${book.sections.length} sections for ${book.title}. Pick one below.`;
    },
  };

  const startConversation = async () => {
    try {
      audioRef.current = new Audio();

      const conv = await Conversation.startSession({
        agentId: "agent_9201k4v3j6g8fs7vxt14qxngw8n5",
        connectionType: "webrtc",
        clientTools,
        onConnect: () => setStatus("connected"),
        onDisconnect: () => setStatus("disconnected"),
        onError: (err) => console.error("Conversation error:", err),
      });

      setConversation(conv);
    } catch (err) {
      console.error("Failed to start conversation:", err);
    }
  };

  const stopConversation = async () => {
    if (conversation) {
      await conversation.endSession();
      setConversation(null);
      setStatus("disconnected");
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setCurrentSection(null);
    }
  };

  const playSection = async (section: Section) => {
    // Disconnect agent before playing audio
    await stopConversation();

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = section.listen_url;
    audioRef.current.onended = () => setIsPlaying(false);

    try {
      await audioRef.current.play();
      setCurrentSection(section);
      setIsPlaying(true);
      console.log(`Now playing: ${section.title}`);
    } catch (err) {
      console.error("Playback error:", err);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumeAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // page.tsx
// ... (keep all your imports and logic)
return (
  <main className="main-container">
    <h1 className="heading">Social Companion</h1>
    <div className="button-group">
      <button
        onClick={startConversation}
        disabled={status === "connected"}
        className="button button-primary"
      >
        {status === "connected" ? "Agent Active" : "Call Agent"}
      </button>
      {status === "connected" && (
        <button
          onClick={stopConversation}
          className="button button-danger"
        >
          Stop
        </button>
      )}
    </div>
    <p className="status">Status: {status}</p>
    {/* Sections */}
    {sections.length > 0 && (
      <div>
        <h2 className="heading">Available Sections</h2>
        <div className="sections-grid">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => playSection(s)}
              className="section-button"
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>
    )}
    {/* Audio controls */}
    {currentSection && (
      <div className="audio-controls">
        <p className="audio-title">
          🎵 Now Playing: <span>{currentSection.title}</span>
        </p>
        <div className="button-group">
          {isPlaying ? (
            <button
              onClick={pauseAudio}
              className="button button-warning"
            >
              Pause
            </button>
          ) : (
            <button
              onClick={resumeAudio}
              className="button button-success"
            >
              Resume
            </button>
          )}
          <button
            onClick={stopConversation}
            className="button button-danger"
          >
            Stop
          </button>
        </div>
      </div>
    )}
  </main>
);

}
