import { useState } from "react";
const BACKEND_URL = "http://localhost:8080";
// const BACKEND_URL = "https://ai-youtube-video-transcript-generator.onrender.com"

import HeroSection from './heroSection';
import ResultSection from './resultsSection/resultSection';
import Footer from '../footer';

export default function Homepage() {
  const [youtubeUrl, setYoutubeUrl] = useState(""); // youtube video url
  const [transcript, setTranscript] = useState([]); // transcript of the youtube video to show in transcript box
  const [question, setQuestion] = useState(""); // user question
  const [chatHistory, setChatHistory] = useState([
    { id: "", userQuestion: "", gptResponse: "" },
  ]); // chat history of user with gpt

  // function to extract the video id from the youtube url
  function extractVideoId(url) {
    const regex = /(?:v=|\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <HeroSection 
        BACKEND_URL={BACKEND_URL}
        youtubeUrl={youtubeUrl}
        setYoutubeUrl={setYoutubeUrl}
        setTranscript={setTranscript}
        setChatHistory={setChatHistory}
        extractVideoId={extractVideoId}
      />
      
      {transcript && (
        <ResultSection 
          BACKEND_URL={BACKEND_URL}
          transcript={transcript}
          youtubeUrl={youtubeUrl}
          extractVideoId={extractVideoId}
          question={question}
          setQuestion={setQuestion}
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
        />
      )}

      <Footer transcript={transcript} />
    </div>
  );
}
