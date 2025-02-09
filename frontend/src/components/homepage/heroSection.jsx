import {useState} from 'react';
import axios from 'axios';

export default function HeroSection({ BACKEND_URL,youtubeUrl, setTranscript, setChatHistory, setYoutubeUrl, extractVideoId }) {

  const [loading, setLoading] = useState(false); // loading state of herosection

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
      setLoading(false);
    } else {
      setTranscript("Error fetching captions");
      setLoading(false);
    }
  };
  
    return (
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
    </div>
  );
}
