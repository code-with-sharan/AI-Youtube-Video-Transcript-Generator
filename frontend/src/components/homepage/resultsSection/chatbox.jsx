import {React, useRef, useEffect, useState} from 'react';
import Markdown from "react-markdown";

export default function Chatbox({ gptloading, question, setQuestion, handleSend, chatHistory }) {
  
    const chatBoxRef = useRef(null); // reference to chatbox
    const inputRef = useRef(null); // reference to input field of chatbox
    
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
  
    return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">
        Chat with GPT
      </h2>
      <div className="bg-gray-900 rounded-lg p-4 h-[700px] flex flex-col">
        <div ref={chatBoxRef} className="flex-1 overflow-y-auto mb-4">
          {chatHistory.map((message) => (                        
            <div key={message.id} className="mb-4">
              {message.userQuestion && (
                <div className="flex text-left justify-end mb-2">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-lg max-w-[80%]">
                    {message.userQuestion}
                  </div>
                </div>
              )}
              {message.gptResponse ? (
                <div className="flex text-left justify-start">
                  <div className="bg-purple-500 text-white px-4 py-2 rounded-lg max-w-[80%]">
                    <Markdown
                      components={{
                        ol: ({ children }) => (
                          <ol className="list-decimal ml-4 mt-2">{children}</ol>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc ml-4 mt-2">{children}</ul>
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
            disabled={gptloading}
            placeholder="Ask something about the video..."
            className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={gptloading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
