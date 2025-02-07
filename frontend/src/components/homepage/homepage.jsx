import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Markdown from "react-markdown";
const BACKEND_URL = "http://localhost:8010";
// const BACKEND_URL = "https://ai-youtube-video-transcript-generator.onrender.com"
import YouTube from "react-youtube";

export default function Homepage() {
  const [youtubeUrl, setYoutubeUrl] = useState(""); // youtube video url
  const [transcript, setTranscript] = useState([]); // transcript of the youtube video
  const [loading, setLoading] = useState(false); // loading state
  const [question, setQuestion] = useState(""); // user question
  const [isGeneratingGptResponse, setIsGeneratingGptResponse] = useState(false); // loading state of generating response in chatbox
  const [chatHistory, setChatHistory] = useState([
    { id: "", userQuestion: "", gptResponse: "" },
  ]); // chat history
  const chatBoxRef = useRef(null); // reference to chatbox
  const inputRef = useRef(null); // reference to input field of chatbox
  const youtubePlayerRef = useRef(null); // reference to embedded youtube video

  // Scroll to bottom of chat whenever chatHistory updates
  useEffect(() => {
    // This code automatically scrolls the chat box to the bottom whenever new messages are added
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }

    if (inputRef.current) {
      inputRef.current.value = ""; // Clear the input field value directly using the ref whenever input field is updated
    }
  }, [chatHistory, inputRef]);

  // function to extract the video id from the youtube url
  function extractVideoId(url) {
    const regex = /(?:v=|\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  // function to submit the youtube url and get the transcript
  const handleSubmitYoutubeUrl = async (e) => {
    e.preventDefault();
    setLoading(true);
    const videoId = extractVideoId(youtubeUrl);

    const response = await axios.post(`${BACKEND_URL}/api/transcript`, {
      videoId,
    });
    if (response.data.success) {
      setTranscript(response.data.data);
        
      // Reset chat history when new transcript is loaded
      setChatHistory([{ id: "", userQuestion: "", gptResponse: "" }]);
      // Clear chat input from chatbox if there's any text in it
      if (inputRef.current) {
        inputRef.current.value = "";
        setQuestion("");
      }
      setLoading(false);
    } else {
      setTranscript("Error fetching captions");
      setLoading(false);
    }
  };

  // function to send the question to the gpt and get the response
  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
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
    // Create a reader to read the streaming response body chunk by chunk
    const reader = response.body.getReader();
    // Create a decoder to convert the binary chunks into text
    const decoder = new TextDecoder();
    // Variable to store the accumulated response text as chunks arrive
    let accumulatedText = '';

    // Read chunks from the stream until done
    while (true) {
      // Get next chunk from reader - returns {done, value} where value is Uint8Array
      const { done, value } = await reader.read();
      // Exit loop when stream is finished (done=true)
      if (done) break;
      
      // Decode binary chunk to text using TextDecoder
      // stream:true option maintains decoder state between chunks
      const chunk = decoder.decode(value, { stream: true });
      // Add decoded chunk text to accumulated response
      accumulatedText += chunk;

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
      setLoading(false)
      setQuestion("")
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            YouTube Transcript Generator
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Get accurate transcripts from any YouTube video in seconds
            <br /> and chat with the AI assistant
          </p>

          {/* Search Form */}
          <form onSubmit={handleSubmitYoutubeUrl} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Paste YouTube URL here..."
                value={youtubeUrl}
                required
                disabled={loading}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="flex-1 px-6 py-4 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Chat with Video"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {transcript && (
          <div className="mt-12 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Section - Video and Transcript */}
              <div className="flex flex-col gap-6">
                {/* Embedded Video */}
                <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-200">
                    Video
                  </h2>
                  <div className="aspect-w-16 aspect-h-9">
                    <YouTube
                      videoId={extractVideoId(youtubeUrl)}
                      opts={{
                        height: "300",
                        width: "100%",
                        playerVars: {
                          // Add any player parameters here (autoplay, controls, etc)
                        },
                      }}
                      onReady={(event) => {
                        // When YouTube player is ready, save a reference to it
                        // so we can control it later (like seeking to timestamps)
                        youtubePlayerRef.current = event.target;
                      }}
                      className="w-full h-[300px] rounded-lg"
                    />
                  </div>
                </div>

                {/* Transcript Box */}
                <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-200">
                    Generated Transcript
                  </h2>
                  <div className="bg-gray-900 rounded-lg p-4 h-[300px] overflow-y-auto">
                    {transcript.map((caption, index) => {
                    //   const hours = Math.floor(caption.start / 3600).toString().padStart(2, '0')
                      const minutes = Math.floor(caption.start / 60)
                        .toString()
                        .padStart(2, "0");
                      const seconds = Math.floor(caption.start % 60)
                        .toString()
                        .padStart(2, "0");

                      return (
                        <p
                          key={index}
                          className="text-gray-300 text-justify whitespace-pre-line"
                        >
                          <span
                            className="text-blue-400 hover:text-blue-300 cursor-pointer"
                            onClick={() => {
                              if (youtubePlayerRef.current) {
                                youtubePlayerRef.current.seekTo(
                                  caption.start,
                                  true
                                );
                              }
                            }}
                          >
                            {`${minutes}:${seconds}`}
                          </span>{" "}
                          <br /> {caption.text}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Section - Chat Box */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-gray-200">
                  Chat with GPT
                </h2>
                <div className="bg-gray-900 rounded-lg p-4 h-[700px] flex flex-col">
                  <div ref={chatBoxRef} className="flex-1 overflow-y-auto mb-4">
                    {/* Chat messages would go here */}
                    {chatHistory.map((message) => (                        
                      <div key={message.id} className="mb-4">
                        {/* User Question */}
                        {message.userQuestion && (
                          <div className="flex text-left justify-end mb-2">
                            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg max-w-[80%]">
                              {message.userQuestion}
                            </div>
                          </div>
                        )}
                        {/* GPT Response */}
                        {message.gptResponse ? (
                          <div className="flex text-left justify-start">
                            <div className="bg-purple-500 text-white px-4 py-2 rounded-lg max-w-[80%]">
                              <Markdown
                                components={{
                                  ol: ({ children }) => (
                                    <ol className="list-decimal ml-4 mt-2">
                                      {children}
                                    </ol>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="list-disc ml-4 mt-2">
                                      {children}
                                    </ul>
                                  ),
                                  li: ({ children }) => (
                                    <li className="ml-4 mt-2">{children}</li>
                                  ),
                                  p: ({ children }) => (
                                    <p className="mb-2 last:mb-0">{children}</p>
                                  ),
                                  code: ({ children }) => (
                                    <code className="bg-gray-700 px-1 py-0.5 rounded">
                                      {children}
                                    </code>
                                  ),
                                }}
                              >
                                {message.gptResponse}
                              </Markdown>
                            </div>
                          </div>
                        ) : (
                          message.userQuestion && (
                            <div className="flex text-left justify-start">
                              <div className=" text-white px-4 py-2 rounded-lg max-w-[80%]">
                                <div className="flex items-center">
                                  Thinking
                                  <span className="font-bold ml-1">
                                    <span className="animate-bounce inline-block">.</span>
                                    <span className="animate-bounce inline-block" style={{animationDelay: "150ms"}}>.</span>
                                    <span className="animate-bounce inline-block" style={{animationDelay: "300ms"}}>.</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSend} className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={question}
                      required
                      onChange={(e) => setQuestion(e.target.value)}
                      disabled={loading}
                      placeholder="Ask something about the video..."
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className={`${
          !transcript ? "fixed" : ""
        } bottom-0 left-0 right-0 py-8 border-t border-gray-800`}
      >
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
          <p>Made with ❤️ by Sharan</p>
        </div>
      </footer>
    </div>
  );
}
