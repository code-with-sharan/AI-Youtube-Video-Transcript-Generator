import React from 'react';

export default function Transcript({ transcript, youtubePlayerRef }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">
        Generated Transcript
      </h2>
      <div className="bg-gray-900 rounded-lg p-4 h-[300px] overflow-y-auto">
        {transcript.map((caption, index) => {
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
                    youtubePlayerRef.current.seekTo(caption.start, true);
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
  );
}
