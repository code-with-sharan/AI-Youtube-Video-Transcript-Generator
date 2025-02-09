import {useState, useRef} from 'react';
import Video from './video';
import Transcript from './transcript';
import Chatbox from './chatbox';
import { v4 as uuidv4 } from "uuid";

export default function ResultSection({ 
  BACKEND_URL,
  transcript, 
  youtubeUrl,
  extractVideoId,
  question,
  setQuestion,
  chatHistory,
  setChatHistory
}) {

  const [gptloading, setGptLoading] = useState(false) // loading state of the chatbox
  const youtubePlayerRef = useRef(null); // reference to embedded youtube video

  // function to send the question to the gpt and get the response
  const handleSend = async (e) => {
    e.preventDefault();
    setGptLoading(true);
    const id = uuidv4();

    // Add new message with empty gpt response
    setChatHistory(prev => [...prev, { id, userQuestion: question, gptResponse: "" }]);

    try {
      const response = await fetch(`${BACKEND_URL}/api/gpt-response-stream`,{
        method: "POST",
        headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript,
        question,
      }),
    });
    if (!response.ok) throw new Error('Network response error');
    const reader = response.body.getReader(); // creaating reader to read the streaming response body chunk by chunk
    const decoder = new TextDecoder(); // creating decoder to convert the binary chunks into text
    
    let accumulatedText = ''; // Variable to store the accumulated response text as chunks arrive

    while (true) {  // Read chunks from the stream until done
      // Get next chunk from reader - returns {done, value} where value is Uint8Array
      const { done, value } = await reader.read();
      if (done) break; // Exit loop when stream is finished (done=true)

      const chunk = decoder.decode(value, { stream: true }); // Decode binary chunk to text using TextDecoder. stream:true option maintains decoder state between chunks 
      accumulatedText += chunk; // Add decoded chunk text to accumulated response

      // Update chat history to show streaming response
      // Find message with matching id and update its gptResponse
      // Leave other messages unchanged
      setChatHistory(prev => prev.map(msg => 
        msg.id === id ? { ...msg, gptResponse: accumulatedText } : msg
      ));
    }
  } catch (error) {
    console.error('Error:', error);
    setChatHistory(prev => prev.map(msg => 
      msg.id === id ? { ...msg, gptResponse: "Error generating response" } : msg
    ));
    } finally {
      setGptLoading(false)
      setQuestion("")
    }
  };

  return (
    <div className="mt-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Section - Video and Transcript */}
        <div className="flex flex-col gap-6">
          <Video 
            videoId={extractVideoId(youtubeUrl)} 
            youtubePlayerRef={youtubePlayerRef}
          />
          <Transcript 
            transcript={transcript}
            youtubePlayerRef={youtubePlayerRef}
          />
        </div>

        {/* Right Section - Chat Box */}
        <Chatbox 
          gptloading={gptloading}
          question={question}
          setQuestion={setQuestion}
          handleSend={handleSend}
          chatHistory={chatHistory}
        />
      </div>
    </div>
  );
}
