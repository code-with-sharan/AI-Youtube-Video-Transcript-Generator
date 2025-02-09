import React from 'react';
import YouTube from 'react-youtube';

export default function Video({ videoId, youtubePlayerRef }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">Video</h2>
      <div className="aspect-w-16 aspect-h-9">
        <YouTube
          videoId={videoId}
          opts={{
            height: "300",
            width: "100%",
            playerVars: {
              // Add any player parameters here (autoplay, controls, etc)
            },
          }}
          onReady={(event) => {
            youtubePlayerRef.current = event.target;
          }}
          className="w-full h-[300px] rounded-lg"
        />
      </div>
    </div>
  );
}
